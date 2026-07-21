import { NextResponse } from "next/server";
import { ensureSchema, query, queryValue } from "@/lib/db";

type RevenueBreakdownRow = {
  year: number;
  month: number;
  revenue: string;
  labour_amount: string;
  purchase_amount: string;
  finishing_amount: string;
  profit: string;
};

export async function GET() {
  try {
    await ensureSchema();

    const monthlyBreakdownRows = await query<RevenueBreakdownRow>(
      `
      WITH month_keys AS (
        SELECT DATE_TRUNC('month', sale_date)::date AS month_start FROM sales
        UNION
        SELECT DATE_TRUNC('month', transaction_date)::date AS month_start FROM labour_transactions
        UNION
        SELECT DATE_TRUNC('month', purchase_date)::date AS month_start FROM purchases
        UNION
        SELECT DATE_TRUNC('month', transaction_date)::date AS month_start FROM finishing_transactions
      )
      SELECT
        EXTRACT(YEAR FROM mk.month_start)::int AS year,
        EXTRACT(MONTH FROM mk.month_start)::int AS month,
        COALESCE(s.revenue, 0)::numeric(14,2) AS revenue,
        COALESCE(l.labour_amount, 0)::numeric(14,2) AS labour_amount,
        COALESCE(p.purchase_amount, 0)::numeric(14,2) AS purchase_amount,
        COALESCE(f.finishing_amount, 0)::numeric(14,2) AS finishing_amount,
        (
          COALESCE(s.revenue, 0)
          - (COALESCE(l.labour_amount, 0) + COALESCE(p.purchase_amount, 0) + COALESCE(f.finishing_amount, 0))
        )::numeric(14,2) AS profit
      FROM month_keys mk
      LEFT JOIN (
        SELECT DATE_TRUNC('month', sale_date)::date AS month_start, SUM(total_amount) AS revenue
        FROM sales
        GROUP BY DATE_TRUNC('month', sale_date)
      ) s ON s.month_start = mk.month_start
      LEFT JOIN (
        SELECT DATE_TRUNC('month', transaction_date)::date AS month_start, SUM(amount_given) AS labour_amount
        FROM labour_transactions
        GROUP BY DATE_TRUNC('month', transaction_date)
      ) l ON l.month_start = mk.month_start
      LEFT JOIN (
        SELECT DATE_TRUNC('month', purchase_date)::date AS month_start, SUM(total_cost) AS purchase_amount
        FROM purchases
        GROUP BY DATE_TRUNC('month', purchase_date)
      ) p ON p.month_start = mk.month_start
      LEFT JOIN (
        SELECT
          DATE_TRUNC('month', transaction_date)::date AS month_start,
          SUM(COALESCE(rate_per_piece, 0) * COALESCE(finished_chains_received, 0)) AS finishing_amount
        FROM finishing_transactions
        GROUP BY DATE_TRUNC('month', transaction_date)
      ) f ON f.month_start = mk.month_start
      ORDER BY year DESC, month DESC
      `,
    );

    const totalRevenue = await queryValue("SELECT COALESCE(SUM(total_amount), 0) AS value FROM sales");
    const currentMonthRevenue = await queryValue(
      `
      SELECT COALESCE(SUM(total_amount), 0) AS value
      FROM sales
      WHERE DATE_TRUNC('month', sale_date) = DATE_TRUNC('month', CURRENT_DATE)
      `,
    );

    return NextResponse.json(
      {
        totalRevenue,
        currentMonthRevenue,
        monthlyBreakdown: monthlyBreakdownRows.map((row) => ({
          year: row.year,
          month: row.month,
          revenue: Number(row.revenue),
          labourAmount: Number(row.labour_amount),
          purchaseAmount: Number(row.purchase_amount),
          finishingAmount: Number(row.finishing_amount),
          profit: Number(row.profit),
        })),
      },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load monthly revenue";
    return NextResponse.json({ message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { ensureSchema, query } from "@/lib/db";

type LabourRow = {
  id: number;
  name: string;
  phone: string;
  rate_ot: string | null;
  rate_medium: string | null;
  active: boolean;
};

function mapLabour(row: LabourRow) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    rateOT: row.rate_ot ? Number(row.rate_ot) : undefined,
    rateMedium: row.rate_medium ? Number(row.rate_medium) : undefined,
    active: row.active,
  };
}

export async function GET() {
  try {
    await ensureSchema();
    const rows = await query<LabourRow>(
      "SELECT id, name, phone, rate_ot, rate_medium, active FROM labours ORDER BY id DESC",
    );
    return NextResponse.json(rows.map(mapLabour), { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch labours";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureSchema();
    const body = (await request.json()) as {
      name?: string;
      phone?: string;
      rateOT?: number;
      rateMedium?: number;
    };

    const name = body.name?.trim();
    const phone = body.phone?.trim();
    if (!name || !phone) {
      return NextResponse.json({ message: "name and phone are required" }, { status: 400 });
    }

    const rows = await query<LabourRow>(
      `
      INSERT INTO labours (name, phone, rate_ot, rate_medium)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, phone, rate_ot, rate_medium, active
      `,
      [name, phone, body.rateOT ?? null, body.rateMedium ?? null],
    );

    return NextResponse.json(mapLabour(rows[0]), { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create labour";
    return NextResponse.json({ message }, { status: 500 });
  }
}

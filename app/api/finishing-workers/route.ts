import { NextResponse } from "next/server";
import { ensureSchema, query } from "@/lib/db";

type WorkerRow = {
  id: number;
  name: string;
  phone: string;
  area: string | null;
  rate_ot: string | null;
  rate_medium: string | null;
  active: boolean;
};

function mapWorker(row: WorkerRow) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    area: row.area ?? undefined,
    rateOT: row.rate_ot ? Number(row.rate_ot) : undefined,
    rateMedium: row.rate_medium ? Number(row.rate_medium) : undefined,
    active: row.active,
  };
}

export async function GET() {
  try {
    await ensureSchema();
    const rows = await query<WorkerRow>(
      "SELECT id, name, phone, area, rate_ot, rate_medium, active FROM finishing_workers ORDER BY id DESC",
    );
    return NextResponse.json(rows.map(mapWorker), { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch finishing workers";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureSchema();
    const body = (await request.json()) as {
      name?: string;
      phone?: string;
      area?: string;
      rateOT?: number;
      rateMedium?: number;
    };

    const name = body.name?.trim();
    const phone = body.phone?.trim();
    if (!name || !phone) {
      return NextResponse.json({ message: "name and phone are required" }, { status: 400 });
    }

    const rows = await query<WorkerRow>(
      `
      INSERT INTO finishing_workers (name, phone, area, rate_ot, rate_medium)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, phone, area, rate_ot, rate_medium, active
      `,
      [name, phone, body.area?.trim() || null, body.rateOT ?? null, body.rateMedium ?? null],
    );

    return NextResponse.json(mapWorker(rows[0]), { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create finishing worker";
    return NextResponse.json({ message }, { status: 500 });
  }
}

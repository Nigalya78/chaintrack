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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    await ensureSchema();
    const id = Number(params.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ message: "Invalid worker id" }, { status: 400 });
    }

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
      UPDATE finishing_workers
      SET name = $1, phone = $2, area = $3, rate_ot = $4, rate_medium = $5
      WHERE id = $6
      RETURNING id, name, phone, area, rate_ot, rate_medium, active
      `,
      [name, phone, body.area?.trim() || null, body.rateOT ?? null, body.rateMedium ?? null, id],
    );

    if (!rows[0]) {
      return NextResponse.json({ message: "Finishing worker not found" }, { status: 404 });
    }

    return NextResponse.json(mapWorker(rows[0]), { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update finishing worker";
    return NextResponse.json({ message }, { status: 500 });
  }
}

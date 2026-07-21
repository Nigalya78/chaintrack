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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    await ensureSchema();
    const id = Number(params.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ message: "Invalid labour id" }, { status: 400 });
    }

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
      UPDATE labours
      SET name = $1, phone = $2, rate_ot = $3, rate_medium = $4
      WHERE id = $5
      RETURNING id, name, phone, rate_ot, rate_medium, active
      `,
      [name, phone, body.rateOT ?? null, body.rateMedium ?? null, id],
    );

    if (!rows[0]) {
      return NextResponse.json({ message: "Labour not found" }, { status: 404 });
    }

    return NextResponse.json(mapLabour(rows[0]), { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update labour";
    return NextResponse.json({ message }, { status: 500 });
  }
}

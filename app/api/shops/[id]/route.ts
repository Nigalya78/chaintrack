import { NextResponse } from "next/server";
import { ensureSchema, query } from "@/lib/db";

type ShopRow = {
  id: number;
  name: string;
  phone: string | null;
  area: string | null;
  rate_ot: string | null;
  rate_medium: string | null;
  active: boolean;
};

function mapShop(row: ShopRow) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone ?? undefined,
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
      return NextResponse.json({ message: "Invalid shop id" }, { status: 400 });
    }

    const body = (await request.json()) as {
      name?: string;
      phone?: string;
      area?: string;
      rateOT?: number;
      rateMedium?: number;
    };

    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json({ message: "Shop name is required" }, { status: 400 });
    }

    const rows = await query<ShopRow>(
      `
      UPDATE shops
      SET name = $1, phone = $2, area = $3, rate_ot = $4, rate_medium = $5
      WHERE id = $6
      RETURNING id, name, phone, area, rate_ot, rate_medium, active
      `,
      [name, body.phone?.trim() || null, body.area?.trim() || null, body.rateOT ?? null, body.rateMedium ?? null, id],
    );

    if (!rows[0]) {
      return NextResponse.json({ message: "Shop not found" }, { status: 404 });
    }

    return NextResponse.json(mapShop(rows[0]), { status: 200 });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.toLowerCase().includes("duplicate") || error.message.toLowerCase().includes("unique"))
    ) {
      return NextResponse.json({ message: "Shop phone already exists" }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Failed to update shop";
    return NextResponse.json({ message }, { status: 500 });
  }
}

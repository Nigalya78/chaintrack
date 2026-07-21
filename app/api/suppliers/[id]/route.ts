import { NextResponse } from "next/server";
import { ensureSchema, query } from "@/lib/db";

type SupplierRow = {
  id: number;
  name: string;
  phone: string;
  area: string | null;
};

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    await ensureSchema();

    const id = Number(params.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ message: "Invalid supplier id" }, { status: 400 });
    }

    const body = (await request.json()) as {
      name?: string;
      phone?: string;
      area?: string;
    };

    const name = body.name?.trim();
    const phone = body.phone?.trim();
    const area = body.area?.trim() || null;

    if (!name || !phone) {
      return NextResponse.json({ message: "Name and phone are required" }, { status: 400 });
    }

    const rows = await query<SupplierRow>(
      `
      UPDATE suppliers
      SET name = $1, phone = $2, area = $3
      WHERE id = $4
      RETURNING id, name, phone, area
      `,
      [name, phone, area, id],
    );

    if (!rows[0]) {
      return NextResponse.json({ message: "Supplier not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0], { status: 200 });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.toLowerCase().includes("duplicate") ||
        error.message.toLowerCase().includes("unique"))
    ) {
      return NextResponse.json({ message: "Phone number already exists" }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Failed to update supplier";
    return NextResponse.json({ message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { StockSchema } from "@/lib/validations";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId(request);
    const { id } = await params;
    const body = await request.json();

    const validated = StockSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error.flatten() }, { status: 400 });
    }

    const existing = await prisma.stock.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Stock holding not found" }, { status: 404 });
    }

    const updated = await prisma.stock.update({
      where: { id },
      data: {
        ticker: validated.data.ticker.toUpperCase().trim(),
        shares: validated.data.shares,
        avgPrice: validated.data.avgPrice || null,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update stock" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId(request);
    const { id } = await params;

    const existing = await prisma.stock.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Stock holding not found" }, { status: 404 });
    }

    await prisma.stock.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete stock" },
      { status: 500 }
    );
  }
}

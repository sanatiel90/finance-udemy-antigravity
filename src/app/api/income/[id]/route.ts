import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { IncomeSchema } from "@/lib/validations";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId(request);
    const { id } = await params;
    const body = await request.json();

    const validated = IncomeSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error.flatten() }, { status: 400 });
    }

    const existing = await prisma.income.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Income record not found" }, { status: 404 });
    }

    const updated = await prisma.income.update({
      where: { id },
      data: {
        amount: validated.data.amount,
        date: new Date(validated.data.date),
        category: validated.data.category,
        notes: validated.data.notes || null,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update income" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId(request);
    const { id } = await params;

    const existing = await prisma.income.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Income record not found" }, { status: 404 });
    }

    await prisma.income.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete income" }, { status: 500 });
  }
}

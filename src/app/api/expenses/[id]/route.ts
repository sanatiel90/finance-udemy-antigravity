import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { ExpenseSchema } from "@/lib/validations";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId(request);
    const { id } = await params;
    const body = await request.json();

    const validated = ExpenseSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error.flatten() }, { status: 400 });
    }

    const existing = await prisma.expense.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Expense record not found" }, { status: 404 });
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        amount: validated.data.amount,
        date: new Date(validated.data.date),
        category: validated.data.category,
        subcategory: validated.data.subcategory || null,
        notes: validated.data.notes || null,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update expense" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId(request);
    const { id } = await params;

    const existing = await prisma.expense.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Expense record not found" }, { status: 404 });
    }

    await prisma.expense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete expense" }, { status: 500 });
  }
}

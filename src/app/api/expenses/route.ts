import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { ExpenseSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const userId = await getCurrentUserId(request);
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");

    const where: any = { userId };

    if (category && category !== "all") {
      where.category = category;
    }

    if (subcategory && subcategory.trim() !== "") {
      where.subcategory = { contains: subcategory.trim() };
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: "desc" },
    });

    return NextResponse.json(expenses);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId(request);
    const body = await request.json();

    const validated = ExpenseSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error.flatten() }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        userId,
        amount: validated.data.amount,
        date: new Date(validated.data.date),
        category: validated.data.category,
        subcategory: validated.data.subcategory || null,
        notes: validated.data.notes || null,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create expense" }, { status: 500 });
  }
}

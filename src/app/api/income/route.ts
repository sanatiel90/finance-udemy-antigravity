import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { IncomeSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const userId = await getCurrentUserId(request);
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const category = searchParams.get("category");

    const where: any = { userId };

    if (category && category !== "all") {
      where.category = category;
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

    const incomes = await prisma.income.findMany({
      where,
      orderBy: { date: "desc" },
    });

    return NextResponse.json(incomes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch income" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId(request);
    const body = await request.json();

    const validated = IncomeSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error.flatten() }, { status: 400 });
    }

    const income = await prisma.income.create({
      data: {
        userId,
        amount: validated.data.amount,
        date: new Date(validated.data.date),
        category: validated.data.category,
        notes: validated.data.notes || null,
      },
    });

    return NextResponse.json(income, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create income" }, { status: 500 });
  }
}

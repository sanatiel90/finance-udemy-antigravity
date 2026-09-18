import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { SubscriptionSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const userId = await getCurrentUserId(request);
    const { searchParams } = new URL(request.url);
    const upcomingOnly = searchParams.get("upcoming") === "true";

    const now = new Date();
    const thirtyDaysAhead = new Date();
    thirtyDaysAhead.setDate(now.getDate() + 30);

    const where: any = { userId };
    if (upcomingOnly) {
      where.nextBillingDate = {
        gte: now,
        lte: thirtyDaysAhead,
      };
    }

    const subscriptions = await prisma.subscription.findMany({
      where,
      orderBy: { nextBillingDate: "asc" },
    });

    // Calculate monthly equivalent cost for each
    const enriched = subscriptions.map((sub) => {
      const monthlyCost = sub.billingCycle === "yearly" ? sub.amount / 12 : sub.amount;
      const isUpcoming =
        new Date(sub.nextBillingDate) >= now && new Date(sub.nextBillingDate) <= thirtyDaysAhead;

      return {
        ...sub,
        monthlyEquivalent: Math.round(monthlyCost * 100) / 100,
        isUpcoming,
      };
    });

    return NextResponse.json(enriched);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId(request);
    const body = await request.json();

    const validated = SubscriptionSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error.flatten() }, { status: 400 });
    }

    const sub = await prisma.subscription.create({
      data: {
        userId,
        name: validated.data.name,
        amount: validated.data.amount,
        billingCycle: validated.data.billingCycle,
        nextBillingDate: new Date(validated.data.nextBillingDate),
      },
    });

    return NextResponse.json(sub, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create subscription" },
      { status: 500 }
    );
  }
}

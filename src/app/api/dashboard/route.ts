import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { getLatestStockPrice } from "@/lib/stockService";

export async function GET(request: Request) {
  try {
    const userId = await getCurrentUserId(request);
    const now = new Date();

    // 1. Current Month Date Range
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Current month incomes & expenses
    const [currentIncomes, currentExpenses] = await Promise.all([
      prisma.income.findMany({
        where: {
          userId,
          date: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
      prisma.expense.findMany({
        where: {
          userId,
          date: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
    ]);

    const monthlyIncome = currentIncomes.reduce((acc, curr) => acc + curr.amount, 0);
    const monthlyExpenses = currentExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    const netBalance = monthlyIncome - monthlyExpenses;

    // 2. Expense Breakdown by Category
    const categoryTotals: Record<string, number> = {};
    currentExpenses.forEach((exp) => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    const expenseCategories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount: Math.round(amount * 100) / 100,
        percentage: monthlyExpenses > 0 ? Math.round((amount / monthlyExpenses) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // 3. Last 6 Months Trend (Income vs Expenses)
    const sixMonthsTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      const monthLabel = d.toLocaleString("en-US", { month: "short", year: "2-digit" });

      const [mIncomes, mExpenses] = await Promise.all([
        prisma.income.findMany({
          where: {
            userId,
            date: { gte: mStart, lte: mEnd },
          },
          select: { amount: true },
        }),
        prisma.expense.findMany({
          where: {
            userId,
            date: { gte: mStart, lte: mEnd },
          },
          select: { amount: true },
        }),
      ]);

      const incTotal = mIncomes.reduce((s, x) => s + x.amount, 0);
      const expTotal = mExpenses.reduce((s, x) => s + x.amount, 0);

      sixMonthsTrend.push({
        month: monthLabel,
        income: Math.round(incTotal * 100) / 100,
        expenses: Math.round(expTotal * 100) / 100,
        net: Math.round((incTotal - expTotal) * 100) / 100,
      });
    }

    // 4. Portfolio Summary
    const stocks = await prisma.stock.findMany({
      where: { userId },
    });

    let totalValue = 0;
    let totalInvested = 0;

    const enrichedStocks = await Promise.all(
      stocks.map(async (stk) => {
        const currentPrice = await getLatestStockPrice(stk.ticker);
        const currentValue = Math.round(stk.shares * currentPrice * 100) / 100;
        const avgPrice = stk.avgPrice ?? 0;
        const investedValue = avgPrice > 0 ? Math.round(stk.shares * avgPrice * 100) / 100 : 0;
        const profitLoss = investedValue > 0 ? Math.round((currentValue - investedValue) * 100) / 100 : 0;
        const profitLossPercent =
          investedValue > 0 ? Math.round((profitLoss / investedValue) * 10000) / 100 : 0;

        totalValue += currentValue;
        totalInvested += investedValue;

        return {
          id: stk.id,
          ticker: stk.ticker,
          shares: stk.shares,
          avgPrice: stk.avgPrice,
          currentPrice,
          currentValue,
          investedValue,
          profitLoss,
          profitLossPercent,
        };
      })
    );

    const totalProfitLoss = Math.round((totalValue - totalInvested) * 100) / 100;
    const totalProfitLossPercent =
      totalInvested > 0 ? Math.round((totalProfitLoss / totalInvested) * 10000) / 100 : 0;

    // Top holdings by value
    const topHoldings = [...enrichedStocks]
      .sort((a, b) => b.currentValue - a.currentValue)
      .slice(0, 5);

    // 5. Upcoming Subscriptions (next 30 days)
    const thirtyDaysAhead = new Date();
    thirtyDaysAhead.setDate(now.getDate() + 30);

    const upcomingSubs = await prisma.subscription.findMany({
      where: {
        userId,
        nextBillingDate: {
          gte: now,
          lte: thirtyDaysAhead,
        },
      },
      orderBy: { nextBillingDate: "asc" },
      take: 5,
    });

    // 6. Recent Transactions (last 5 income and expenses combined)
    const [recentInc, recentExp] = await Promise.all([
      prisma.income.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        take: 5,
      }),
      prisma.expense.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        take: 5,
      }),
    ]);

    const recentTransactions = [
      ...recentInc.map((i) => ({
        id: i.id,
        type: "income" as const,
        amount: i.amount,
        date: i.date,
        category: i.category,
        notes: i.notes,
      })),
      ...recentExp.map((e) => ({
        id: e.id,
        type: "expense" as const,
        amount: e.amount,
        date: e.date,
        category: e.category,
        subcategory: e.subcategory,
        notes: e.notes,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);

    return NextResponse.json({
      summary: {
        monthlyIncome: Math.round(monthlyIncome * 100) / 100,
        monthlyExpenses: Math.round(monthlyExpenses * 100) / 100,
        netBalance: Math.round(netBalance * 100) / 100,
      },
      expenseCategories,
      sixMonthsTrend,
      portfolio: {
        totalValue: Math.round(totalValue * 100) / 100,
        totalInvested: Math.round(totalInvested * 100) / 100,
        totalProfitLoss,
        totalProfitLossPercent,
        topHoldings,
        holdingsCount: stocks.length,
      },
      upcomingSubscriptions: upcomingSubs,
      recentTransactions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}

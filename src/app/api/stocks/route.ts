import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { StockSchema } from "@/lib/validations";
import { getLatestStockPrice } from "@/lib/stockService";

export async function GET(request: Request) {
  try {
    const userId = await getCurrentUserId(request);

    const stocks = await prisma.stock.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // Calculate metrics for each stock
    let totalValue = 0;
    let totalInvested = 0;

    const enrichedStocks = await Promise.all(
      stocks.map(async (stock) => {
        const currentPrice = await getLatestStockPrice(stock.ticker);
        const currentValue = Math.round(stock.shares * currentPrice * 100) / 100;
        const avgPrice = stock.avgPrice ?? 0;
        const investedValue = avgPrice > 0 ? Math.round(stock.shares * avgPrice * 100) / 100 : 0;
        const profitLoss = investedValue > 0 ? Math.round((currentValue - investedValue) * 100) / 100 : 0;
        const profitLossPercent =
          investedValue > 0 ? Math.round((profitLoss / investedValue) * 10000) / 100 : 0;

        totalValue += currentValue;
        totalInvested += investedValue;

        return {
          ...stock,
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

    return NextResponse.json({
      stocks: enrichedStocks,
      metrics: {
        totalValue: Math.round(totalValue * 100) / 100,
        totalInvested: Math.round(totalInvested * 100) / 100,
        totalProfitLoss,
        totalProfitLossPercent,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch portfolio" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId(request);
    const body = await request.json();

    const validated = StockSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error.flatten() }, { status: 400 });
    }

    const ticker = validated.data.ticker.toUpperCase().trim();

    // Check if user already holds this ticker -> update or merge shares
    const existing = await prisma.stock.findFirst({
      where: { userId, ticker },
    });

    let stock;
    if (existing) {
      // Calculate weighted average price if both exist
      const totalShares = existing.shares + validated.data.shares;
      const currentInvested = (existing.avgPrice ?? 0) * existing.shares;
      const newInvested = (validated.data.avgPrice ?? 0) * validated.data.shares;
      const weightedAvgPrice =
        totalShares > 0 ? (currentInvested + newInvested) / totalShares : validated.data.avgPrice;

      stock = await prisma.stock.update({
        where: { id: existing.id },
        data: {
          shares: totalShares,
          avgPrice: weightedAvgPrice ? Math.round(weightedAvgPrice * 100) / 100 : null,
        },
      });
    } else {
      stock = await prisma.stock.create({
        data: {
          userId,
          ticker,
          shares: validated.data.shares,
          avgPrice: validated.data.avgPrice || null,
        },
      });
    }

    // Trigger price fetch in the background to ensure price exists
    getLatestStockPrice(ticker).catch(console.error);

    return NextResponse.json(stock, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to add stock" },
      { status: 500 }
    );
  }
}

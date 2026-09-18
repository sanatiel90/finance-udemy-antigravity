import { NextResponse } from "next/server";
import { syncAllStockPrices } from "@/lib/stockService";

/**
 * Background / Cron / On-demand Stock Price Sync
 * Section 7: Daily Stock Price Updater
 */
export async function POST(request: Request) {
  try {
    const result = await syncAllStockPrices();
    return NextResponse.json({
      message: `Stock prices sync completed. Updated ${result.syncedCount} tickers.`,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to sync stock prices" },
      { status: 500 }
    );
  }
}

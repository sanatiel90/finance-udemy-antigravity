import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Create or upsert user
  const user = await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: {},
    create: {
      id: DEMO_USER_ID,
      email: "demo@antigravity.finance",
      name: "Alex Morgan",
    },
  });
  console.log(`👤 User ready: ${user.name} (${user.email})`);

  // Clear existing transactions for fresh demo
  await prisma.income.deleteMany({ where: { userId: user.id } });
  await prisma.expense.deleteMany({ where: { userId: user.id } });
  await prisma.subscription.deleteMany({ where: { userId: user.id } });
  await prisma.stock.deleteMany({ where: { userId: user.id } });

  const now = new Date();

  // 2. Incomes
  const incomesData = [
    {
      amount: 6500,
      date: new Date(now.getFullYear(), now.getMonth(), 5),
      category: "Salary",
      notes: "Monthly tech salary",
    },
    {
      amount: 1200,
      date: new Date(now.getFullYear(), now.getMonth(), 14),
      category: "Freelance",
      notes: "Fullstack consulting project",
    },
    {
      amount: 320,
      date: new Date(now.getFullYear(), now.getMonth(), 18),
      category: "Investments / Dividends",
      notes: "Quarterly dividend payout",
    },
    // Previous months for trend
    {
      amount: 6500,
      date: new Date(now.getFullYear(), now.getMonth() - 1, 5),
      category: "Salary",
      notes: "Monthly tech salary",
    },
    {
      amount: 950,
      date: new Date(now.getFullYear(), now.getMonth() - 1, 20),
      category: "Freelance",
      notes: "Code review sprint",
    },
    {
      amount: 6500,
      date: new Date(now.getFullYear(), now.getMonth() - 2, 5),
      category: "Salary",
      notes: "Monthly tech salary",
    },
    {
      amount: 6500,
      date: new Date(now.getFullYear(), now.getMonth() - 3, 5),
      category: "Salary",
      notes: "Monthly tech salary",
    },
    {
      amount: 1500,
      date: new Date(now.getFullYear(), now.getMonth() - 3, 16),
      category: "Side Hustle",
      notes: "Udemy course royalties",
    },
  ];

  for (const inc of incomesData) {
    await prisma.income.create({
      data: {
        userId: user.id,
        ...inc,
      },
    });
  }
  console.log(`✅ Seeded ${incomesData.length} income entries.`);

  // 3. Expenses across default categories
  const expensesData = [
    {
      amount: 1850,
      date: new Date(now.getFullYear(), now.getMonth(), 1),
      category: "Rent",
      subcategory: "Apartment",
      notes: "Monthly rent payment",
    },
    {
      amount: 420.5,
      date: new Date(now.getFullYear(), now.getMonth(), 3),
      category: "Food",
      subcategory: "Groceries",
      notes: "Weekly supermarket run",
    },
    {
      amount: 85.2,
      date: new Date(now.getFullYear(), now.getMonth(), 8),
      category: "Food",
      subcategory: "Dining Out",
      notes: "Dinner with team",
    },
    {
      amount: 140.0,
      date: new Date(now.getFullYear(), now.getMonth(), 4),
      category: "Transport",
      subcategory: "Gas",
      notes: "Commute refuel",
    },
    {
      amount: 60.0,
      date: new Date(now.getFullYear(), now.getMonth(), 10),
      category: "Transport",
      subcategory: "Uber",
      notes: "Airport ride",
    },
    {
      amount: 180.0,
      date: new Date(now.getFullYear(), now.getMonth(), 7),
      category: "Utilities",
      subcategory: "Electricity & Water",
      notes: "Monthly utilities bill",
    },
    {
      amount: 75.0,
      date: new Date(now.getFullYear(), now.getMonth(), 9),
      category: "Utilities",
      subcategory: "Fiber Internet",
      notes: "1Gbps home internet",
    },
    {
      amount: 120.0,
      date: new Date(now.getFullYear(), now.getMonth(), 12),
      category: "Health",
      subcategory: "Supplements",
      notes: "Vitamins and protein",
    },
    {
      amount: 95.0,
      date: new Date(now.getFullYear(), now.getMonth(), 15),
      category: "Entertainment",
      subcategory: "Concert",
      notes: "Weekend live show",
    },
    {
      amount: 84.97,
      date: new Date(now.getFullYear(), now.getMonth(), 16),
      category: "Subscriptions",
      subcategory: "SaaS",
      notes: "Monthly tools & streaming",
    },
    {
      amount: 45.0,
      date: new Date(now.getFullYear(), now.getMonth(), 17),
      category: "Misc",
      subcategory: "Home goods",
      notes: "Kitchen replacement items",
    },
    // Previous months for trend
    {
      amount: 2900,
      date: new Date(now.getFullYear(), now.getMonth() - 1, 10),
      category: "Rent",
      notes: "Total monthly expenses",
    },
    {
      amount: 2750,
      date: new Date(now.getFullYear(), now.getMonth() - 2, 10),
      category: "Food",
      notes: "Total monthly expenses",
    },
    {
      amount: 3100,
      date: new Date(now.getFullYear(), now.getMonth() - 3, 10),
      category: "Utilities",
      notes: "Total monthly expenses",
    },
  ];

  for (const exp of expensesData) {
    await prisma.expense.create({
      data: {
        userId: user.id,
        ...exp,
      },
    });
  }
  console.log(`✅ Seeded ${expensesData.length} expense entries.`);

  // 4. Subscriptions
  const subscriptionsData = [
    {
      name: "Netflix Premium",
      amount: 22.99,
      billingCycle: "monthly",
      nextBillingDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4),
    },
    {
      name: "Spotify Family",
      amount: 16.99,
      billingCycle: "monthly",
      nextBillingDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 9),
    },
    {
      name: "ChatGPT Plus",
      amount: 20.0,
      billingCycle: "monthly",
      nextBillingDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14),
    },
    {
      name: "Amazon Prime",
      amount: 139.0,
      billingCycle: "yearly",
      nextBillingDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 22),
    },
    {
      name: "Equinox Gym",
      amount: 180.0,
      billingCycle: "monthly",
      nextBillingDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 28),
    },
  ];

  for (const sub of subscriptionsData) {
    await prisma.subscription.create({
      data: {
        userId: user.id,
        ...sub,
      },
    });
  }
  console.log(`✅ Seeded ${subscriptionsData.length} subscriptions.`);

  // 5. Stocks & Closing Prices
  const stocksData = [
    { ticker: "AAPL", shares: 25, avgPrice: 195.5 },
    { ticker: "NVDA", shares: 40, avgPrice: 112.0 },
    { ticker: "MSFT", shares: 15, avgPrice: 380.0 },
    { ticker: "GOOGL", shares: 20, avgPrice: 165.2 },
    { ticker: "TSLA", shares: 18, avgPrice: 215.0 },
  ];

  for (const stk of stocksData) {
    await prisma.stock.create({
      data: {
        userId: user.id,
        ...stk,
      },
    });
  }
  console.log(`✅ Seeded ${stocksData.length} stock holdings.`);

  // Initial stock closing prices for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mockPrices: Record<string, number> = {
    AAPL: 228.45,
    NVDA: 138.9,
    MSFT: 448.2,
    GOOGL: 182.15,
    TSLA: 242.3,
  };

  for (const [ticker, closingPrice] of Object.entries(mockPrices)) {
    await prisma.stockPrice.upsert({
      where: {
        ticker_date: {
          ticker,
          date: today,
        },
      },
      update: { closingPrice },
      create: {
        ticker,
        date: today,
        closingPrice,
      },
    });
  }
  console.log(`✅ Seeded stock prices for: ${Object.keys(mockPrices).join(", ")}`);

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

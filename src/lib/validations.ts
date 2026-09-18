import { z } from "zod";

export const IncomeSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
  category: z.string().min(1, "Category is required"),
  notes: z.string().optional().nullable(),
});

export const ExpenseSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const SubscriptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  billingCycle: z.enum(["monthly", "yearly"], {
    message: "Billing cycle must be 'monthly' or 'yearly'",
  }),
  nextBillingDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
});

export const StockSchema = z.object({
  ticker: z.string().min(1, "Ticker must not be empty").toUpperCase(),
  shares: z.coerce.number().positive("Shares must be greater than 0"),
  avgPrice: z.coerce.number().positive("Average price must be greater than 0").optional().nullable(),
});

export const DEFAULT_EXPENSE_CATEGORIES = [
  "Rent",
  "Food",
  "Transport",
  "Subscriptions",
  "Utilities",
  "Health",
  "Entertainment",
  "Misc",
] as const;

export const DEFAULT_INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investments / Dividends",
  "Side Hustle",
  "Gifts",
  "Other",
] as const;

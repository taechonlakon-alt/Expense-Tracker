import { NextRequest, NextResponse } from "next/server";

import dayjs from "@/lib/dayjs";
import prisma from "@/lib/prisma";

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isNaN(parsed) || parsed <= 0 ? fallback : parsed;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filterType = searchParams.get("filter") || "month";
    const dateParam = searchParams.get("date") || dayjs().format("YYYY-MM-DD");
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const pageSize = parsePositiveInt(searchParams.get("pageSize"), 10);

    const baseDate = dayjs(dateParam);
    let startDate: Date;
    let endDate: Date;

    if (filterType === "day") {
      startDate = baseDate.startOf("day").toDate();
      endDate = baseDate.endOf("day").toDate();
    } else if (filterType === "year") {
      startDate = baseDate.startOf("year").toDate();
      endDate = baseDate.endOf("year").toDate();
    } else {
      startDate = baseDate.startOf("month").toDate();
      endDate = baseDate.endOf("month").toDate();
    }

    const where = {
      transactionDate: {
        gte: startDate,
        lte: endDate,
      },
    };

    const [summaryTransactions, paginatedTransactions, totalTransactionCount] = await Promise.all([
      prisma.transaction.findMany({
        where,
        select: {
          type: true,
          amount: true,
          category: true,
          transactionDate: true,
        },
      }),
      prisma.transaction.findMany({
        where,
        orderBy: { transactionDate: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.transaction.count({ where }),
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryMap: Record<string, { amount: number; type: string }> = {};

    summaryTransactions.forEach((transaction) => {
      if (transaction.type === "income") totalIncome += transaction.amount;
      if (transaction.type === "expense") totalExpense += transaction.amount;

      if (!categoryMap[transaction.category]) {
        categoryMap[transaction.category] = { amount: 0, type: transaction.type };
      }

      categoryMap[transaction.category].amount += transaction.amount;
    });

    const categories = Object.entries(categoryMap)
      .map(([name, data]) => ({
        name,
        amount: data.amount,
        type: data.type,
      }))
      .sort((left, right) => right.amount - left.amount);

    const dailyMap: Record<string, { income: number; expense: number }> = {};

    if (filterType === "month") {
      const daysInMonth = baseDate.daysInMonth();
      for (let day = 1; day <= daysInMonth; day += 1) {
        dailyMap[day.toString()] = { income: 0, expense: 0 };
      }

      summaryTransactions.forEach((transaction) => {
        const day = dayjs(transaction.transactionDate).tz("Asia/Bangkok").date().toString();
        if (transaction.type === "income") dailyMap[day].income += transaction.amount;
        if (transaction.type === "expense") dailyMap[day].expense += transaction.amount;
      });
    } else if (filterType === "year") {
      for (let month = 1; month <= 12; month += 1) {
        dailyMap[month.toString()] = { income: 0, expense: 0 };
      }

      summaryTransactions.forEach((transaction) => {
        const month = (dayjs(transaction.transactionDate).tz("Asia/Bangkok").month() + 1).toString();
        if (transaction.type === "income") dailyMap[month].income += transaction.amount;
        if (transaction.type === "expense") dailyMap[month].expense += transaction.amount;
      });
    }

    const chartData = Object.entries(dailyMap).map(([label, data]) => ({
      label,
      income: data.income,
      expense: data.expense,
    }));

    return NextResponse.json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      categories,
      chartData,
      transactions: paginatedTransactions,
      totalTransactionCount,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch summary" },
      { status: 500 }
    );
  }
}

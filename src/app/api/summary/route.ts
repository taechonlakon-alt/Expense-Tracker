import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import dayjs from "dayjs";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filterType = searchParams.get("filter") || "month"; // day, month, year
    const dateParam = searchParams.get("date") || dayjs().format("YYYY-MM-DD");

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

    const transactions = await prisma.transaction.findMany({
      where: {
        transactionDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { transactionDate: "desc" },
    });

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryMap: Record<string, { amount: number; type: string }> = {};

    transactions.forEach((t: { type: string; amount: number; category: string }) => {
      if (t.type === "income") totalIncome += t.amount;
      if (t.type === "expense") totalExpense += t.amount;

      if (!categoryMap[t.category]) {
        categoryMap[t.category] = { amount: 0, type: t.type };
      }
      categoryMap[t.category].amount += t.amount;
    });

    const categories = Object.entries(categoryMap)
      .map(([name, data]) => ({
        name,
        amount: data.amount,
        type: data.type,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Build daily chart data
    const dailyMap: Record<string, { income: number; expense: number }> = {};

    if (filterType === "month") {
      const daysInMonth = baseDate.daysInMonth();
      for (let i = 1; i <= daysInMonth; i++) {
        const key = i.toString();
        dailyMap[key] = { income: 0, expense: 0 };
      }
      transactions.forEach((t: { type: string; amount: number; transactionDate: Date }) => {
        const day = dayjs(t.transactionDate).date().toString();
        if (!dailyMap[day]) dailyMap[day] = { income: 0, expense: 0 };
        if (t.type === "income") dailyMap[day].income += t.amount;
        if (t.type === "expense") dailyMap[day].expense += t.amount;
      });
    } else if (filterType === "year") {
      for (let i = 1; i <= 12; i++) {
        dailyMap[i.toString()] = { income: 0, expense: 0 };
      }
      transactions.forEach((t: { type: string; amount: number; transactionDate: Date }) => {
        const month = (dayjs(t.transactionDate).month() + 1).toString();
        if (!dailyMap[month]) dailyMap[month] = { income: 0, expense: 0 };
        if (t.type === "income") dailyMap[month].income += t.amount;
        if (t.type === "expense") dailyMap[month].expense += t.amount;
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
      transactions,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch summary" },
      { status: 500 }
    );
  }
}

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
    const dateParam = searchParams.get("date");
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const pageSize = parsePositiveInt(searchParams.get("pageSize"), 10);

    const whereClause = dateParam
      ? {
          transactionDate: {
            gte: dayjs(dateParam).startOf("day").toDate(),
            lte: dayjs(dateParam).endOf("day").toDate(),
          },
        }
      : {};

    const [transactions, allTransactions] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        orderBy: { transactionDate: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.transaction.findMany({
        where: whereClause,
        select: {
          type: true,
          amount: true,
        },
      }),
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    allTransactions.forEach((transaction) => {
      if (transaction.type === "income") totalIncome += transaction.amount;
      if (transaction.type === "expense") totalExpense += transaction.amount;
    });

    return NextResponse.json({
      transactions,
      totalCount: allTransactions.length,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, amount, category, note, transactionDate } = body;

    if (!type || !amount || !category || !transactionDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        type,
        amount: Number(amount),
        category,
        note: note || "",
        transactionDate: new Date(transactionDate),
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}

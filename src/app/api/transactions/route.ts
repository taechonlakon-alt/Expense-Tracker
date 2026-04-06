import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import dayjs from "@/lib/dayjs";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get("date");

    let whereClause = {};

    if (dateParam) {
      const baseDate = dayjs(dateParam);
      whereClause = {
        transactionDate: {
          gte: baseDate.startOf("day").toDate(),
          lte: baseDate.endOf("day").toDate(),
        },
      };
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: { transactionDate: 'desc' },
      take: 100 // Increased limit as we might filter by day
    });
    
    return NextResponse.json(transactions);
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
        transactionDate: new Date(transactionDate)
      }
    });
    
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}

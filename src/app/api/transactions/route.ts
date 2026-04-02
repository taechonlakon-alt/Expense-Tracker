import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { transactionDate: 'desc' },
      take: 50
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

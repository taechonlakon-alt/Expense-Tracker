import { NextRequest, NextResponse } from "next/server";
import { DebtStatus, Prisma } from "@prisma/client";

import { normalizeDebtStatus, validateDebtPayload } from "@/lib/debt";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const status = normalizeDebtStatus(request.nextUrl.searchParams.get("status"));
    const search = request.nextUrl.searchParams.get("search")?.trim() || "";

    const where: Prisma.DebtWhereInput = {
      ...(status === "all" ? {} : { status: status === "paid" ? DebtStatus.PAID : DebtStatus.UNPAID }),
      ...(search
        ? {
            OR: [
              { customerName: { contains: search, mode: "insensitive" } },
              { customerPhone: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [debts, unpaidCount, unpaidAggregate] = await Promise.all([
      prisma.debt.findMany({
        where,
        orderBy: [{ status: "asc" }, { debtDate: "desc" }],
      }),
      prisma.debt.count({
        where: { status: DebtStatus.UNPAID },
      }),
      prisma.debt.aggregate({
        where: { status: DebtStatus.UNPAID },
        _sum: { amount: true },
      }),
    ]);

    return NextResponse.json({
      debts,
      stats: {
        unpaidCount,
        unpaidTotal: unpaidAggregate._sum.amount ?? 0,
      },
    });
  } catch (error) {
    console.error("Failed to fetch debts:", error);
    return NextResponse.json({ error: "Failed to fetch debts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = validateDebtPayload(body);

    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const debt = await prisma.debt.create({
      data: {
        ...result.data,
        status: DebtStatus.UNPAID,
      },
    });

    return NextResponse.json(debt, { status: 201 });
  } catch (error) {
    console.error("Failed to create debt:", error);
    return NextResponse.json({ error: "Failed to create debt" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { DebtStatus, Prisma } from "@prisma/client";

import { findExactCustomerIdentityMatch } from "@/lib/customer-match";
import { normalizeDebtStatus, serializeDebtRecord, serializeDebtRecords, validateDebtPayload } from "@/lib/debt";
import { buildCustomerSummaries } from "@/lib/debt-customers";
import prisma from "@/lib/prisma";

async function resolveCustomer(payload: {
  customerId: number | null;
  customerName: string | null;
  customerPhone: string | null;
}) {
  if (payload.customerId) {
    return prisma.customer.findUnique({
      where: { id: payload.customerId },
    });
  }

  const existingCustomers = await prisma.customer.findMany({
    select: {
      id: true,
      name: true,
      phone: true,
    },
  });

  const exactMatch = findExactCustomerIdentityMatch(existingCustomers, {
    name: payload.customerName!,
    phone: payload.customerPhone!,
  });

  if (exactMatch) {
    return prisma.customer.findUnique({
      where: { id: exactMatch.customer.id },
    });
  }

  return prisma.customer.upsert({
    where: {
      name_phone: {
        name: payload.customerName!,
        phone: payload.customerPhone!,
      },
    },
    update: {},
    create: {
      name: payload.customerName!,
      phone: payload.customerPhone!,
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const status = normalizeDebtStatus(request.nextUrl.searchParams.get("status"));
    const search = request.nextUrl.searchParams.get("search")?.trim() || "";
    const view = request.nextUrl.searchParams.get("view") || "all-debts";
    const page = Math.max(1, Number.parseInt(request.nextUrl.searchParams.get("page") || "1", 10) || 1);
    const pageSize = Math.max(1, Math.min(50, Number.parseInt(request.nextUrl.searchParams.get("pageSize") || "10", 10) || 10));

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

    const [unpaidCount, unpaidAggregate, groupedDebtRecords] = await Promise.all([
      prisma.debt.count({
        where: { status: DebtStatus.UNPAID },
      }),
      prisma.debt.aggregate({
        where: { status: DebtStatus.UNPAID },
        _sum: { amount: true },
      }),
      prisma.debt.findMany({
        where,
        orderBy: [{ status: "asc" }, { debtDate: "desc" }],
      }),
    ]);

    const allCustomerSummaries = buildCustomerSummaries(serializeDebtRecords(groupedDebtRecords));
    const unpaidCustomerCount = allCustomerSummaries.filter((customer) => customer.status === "UNPAID").length;
    const paidCustomerCount = allCustomerSummaries.filter((customer) => customer.status === "PAID").length;

    if (view === "all-debts") {
      const [debts, totalCount] = await Promise.all([
        prisma.debt.findMany({
          where,
          orderBy: [{ status: "asc" }, { debtDate: "desc" }],
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.debt.count({ where }),
      ]);

      return NextResponse.json({
        debts: serializeDebtRecords(debts),
        customerSummaries: [],
        stats: {
          unpaidCount,
          unpaidTotal: unpaidAggregate._sum.amount ?? 0,
          unpaidCustomerCount,
          paidCustomerCount,
        },
        totalCount,
      });
    }

    const customerSummaries = allCustomerSummaries.filter((customer) =>
      view === "unpaid-customers" ? customer.status === "UNPAID" : customer.status === "PAID"
    );

    return NextResponse.json({
      debts: [],
      customerSummaries: customerSummaries.slice((page - 1) * pageSize, page * pageSize),
      stats: {
        unpaidCount,
        unpaidTotal: unpaidAggregate._sum.amount ?? 0,
        unpaidCustomerCount,
        paidCustomerCount,
      },
      totalCount: customerSummaries.length,
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

    const customer = await resolveCustomer(result.data);

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const debt = await prisma.debt.create({
      data: {
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        amount: result.data.amount,
        note: result.data.note,
        debtDate: result.data.debtDate,
        status: DebtStatus.UNPAID,
      },
    });

    return NextResponse.json(serializeDebtRecord(debt), { status: 201 });
  } catch (error) {
    console.error("Failed to create debt:", error);
    return NextResponse.json({ error: "Failed to create debt" }, { status: 500 });
  }
}

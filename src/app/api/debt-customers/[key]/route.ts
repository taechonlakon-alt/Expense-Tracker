import { NextResponse } from "next/server";

import { serializeDebtRecords } from "@/lib/debt";
import { buildCustomerSummaries, parseDebtCustomerKey } from "@/lib/debt-customers";
import prisma from "@/lib/prisma";

function normalizeRouteKey(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key: rawKey } = await params;
    const parsedKey = parseDebtCustomerKey(normalizeRouteKey(rawKey));

    if (!parsedKey) {
      return NextResponse.json({ error: "Invalid customer key" }, { status: 400 });
    }

    const debts = await prisma.debt.findMany({
      where: {
        customerId: parsedKey.customerId,
      },
      orderBy: [{ status: "asc" }, { debtDate: "desc" }],
    });

    if (debts.length === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const serializedDebts = serializeDebtRecords(debts);
    const [customer] = buildCustomerSummaries(serializedDebts);

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ customer, debts: serializedDebts });
  } catch (error) {
    console.error("Failed to fetch debt customer detail:", error);
    return NextResponse.json({ error: "Failed to fetch debt customer detail" }, { status: 500 });
  }
}

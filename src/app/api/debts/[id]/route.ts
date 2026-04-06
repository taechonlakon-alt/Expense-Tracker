import { NextResponse } from "next/server";
import { DebtStatus } from "@prisma/client";

import { parseDebtStatus, validateDebtPayload } from "@/lib/debt";
import prisma from "@/lib/prisma";

function parseId(value: string) {
  const id = Number.parseInt(value, 10);
  return Number.isNaN(id) ? null : id;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseId(rawId);

    if (id === null) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const result = validateDebtPayload(body);

    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const existingDebt = await prisma.debt.findUnique({ where: { id } });

    if (!existingDebt) {
      return NextResponse.json({ error: "Debt not found" }, { status: 404 });
    }

    if (existingDebt.status === DebtStatus.PAID) {
      return NextResponse.json({ error: "Paid debts cannot be edited" }, { status: 409 });
    }

    const debt = await prisma.debt.update({
      where: { id },
      data: {
        ...result.data,
        paidAt: null,
      },
    });

    return NextResponse.json(debt);
  } catch (error) {
    console.error("Failed to update debt:", error);
    return NextResponse.json({ error: "Failed to update debt" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseId(rawId);

    if (id === null) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const status = parseDebtStatus(body?.status);

    if (status !== DebtStatus.PAID) {
      return NextResponse.json({ error: "Only PAID status is supported" }, { status: 400 });
    }

    const existingDebt = await prisma.debt.findUnique({ where: { id } });

    if (!existingDebt) {
      return NextResponse.json({ error: "Debt not found" }, { status: 404 });
    }

    const debt = await prisma.debt.update({
      where: { id },
      data: {
        status: DebtStatus.PAID,
        paidAt: new Date(),
      },
    });

    return NextResponse.json(debt);
  } catch (error) {
    console.error("Failed to mark debt as paid:", error);
    return NextResponse.json({ error: "Failed to mark debt as paid" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseId(rawId);

    if (id === null) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const existingDebt = await prisma.debt.findUnique({ where: { id } });

    if (!existingDebt) {
      return NextResponse.json({ error: "Debt not found" }, { status: 404 });
    }

    await prisma.debt.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete debt:", error);
    return NextResponse.json({ error: "Failed to delete debt" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

import dayjs from "@/lib/dayjs";
import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  type BackupPayload,
  parseBackupPayload,
} from "@/lib/backup";
import prisma from "@/lib/prisma";

function buildBackupFilename() {
  return `expense-tracker-backup-${dayjs().tz("Asia/Bangkok").format("YYYY-MM-DD-HHmmss")}.json`;
}

export async function GET() {
  try {
    const [transactions, customers, debts] = await Promise.all([
      prisma.transaction.findMany({
        orderBy: [{ transactionDate: "asc" }, { id: "asc" }],
      }),
      prisma.customer.findMany({
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      }),
      prisma.debt.findMany({
        orderBy: [{ debtDate: "asc" }, { id: "asc" }],
      }),
    ]);

    const payload: BackupPayload = {
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      data: {
        transactions: transactions.map((transaction) => ({
          id: transaction.id,
          type: transaction.type === "income" ? "income" : "expense",
          amount: transaction.amount,
          category: transaction.category,
          note: transaction.note,
          transactionDate: transaction.transactionDate.toISOString(),
          createdAt: transaction.createdAt.toISOString(),
          updatedAt: transaction.updatedAt.toISOString(),
        })),
        customers: customers.map((customer) => ({
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          note: customer.note,
          createdAt: customer.createdAt.toISOString(),
          updatedAt: customer.updatedAt.toISOString(),
        })),
        debts: debts.map((debt) => ({
          id: debt.id,
          customerId: debt.customerId,
          customerName: debt.customerName,
          customerPhone: debt.customerPhone,
          amount: debt.amount,
          note: debt.note,
          debtDate: debt.debtDate.toISOString(),
          status: debt.status,
          paidAt: debt.paidAt ? debt.paidAt.toISOString() : null,
          createdAt: debt.createdAt.toISOString(),
          updatedAt: debt.updatedAt.toISOString(),
        })),
      },
    };

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${buildBackupFilename()}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to create backup:", error);
    return NextResponse.json({ error: "Failed to create backup" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = parseBackupPayload(body);

    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const customerIds = new Set(result.data.data.customers.map((customer) => customer.id));
    const missingCustomerDebt = result.data.data.debts.find((debt) => !customerIds.has(debt.customerId));

    if (missingCustomerDebt) {
      return NextResponse.json(
        { error: `Backup debt ${missingCustomerDebt.id} references a missing customer` },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.debt.deleteMany();
      await tx.transaction.deleteMany();
      await tx.customer.deleteMany();

      const customerIdMap = new Map<number, { id: number; name: string; phone: string }>();

      for (const customer of result.data.data.customers) {
        const createdCustomer = await tx.customer.create({
          data: {
            name: customer.name,
            phone: customer.phone,
            note: customer.note,
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt,
          },
        });

        customerIdMap.set(customer.id, {
          id: createdCustomer.id,
          name: createdCustomer.name,
          phone: createdCustomer.phone,
        });
      }

      for (const transaction of result.data.data.transactions) {
        await tx.transaction.create({
          data: {
            type: transaction.type,
            amount: transaction.amount,
            category: transaction.category,
            note: transaction.note,
            transactionDate: transaction.transactionDate,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt,
          },
        });
      }

      for (const debt of result.data.data.debts) {
        const mappedCustomer = customerIdMap.get(debt.customerId);

        if (!mappedCustomer) {
          throw new Error(`Customer mapping not found for debt ${debt.id}`);
        }

        await tx.debt.create({
          data: {
            customerId: mappedCustomer.id,
            customerName: mappedCustomer.name,
            customerPhone: mappedCustomer.phone,
            amount: debt.amount,
            note: debt.note,
            debtDate: debt.debtDate,
            status: debt.status,
            paidAt: debt.paidAt,
            createdAt: debt.createdAt,
            updatedAt: debt.updatedAt,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      restoredAt: new Date().toISOString(),
      counts: {
        transactions: result.data.data.transactions.length,
        customers: result.data.data.customers.length,
        debts: result.data.data.debts.length,
      },
    });
  } catch (error) {
    console.error("Failed to restore backup:", error);
    return NextResponse.json({ error: "Failed to restore backup" }, { status: 500 });
  }
}

import dayjs from "@/lib/dayjs";
import { DebtStatus } from "@prisma/client";
import { Customer, Debt } from "@/types/debt";

export const DEBT_STATUS_VALUES = ["all", "unpaid", "paid"] as const;

export type DebtFilterStatus = (typeof DEBT_STATUS_VALUES)[number];

export function normalizeDebtStatus(value: string | null): DebtFilterStatus {
  if (value === "paid" || value === "unpaid") return value;
  return "all";
}

export function validateDebtPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return { valid: false as const, error: "Invalid request body" };
  }

  const data = payload as Record<string, unknown>;
  const customerId = Number(data.customerId);
  const customerName = typeof data.customerName === "string" ? data.customerName.trim() : "";
  const customerPhone = typeof data.customerPhone === "string" ? data.customerPhone.trim() : "";
  const amount = Number(data.amount);
  const note = typeof data.note === "string" ? data.note.trim() : "";
  const debtDate = typeof data.debtDate === "string" ? data.debtDate : "";

  const hasCustomerId = Number.isInteger(customerId) && customerId > 0;

  if (!hasCustomerId) {
    if (!customerName) {
      return { valid: false as const, error: "customerName is required" };
    }

    if (!customerPhone) {
      return { valid: false as const, error: "customerPhone is required" };
    }
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { valid: false as const, error: "amount must be greater than 0" };
  }

  if (!debtDate || !dayjs(debtDate).isValid()) {
    return { valid: false as const, error: "debtDate is required" };
  }

  return {
    valid: true as const,
    data: {
      customerId: hasCustomerId ? customerId : null,
      customerName: customerName || null,
      customerPhone: customerPhone || null,
      amount,
      note: note || null,
      debtDate: new Date(debtDate),
    },
  };
}

export function parseDebtStatus(value: unknown): DebtStatus | null {
  if (value === DebtStatus.PAID || value === DebtStatus.UNPAID) return value;
  return null;
}

interface DebtRecord {
  id: number;
  customerId: number;
  customerName: string;
  customerPhone: string;
  amount: number;
  note: string | null;
  debtDate: Date;
  status: DebtStatus;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CustomerRecord {
  id: number;
  name: string;
  phone: string;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function serializeDebtRecord(record: DebtRecord): Debt {
  return {
    ...record,
    debtDate: record.debtDate.toISOString(),
    paidAt: record.paidAt ? record.paidAt.toISOString() : null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function serializeDebtRecords(records: DebtRecord[]) {
  return records.map(serializeDebtRecord);
}

export function serializeCustomerRecord(record: CustomerRecord): Customer {
  return {
    ...record,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function serializeCustomerRecords(records: CustomerRecord[]) {
  return records.map(serializeCustomerRecord);
}

import { DebtStatus } from "@prisma/client";

export const BACKUP_FORMAT = "expense-tracker-backup";
export const BACKUP_VERSION = 1;

export interface BackupTransactionRecord {
  id: number;
  type: "income" | "expense";
  amount: number;
  category: string;
  note: string | null;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackupCustomerRecord {
  id: number;
  name: string;
  phone: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BackupDebtRecord {
  id: number;
  customerId: number;
  customerName: string;
  customerPhone: string;
  amount: number;
  note: string | null;
  debtDate: string;
  status: DebtStatus;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BackupPayload {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  data: {
    transactions: BackupTransactionRecord[];
    customers: BackupCustomerRecord[];
    debts: BackupDebtRecord[];
  };
}

interface ParsedBackupTransactionRecord
  extends Omit<BackupTransactionRecord, "transactionDate" | "createdAt" | "updatedAt"> {
  transactionDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ParsedBackupCustomerRecord extends Omit<BackupCustomerRecord, "createdAt" | "updatedAt"> {
  createdAt: Date;
  updatedAt: Date;
}

interface ParsedBackupDebtRecord extends Omit<BackupDebtRecord, "debtDate" | "paidAt" | "createdAt" | "updatedAt"> {
  debtDate: Date;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParsedBackupPayload {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  exportedAt: Date;
  data: {
    transactions: ParsedBackupTransactionRecord[];
    customers: ParsedBackupCustomerRecord[];
    debts: ParsedBackupDebtRecord[];
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseRequiredString(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} must be a non-empty string`);
  }

  return value;
}

function parseOptionalString(value: unknown, field: string) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error(`${field} must be a string or null`);
  }

  return value;
}

function parseNumber(value: unknown, field: string) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${field} must be a valid number`);
  }

  return value;
}

function parseIntId(value: unknown, field: string) {
  const number = parseNumber(value, field);

  if (!Number.isInteger(number) || number <= 0) {
    throw new Error(`${field} must be a positive integer`);
  }

  return number;
}

function parseDate(value: unknown, field: string) {
  const raw = parseRequiredString(value, field);
  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${field} must be a valid ISO date`);
  }

  return date;
}

function parseNullableDate(value: unknown, field: string) {
  if (value === null || value === undefined) {
    return null;
  }

  return parseDate(value, field);
}

function parseTransactionType(value: unknown, field: string) {
  if (value === "income" || value === "expense") {
    return value;
  }

  throw new Error(`${field} must be income or expense`);
}

function parseDebtStatusValue(value: unknown, field: string) {
  if (value === DebtStatus.UNPAID || value === DebtStatus.PAID) {
    return value;
  }

  throw new Error(`${field} must be a valid debt status`);
}

function parseTransactionRecord(value: unknown, index: number): ParsedBackupTransactionRecord {
  if (!isRecord(value)) {
    throw new Error(`transactions[${index}] must be an object`);
  }

  return {
    id: parseIntId(value.id, `transactions[${index}].id`),
    type: parseTransactionType(value.type, `transactions[${index}].type`),
    amount: parseNumber(value.amount, `transactions[${index}].amount`),
    category: parseRequiredString(value.category, `transactions[${index}].category`),
    note: parseOptionalString(value.note, `transactions[${index}].note`),
    transactionDate: parseDate(value.transactionDate, `transactions[${index}].transactionDate`),
    createdAt: parseDate(value.createdAt, `transactions[${index}].createdAt`),
    updatedAt: parseDate(value.updatedAt, `transactions[${index}].updatedAt`),
  };
}

function parseCustomerRecord(value: unknown, index: number): ParsedBackupCustomerRecord {
  if (!isRecord(value)) {
    throw new Error(`customers[${index}] must be an object`);
  }

  return {
    id: parseIntId(value.id, `customers[${index}].id`),
    name: parseRequiredString(value.name, `customers[${index}].name`),
    phone: parseRequiredString(value.phone, `customers[${index}].phone`),
    note: parseOptionalString(value.note, `customers[${index}].note`),
    createdAt: parseDate(value.createdAt, `customers[${index}].createdAt`),
    updatedAt: parseDate(value.updatedAt, `customers[${index}].updatedAt`),
  };
}

function parseDebtRecord(value: unknown, index: number): ParsedBackupDebtRecord {
  if (!isRecord(value)) {
    throw new Error(`debts[${index}] must be an object`);
  }

  return {
    id: parseIntId(value.id, `debts[${index}].id`),
    customerId: parseIntId(value.customerId, `debts[${index}].customerId`),
    customerName: parseRequiredString(value.customerName, `debts[${index}].customerName`),
    customerPhone: parseRequiredString(value.customerPhone, `debts[${index}].customerPhone`),
    amount: parseNumber(value.amount, `debts[${index}].amount`),
    note: parseOptionalString(value.note, `debts[${index}].note`),
    debtDate: parseDate(value.debtDate, `debts[${index}].debtDate`),
    status: parseDebtStatusValue(value.status, `debts[${index}].status`),
    paidAt: parseNullableDate(value.paidAt, `debts[${index}].paidAt`),
    createdAt: parseDate(value.createdAt, `debts[${index}].createdAt`),
    updatedAt: parseDate(value.updatedAt, `debts[${index}].updatedAt`),
  };
}

export function parseBackupPayload(payload: unknown) {
  try {
    if (!isRecord(payload)) {
      throw new Error("Backup payload must be an object");
    }

    if (payload.format !== BACKUP_FORMAT) {
      throw new Error("Unsupported backup format");
    }

    if (payload.version !== BACKUP_VERSION) {
      throw new Error("Unsupported backup version");
    }

    const data = payload.data;

    if (!isRecord(data)) {
      throw new Error("Backup data must be an object");
    }

    const rawTransactions = data.transactions;
    const rawCustomers = data.customers;
    const rawDebts = data.debts;

    if (!Array.isArray(rawTransactions)) {
      throw new Error("Backup transactions must be an array");
    }

    if (!Array.isArray(rawCustomers)) {
      throw new Error("Backup customers must be an array");
    }

    if (!Array.isArray(rawDebts)) {
      throw new Error("Backup debts must be an array");
    }

    const parsed: ParsedBackupPayload = {
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      exportedAt: parseDate(payload.exportedAt, "exportedAt"),
      data: {
        transactions: rawTransactions.map(parseTransactionRecord),
        customers: rawCustomers.map(parseCustomerRecord),
        debts: rawDebts.map(parseDebtRecord),
      },
    };

    return { valid: true as const, data: parsed };
  } catch (error) {
    return {
      valid: false as const,
      error: error instanceof Error ? error.message : "Invalid backup payload",
    };
  }
}

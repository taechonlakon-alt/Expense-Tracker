export type DebtStatus = "UNPAID" | "PAID";
export type DebtFilterStatus = "all" | "unpaid" | "paid";

export interface Debt {
  id: number;
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

export interface DebtStats {
  unpaidCount: number;
  unpaidTotal: number;
}

export interface DebtListResponse {
  debts: Debt[];
  stats: DebtStats;
}


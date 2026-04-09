export type DebtStatus = "UNPAID" | "PAID";
export type DebtFilterStatus = "all" | "unpaid" | "paid";

export interface Customer {
  id: number;
  name: string;
  phone: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Debt {
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

export interface DebtStats {
  unpaidCount: number;
  unpaidTotal: number;
  unpaidCustomerCount: number;
  paidCustomerCount: number;
}

export interface DebtListResponse {
  debts: Debt[];
  customerSummaries: DebtCustomerSummary[];
  stats: DebtStats;
  totalCount: number;
}

export interface CustomerListResponse {
  customers: Customer[];
}

export interface DebtCustomerSummary {
  key: string;
  customerId: number;
  customerName: string;
  customerPhone: string;
  debts: Debt[];
  unpaidCount: number;
  paidCount: number;
  unpaidTotal: number;
  paidTotal: number;
  totalAmount: number;
  status: DebtStatus;
  latestDebtDate: string;
  latestPaidAt: string | null;
}

export interface DebtCustomerDetailResponse {
  customer: DebtCustomerSummary;
  debts: Debt[];
}

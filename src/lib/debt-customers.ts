import dayjs from "@/lib/dayjs";
import { Debt, DebtCustomerSummary } from "@/types/debt";

export function buildDebtCustomerKey(customerId: number) {
  return String(customerId);
}

export function buildDebtCustomerPath(customerId: number) {
  return `/debts/customers/${encodeURIComponent(buildDebtCustomerKey(customerId))}`;
}

export function parseDebtCustomerKey(rawKey: string) {
  const customerId = Number.parseInt(rawKey, 10);

  if (Number.isNaN(customerId) || customerId <= 0) {
    return null;
  }

  return { customerId };
}

export function buildCustomerSummaries(debts: Debt[]) {
  const customerMap = new Map<string, DebtCustomerSummary>();

  debts.forEach((debt) => {
    const key = buildDebtCustomerKey(debt.customerId);
    const existing = customerMap.get(key);

    if (!existing) {
      customerMap.set(key, {
        key,
        customerId: debt.customerId,
        customerName: debt.customerName,
        customerPhone: debt.customerPhone,
        debts: [debt],
        unpaidCount: debt.status === "UNPAID" ? 1 : 0,
        paidCount: debt.status === "PAID" ? 1 : 0,
        unpaidTotal: debt.status === "UNPAID" ? debt.amount : 0,
        paidTotal: debt.status === "PAID" ? debt.amount : 0,
        totalAmount: debt.amount,
        status: debt.status,
        latestDebtDate: debt.debtDate,
        latestPaidAt: debt.paidAt,
      });
      return;
    }

    existing.debts.push(debt);
    existing.totalAmount += debt.amount;

    if (debt.status === "UNPAID") {
      existing.unpaidCount += 1;
      existing.unpaidTotal += debt.amount;
      existing.status = "UNPAID";
    } else {
      existing.paidCount += 1;
      existing.paidTotal += debt.amount;
    }

    if (dayjs(debt.debtDate).isAfter(dayjs(existing.latestDebtDate))) {
      existing.latestDebtDate = debt.debtDate;
    }

    if (debt.paidAt && (!existing.latestPaidAt || dayjs(debt.paidAt).isAfter(dayjs(existing.latestPaidAt)))) {
      existing.latestPaidAt = debt.paidAt;
    }
  });

  return Array.from(customerMap.values()).sort((left, right) => {
    if (left.status !== right.status) {
      return left.status === "UNPAID" ? -1 : 1;
    }

    return dayjs(right.latestDebtDate).valueOf() - dayjs(left.latestDebtDate).valueOf();
  });
}

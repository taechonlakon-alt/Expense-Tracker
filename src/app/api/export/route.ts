import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import dayjs from "dayjs";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get("date") || dayjs().format("YYYY-MM-DD");

    const baseDate = dayjs(dateParam);
    const startDate = baseDate.startOf("month").toDate();
    const endDate = baseDate.endOf("month").toDate();
    const monthLabel = baseDate.format("YYYY-MM");

    const transactions = await prisma.transaction.findMany({
      where: {
        transactionDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { transactionDate: "asc" },
    });

    // UTF-8 BOM so Excel reads Thai correctly
    const BOM = "\uFEFF";
    const header = "วันที่,เวลา,ประเภท,หมวดหมู่,จำนวนเงิน,หมายเหตุ";

    const rows = transactions.map((t: { type: string; amount: number; category: string; note: string | null; transactionDate: Date }) => {
      const date = dayjs(t.transactionDate).format("DD/MM/YYYY");
      const time = dayjs(t.transactionDate).format("HH:mm");
      const type = t.type === "income" ? "รายรับ" : "รายจ่าย";
      const amount = t.type === "income" ? t.amount.toFixed(2) : `-${t.amount.toFixed(2)}`;
      const note = (t.note || "").replace(/,/g, " "); // escape commas in note

      return `${date},${time},${type},${t.category},${amount},${note}`;
    });

    const csv = BOM + header + "\n" + rows.join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="expense-summary-${monthLabel}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}

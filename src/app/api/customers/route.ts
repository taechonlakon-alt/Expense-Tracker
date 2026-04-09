import { NextRequest, NextResponse } from "next/server";

import { serializeCustomerRecords } from "@/lib/debt";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get("search")?.trim() || "";

    const customers = await prisma.customer.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
    });

    return NextResponse.json({ customers: serializeCustomerRecords(customers) });
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

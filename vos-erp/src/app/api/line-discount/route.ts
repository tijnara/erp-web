// src/app/api/line-discount/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");

  try {
    // Directus removed: return mock data or fetch from alternative source
    const allDiscounts = [
      { id: 1, name: "Holiday Discount", discount_value: 10 },
      { id: 2, name: "Clearance", discount_value: 20 },
    ];
    let filtered = allDiscounts;
    if (query) {
      filtered = allDiscounts.filter((d) =>
        d.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    return NextResponse.json({ data: filtered });
  } catch (error) {
    console.error("Error fetching line discounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch line discounts" },
      { status: 500 }
    );
  }
}

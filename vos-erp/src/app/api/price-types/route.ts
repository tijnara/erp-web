import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Directus removed: return mock data or fetch from alternative source
        const priceTypes = [
            { id: 1, name: "Retail" },
            { id: 2, name: "Wholesale" }
        ];
        return NextResponse.json(priceTypes);
    } catch (error) {
        console.error("Error fetching price types:", error);
        return NextResponse.json({ error: "Failed to fetch price types" }, { status: 500 });
    }
}

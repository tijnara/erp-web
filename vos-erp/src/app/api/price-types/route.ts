import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
    try {
        const { data, error } = await supabase
            .from("price_types")
            .select("price_type_id, price_type_name")
            .order("sort", { ascending: true });

        if (error) {
            console.error("Error fetching price types:", error);
            return NextResponse.json({ error: "Failed to fetch price types" }, { status: 500 });
        }

        // Map to expected format
        const priceTypes = (data || []).map(item => ({
            id: item.price_type_id,
            name: item.price_type_name,
        }));

        return NextResponse.json(priceTypes);
    } catch (error) {
        console.error("Error fetching price types:", error);
        return NextResponse.json({ error: "Failed to fetch price types" }, { status: 500 });
    }
}

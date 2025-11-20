// src/app/api/lookup/[resource]/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { cookies as nextCookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const ACCESS = process.env.AUTH_ACCESS_COOKIE ?? "vos_access";


const MAP: Record<
    string,
    { path: string; fields: string; nameField: string; idField: string; extra?: string[] }
> = {
    units: {
        path: "units",
        fields: "unit_id,unit_name,unit_shortcut",
        nameField: "unit_name",
        idField: "unit_id",
        extra: ["unit_shortcut"]
    },
    brand: {path: "brand", fields: "brand_id,brand_name", nameField: "brand_name", idField: "brand_id"},
    categories: {
        path: "categories",
        fields: "category_id,category_name",
        nameField: "category_name",
        idField: "category_id"
    },
    segment: {path: "segment", fields: "segment_id,segment_name", nameField: "segment_name", idField: "segment_id"},
    sections: {path: "sections", fields: "section_id,section_name", nameField: "section_name", idField: "section_id"},
    branches: {
        path: "branches",
        fields: "branch_id,branch_name,branch_code",
        nameField: "branch_name",
        idField: "branch_id"
    },
    company: {
        path: "company",
        fields: "company_id,company_name,company_code",
        nameField: "company_name",
        idField: "company_id"
    },
    division: {
        path: "division",
        fields: "division_id,division_name",
        nameField: "division_name",
        idField: "division_id"
    },
    suppliers: {
        path: "suppliers",
        fields: "id,supplier_name",
        nameField: "supplier_name",
        idField: "id"
    },
    operation: {
        path: "operation",
        fields: "id,name,code",
        nameField: "name",
        idField: "id"
    },
    price_types: {
        path: "price_types",
        fields: "price_type_id,price_type_name,code",
        nameField: "price_type_name",
        idField: "price_type_id"
    }
    // NOTE: transaction_type table doesn't exist in Supabase yet
    // When ready, uncomment and create the table:
    // transaction_type: {
    //     path: "transaction_type",
    //     fields: "id,name",
    //     nameField: "name",
    //     idField: "id"
    // }
};

export async function GET(req: NextRequest, context: { params: Promise<{ resource: string }> }) {
    const { resource } = await context.params;
    const cfg = MAP[resource];
    if (!cfg) return NextResponse.json([], { status: 200 });

    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? "";

    const cookieStore = await nextCookies();
    const auth = cookieStore.get(ACCESS)?.value;

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${auth}` } } }
    );

    let query = supabase.from(cfg.path).select(cfg.fields).limit(20).order(cfg.nameField);

    if (q.trim()) {
        query = query.ilike(cfg.nameField, `%${q.trim()}%`);
    }

    const { data, error } = await query;

    if (error || !data) {
        console.error(error);
        return NextResponse.json([], { status: 200 });
    }

    const options = (data as any[]).map((row) => {
        const id = row[cfg.idField];
        const name = row[cfg.nameField];
        const meta: any = {};
        if (cfg.extra?.includes("unit_shortcut") && row.unit_shortcut) {
            meta.subtitle = row.unit_shortcut;
        }
        return { id, name, meta };
    });

    return NextResponse.json(options);
}

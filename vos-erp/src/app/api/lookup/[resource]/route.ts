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
        fields: "id,supplier_name,supplier_shortcut,supplier_type,payment_terms",
        nameField: "supplier_name",
        idField: "id",
        extra: ["supplier_shortcut", "supplier_type", "payment_terms"]
    },
    operation: {
        path: "operation",
        fields: "id,name,code,operation_name",
        nameField: "name",
        idField: "id"
    },
    operations: {
        path: "operations",
        fields: "id,operation_name,name,code",
        nameField: "operation_name",
        idField: "id"
    },
    price_types: {
        path: "price_types",
        fields: "price_type_id,price_type_name,code",
        nameField: "price_type_name",
        idField: "price_type_id"
    },
    payment_terms: {
        path: "payment_terms",
        fields: "id,payment_name,payment_days",
        nameField: "payment_name",
        idField: "id"
    },
    receiving_type: {
        path: "receiving_type",
        fields: "id,description",
        nameField: "description",
        idField: "id"
    },
    transaction_type: {
        path: "transaction_type",
        fields: "id,name",
        nameField: "name",
        idField: "id"
    },
    purchase_order: {
        path: "purchase_order",
        fields: "id,purchase_order_no,date,supplier_id",
        nameField: "purchase_order_no",
        idField: "id"
    },
    department: {
        path: "department",
        fields: "id,name",
        nameField: "name",
        idField: "id"
    },
    departments: {
        path: "departments",
        fields: "id,name",
        nameField: "name",
        idField: "id"
    }
};

export async function GET(req: NextRequest, context: { params: Promise<{ resource: string }> }) {
    const { resource } = await context.params;
    const cfg = MAP[resource];
    if (!cfg) return NextResponse.json([], { status: 200 });

    const url = new URL(req.url);
    const q = url.searchParams.get("q") ?? "";
    const limitParam = url.searchParams.get("limit");
    const sortParam = url.searchParams.get("sort");

    const cookieStore = await nextCookies();
    const auth = cookieStore.get(ACCESS)?.value;

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${auth}` } } }
    );

    const limit = limitParam ? parseInt(limitParam, 10) : 20;
    let query = supabase.from(cfg.path).select(cfg.fields).limit(limit);
    
    // Handle sort parameter (e.g., "-purchase_order_no" for descending)
    if (sortParam) {
        const isDesc = sortParam.startsWith("-");
        const sortField = isDesc ? sortParam.slice(1) : sortParam;
        query = query.order(sortField, { ascending: !isDesc });
    } else {
        query = query.order(cfg.nameField);
    }

    if (q.trim()) {
        query = query.ilike(cfg.nameField, `%${q.trim()}%`);
    }

    const { data, error } = await query;

    if (error || !data) {
        console.error(error);
        return NextResponse.json([], { status: 200 });
    }

    const options = (data as Array<Record<string, unknown>>).map((row) => {
        const id = row[cfg.idField];
        const name = row[cfg.nameField];
        const result: Record<string, unknown> = { id, name };
        
        // Include all extra fields in the response
        if (cfg.extra) {
            cfg.extra.forEach(field => {
                if (row[field] !== undefined) {
                    result[field] = row[field];
                }
            });
        }
        
        return result;
    });

    return NextResponse.json(options);
}

// src/app/api/customer/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

// GET /api/customer - list customers (optionally basic select for performance)
export async function GET() {
  try {
    const { data, error } = await supabase.from('customer').select('id, customer_code, customer_name, store_name, contact_number');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}

// POST /api/customer - create customer
export async function POST(req: Request) {
  try {
    const json = await req.json();
    // Basic validation
    if (!json.customer_name) {
      return NextResponse.json({ error: 'customer_name is required' }, { status: 400 });
    }
    const insertPayload = { ...json };
    const { data, error } = await supabase.from('customer').insert(insertPayload).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: data?.[0] }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}


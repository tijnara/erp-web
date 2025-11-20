// src/app/api/purchase_order_receiving/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const purchaseOrderId = url.searchParams.get('purchase_order_id');
  const query = supabase.from('purchase_order_receiving').select('*');
  const final = purchaseOrderId ? query.eq('purchase_order_id', Number(purchaseOrderId)) : query;
  const { data, error } = await final;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const rows = Array.isArray(json) ? json : [json];
    const { data, error } = await supabase.from('purchase_order_receiving').insert(rows).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}


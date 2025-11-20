// src/app/api/customer/[id]/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const idNum = Number(params.id);
  if (isNaN(idNum)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  const { data, error } = await supabase.from('customer').select('*').eq('id', idNum).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const idNum = Number(params.id);
  if (isNaN(idNum)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  const body = await req.json();
  const { data, error } = await supabase.from('customer').update(body).eq('id', idNum).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data?.[0] });
}


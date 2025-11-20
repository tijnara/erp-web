// src/app/api/assets-equipments/[...parts]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const ENDPOINT_MAP: Record<string, string> = {
    'assets': 'assets_and_equipment',
    'items': 'items',
    'types': 'item_type',
    'classifications': 'item_classification',
    'departments': 'department',
    'users': 'users',
};

async function handleRequest(request: NextRequest) {
    const { pathname, searchParams } = new URL(request.url);
    const parts = pathname.split('/').filter(Boolean);
    const resource = parts[2];
    const id = parts[3];

    const tableName = ENDPOINT_MAP[resource] || resource;

    try {
        if (request.method === 'GET') {
            if (id) {
                // Get single item
                const { data, error } = await supabase
                    .from(tableName)
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                return NextResponse.json(data);
            } else {
                // Get list
                const limit = parseInt(searchParams.get('limit') || '50');
                const offset = parseInt(searchParams.get('offset') || '0');

                const { data, error, count } = await supabase
                    .from(tableName)
                    .select('*', { count: 'exact' })
                    .range(offset, offset + limit - 1);

                if (error) throw error;
                return NextResponse.json({ data, total: count });
            }
        }

        if (request.method === 'POST') {
            const body = await request.json();
            const { data, error } = await supabase
                .from(tableName)
                .insert(body)
                .select()
                .single();

            if (error) throw error;
            return NextResponse.json(data, { status: 201 });
        }

        if (request.method === 'PUT' && id) {
            const body = await request.json();
            const { data, error } = await supabase
                .from(tableName)
                .update(body)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return NextResponse.json(data);
        }

        if (request.method === 'DELETE' && id) {
            const { error } = await supabase
                .from(tableName)
                .delete()
                .eq('id', id);

            if (error) throw error;
            return new NextResponse(null, { status: 204 });
        }

        return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });

    } catch (error: any) {
        console.error('[ASSET_ERROR]', error);
        return NextResponse.json(
            { message: error.message || 'Database error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    return handleRequest(request);
}

export async function POST(request: NextRequest) {
    return handleRequest(request);
}

export async function PUT(request: NextRequest) {
    return handleRequest(request);
}

export async function DELETE(request: NextRequest) {
    return handleRequest(request);
}

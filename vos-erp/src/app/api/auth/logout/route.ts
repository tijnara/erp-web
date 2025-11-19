import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ACCESS = process.env.AUTH_ACCESS_COOKIE || 'vos_access_token';
const REFRESH = process.env.AUTH_REFRESH_COOKIE || 'vos_refresh_token';

export async function POST() {
    const c = await cookies();
    c.delete(ACCESS);
    c.delete(REFRESH);
    return NextResponse.json({ ok: true });
}

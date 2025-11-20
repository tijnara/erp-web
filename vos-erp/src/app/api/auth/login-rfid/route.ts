// src/app/api/auth/login-rfid/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { SignJWT } from 'jose';
import { supabase } from '@/lib/supabase';

const APP_ACCESS  = process.env.APP_ACCESS_COOKIE  ?? 'vos_app_access';
const APP_REFRESH = process.env.APP_REFRESH_COOKIE ?? 'vos_app_refresh';
const secret = new TextEncoder().encode(process.env.AUTH_JWT_SECRET ?? 'dev-secret-change-me');

const Body = z.object({ rf: z.string().min(1) });

async function sign(payload: any, seconds: number) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(`${seconds}s`)
        .sign(secret);
}

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const p = Body.safeParse(body);
        if (!p.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

        // Query user by RFID from Supabase
        const { data: user, error } = await supabase
            .from('users')
            .select('user_id, user_email, user_fname, user_lname, role_id, is_admin, rf_id, is_deleted, status')
            .eq('rf_id', p.data.rf)
            .single();

        if (error || !user) {
            return NextResponse.json({ error: 'RFID not found' }, { status: 404 });
        }

        // Check if account is deleted or inactive
        if (user.is_deleted || user.status === 'inactive') {
            return NextResponse.json({ error: 'Account disabled' }, { status: 403 });
        }

        // Create session token
        const sessionId = crypto.randomUUID();

        // Update user's session token in database
        await supabase
            .from('users')
            .update({ session_token: sessionId })
            .eq('user_id', user.user_id);

        // Mint app-session cookies (JWT)
        const name = [user.user_fname, user.user_lname].filter(Boolean).join(' ') || user.user_email || user.rf_id || '';
        const payload = {
            sub: String(user.user_id),
            email: user.user_email ?? '',
            name,
            isAdmin: !!user.is_admin,
            role_id: user.role_id ?? null,
            auth_kind: 'rfid' as const,
            jti: sessionId,
        };

        const access  = await sign(payload, 60 * 15);       // 15m
        const refresh = await sign(payload, 60 * 60 * 24);  // 1d

        const isProd = process.env.NODE_ENV === 'production';
        const res = NextResponse.json({ ok: true, user: payload });
        res.cookies.set(APP_ACCESS,  access,  { httpOnly: true, sameSite: 'lax', secure: isProd, path: '/', maxAge: 60 * 15 });
        res.cookies.set(APP_REFRESH, refresh, { httpOnly: true, sameSite: 'lax', secure: isProd, path: '/', maxAge: 60 * 60 * 24 });
        return res;
    } catch (e: any) {
        console.error('RFID_LOGIN_ERROR:', e);
        return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 });
    }
}

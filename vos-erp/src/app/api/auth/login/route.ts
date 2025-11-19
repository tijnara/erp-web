// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { SignJWT } from 'jose';
import { randomUUID } from 'crypto';
import { supabase } from '../../../../lib/supabase';

export const runtime = 'nodejs';

const APP_ACCESS  = process.env.APP_ACCESS_COOKIE  ?? 'vos_app_access';
const APP_REFRESH = process.env.APP_REFRESH_COOKIE ?? 'vos_app_refresh';
const secret = new TextEncoder().encode(process.env.AUTH_JWT_SECRET ?? 'dev-secret-change-me');

const Body = z.object({ email: z.string().email(), password: z.string().min(1) });

async function sign(payload: any, seconds: number) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${seconds}s`)
    .sign(secret);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const p = Body.safeParse(body);
    if (!p.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

    // 1. Query the User from Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('user_id, user_email, user_fname, user_lname, is_admin, user_password, is_deleted, status')
      .eq('user_email', p.data.email)
      .single();

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({ error: 'Database error', details: error.message }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Check if account is deleted or inactive
    if (user.is_deleted) {
      return NextResponse.json({ error: 'Account has been deleted' }, { status: 403 });
    }

    if (user.status !== 'active') {
      return NextResponse.json({ error: 'Account is not active' }, { status: 403 });
    }

    console.log('User found:', { id: user.user_id, email: user.user_email, hasPassword: !!user.user_password });

    // 2. Verify Password (plaintext comparison)
    if (!user.user_password) {
      console.error('Password field missing from user record.');
      return NextResponse.json({
        error: 'Authentication system error',
        hint: 'Password field not accessible.'
      }, { status: 500 });
    }

    // Direct string comparison for plaintext passwords
    const isValid = p.data.password === user.user_password;
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 3. Create Session (JWT logic)
    const sessionId = randomUUID();
    const payload = {
      sub: String(user.user_id),
      email: user.user_email,
      name: `${user.user_fname} ${user.user_lname}`,
      isAdmin: user.is_admin,
      jti: sessionId,
    };

    // 4. Update session_token in database for middleware verification
    const { error: updateError } = await supabase
      .from('users')
      .update({ session_token: sessionId })
      .eq('user_id', user.user_id);

    if (updateError) {
      console.error('Failed to update session token:', updateError);
      return NextResponse.json({ error: 'Session creation failed' }, { status: 500 });
    }

    const access = await sign(payload, 60 * 15);
    const refresh = await sign(payload, 60 * 60 * 24);

    // 5. Return Cookies
    const isProd = process.env.NODE_ENV === 'production';
    const res = NextResponse.json({ ok: true, user: payload });
    res.cookies.set(APP_ACCESS,  access,  { httpOnly: true, sameSite: 'lax', secure: isProd, path: '/', maxAge: 60 * 15 });
    res.cookies.set(APP_REFRESH, refresh, { httpOnly: true, sameSite: 'lax', secure: isProd, path: '/', maxAge: 60 * 60 * 24 });

    return res;
  } catch (e: any) {
    console.error('Login error:', e);
    return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
  }
}

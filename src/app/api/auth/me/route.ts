import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/token=([^;]+)/);
    const token = match ? match[1] : null;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true, user: payload });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('token', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
  return response;
}

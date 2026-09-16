import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('eco_session')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const user = await verifySessionToken(token);
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({ authenticated: true, user });
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    return NextResponse.json({ authenticated: false, user: null });
  }
}

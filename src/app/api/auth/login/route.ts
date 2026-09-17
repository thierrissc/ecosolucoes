import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword, createSessionToken, AuthUser } from '@/lib/auth';
import { checkRateLimit, isValidEmail } from '@/lib/security';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local_client';
    const rateCheck = checkRateLimit(`login_empresa_${ip}`, 5, 5 * 60 * 1000);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Muitas tentativas incorretas. Por segurança, tente novamente em ${rateCheck.retryAfterSeconds} segundos.` },
        { status: 429 }
      );
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Informe e-mail e senha.' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Formato de e-mail corporativo inválido.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    try {
      const rows = await query<{
        id: string;
        name: string;
        company_name: string;
        email: string;
        password_hash: string;
        avatar?: string;
      }>('SELECT id, name, company_name, email, password_hash, avatar FROM users WHERE email = $1 LIMIT 1', [
        normalizedEmail,
      ]);

      if (rows.length === 0) {
        return NextResponse.json(
          { error: 'E-mail ou senha incorretos.' },
          { status: 401 }
        );
      }

      const dbUser = rows[0];
      const isValid = await verifyPassword(password, dbUser.password_hash);

      if (!isValid) {
        return NextResponse.json(
          { error: 'E-mail ou senha incorretos.' },
          { status: 401 }
        );
      }

      const user: AuthUser = {
        id: dbUser.id,
        name: dbUser.name,
        companyName: dbUser.company_name,
        email: dbUser.email,
        avatar: dbUser.avatar,
      };

      const token = await createSessionToken(user);
      const response = NextResponse.json({ success: true, user });

      response.cookies.set('eco_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });

      return response;
    } catch (dbErr: any) {
      if (dbErr.message !== 'DATABASE_URL_NOT_CONFIGURED') {
        console.error('Erro no banco SQL ao autenticar:', dbErr);
        return NextResponse.json(
          { error: 'Erro de conexão com o banco de dados.' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: 'Não foi possível conectar ao banco de dados no momento. Tente novamente.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erro na rota de login:', error);
    return NextResponse.json(
      { error: 'Erro interno ao realizar login.' },
      { status: 500 }
    );
  }
}

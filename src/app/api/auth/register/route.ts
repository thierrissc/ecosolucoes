import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, createSessionToken, AuthUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { name, companyName, email, password } = await req.json();

    if (!name || !companyName || !email || !password) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const passwordHash = await hashPassword(password);

    const user: AuthUser = {
      id: userId,
      name: name.trim(),
      companyName: companyName.trim(),
      email: normalizedEmail,
    };

    try {
      // 1. Verificar se e-mail já existe
      const existing = await query('SELECT id FROM users WHERE email = $1 LIMIT 1', [normalizedEmail]);
      if (existing.length > 0) {
        return NextResponse.json(
          { error: 'Este e-mail já está cadastrado.' },
          { status: 409 }
        );
      }

      // 2. Inserir novo usuário na tabela SQL
      await query(
        `INSERT INTO users (id, name, company_name, email, password_hash)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, user.name, user.companyName, normalizedEmail, passwordHash]
      );

      // 3. Inicializar workspace zerado para a empresa do usuário
      await query(
        `INSERT INTO user_workspaces (user_id, setores, tarefas, metas, mural, eventos, notificacoes)
         VALUES ($1, '[]', '[]', '[]', '[]', '[]', '[]')`,
        [userId]
      );
    } catch (dbErr: any) {
      if (dbErr.message !== 'DATABASE_URL_NOT_CONFIGURED') {
        console.error('Erro no banco SQL ao registrar usuário:', dbErr);
        return NextResponse.json(
          { error: 'Falha ao salvar usuário no banco de dados.' },
          { status: 500 }
        );
      }
      // Se DATABASE_URL não foi configurado ainda, prossegue no modo fallback
    }

    const token = await createSessionToken(user);

    const response = NextResponse.json({ success: true, user });
    response.cookies.set('eco_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 dias
    });

    return response;
  } catch (error) {
    console.error('Erro na rota de registro:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar cadastro.' },
      { status: 500 }
    );
  }
}

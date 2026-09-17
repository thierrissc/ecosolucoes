import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, createSessionToken, AuthUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { validateAvatarPayload, isValidEmail, sanitizeText } from '@/lib/security';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('eco_session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const currentUser = await verifySessionToken(token);
    if (!currentUser) {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 });
    }

    const body = await req.json();

    // ─── Validação de Avatar (Restrição de upload - item 16) ───
    if (body.avatar) {
      const avatarVal = validateAvatarPayload(body.avatar);
      if (!avatarVal.valid) {
        return NextResponse.json({ error: avatarVal.error }, { status: 400 });
      }
    }

    // ─── Se for Colaborador: Atualizar apenas sua linha em company_employees (RLS e Block tampering) ───
    if (currentUser.role === 'funcionario') {
      const { email, avatar } = body;
      const cleanEmail = email ? sanitizeText(email, 120) : currentUser.email;

      if (cleanEmail && !isValidEmail(cleanEmail)) {
        return NextResponse.json({ error: 'E-mail informado é inválido.' }, { status: 400 });
      }

      const newAvatar = avatar !== undefined ? (avatar || null) : (currentUser.avatar || null);

      try {
        await query(
          `UPDATE company_employees
           SET email = $1,
               avatar = $2,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $3 AND company_id = $4`,
          [cleanEmail, newAvatar, currentUser.id, currentUser.companyId]
        );
      } catch (dbErr: any) {
        console.warn('Erro ao atualizar colaborador no banco:', dbErr.message);
      }

      const updatedUser: AuthUser = {
        ...currentUser,
        email: cleanEmail,
        avatar: newAvatar || undefined,
      };

      const newToken = await createSessionToken(updatedUser);
      const res = NextResponse.json({ success: true, user: updatedUser });
      res.cookies.set('eco_session', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
      return res;
    }

    // ─── Se for Empresa / Gestor: Atualizar tabela users ───
    const { companyName, name, avatar } = body;
    const newCompanyName = companyName ? sanitizeText(companyName, 120) : currentUser.companyName;
    const newName = name ? sanitizeText(name, 120) : currentUser.name;
    const newAvatar = avatar !== undefined ? (avatar || null) : (currentUser.avatar || null);

    try {
      await query(
        `UPDATE users
         SET company_name = $1,
             name = $2,
             avatar = $3,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
        [newCompanyName, newName, newAvatar, currentUser.id]
      );
    } catch (dbErr: any) {
      console.warn('Erro ao atualizar usuário no banco de dados:', dbErr.message);
    }

    const updatedUser: AuthUser = {
      ...currentUser,
      companyName: newCompanyName,
      name: newName,
      avatar: newAvatar || undefined,
    };

    const newToken = await createSessionToken(updatedUser);

    const res = NextResponse.json({ success: true, user: updatedUser });
    res.cookies.set('eco_session', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return res;
  } catch (error) {
    console.error('Erro na rota de perfil:', error);
    return NextResponse.json({ error: 'Erro interno ao salvar perfil' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, createSessionToken, AuthUser } from '@/lib/auth';
import { query } from '@/lib/db';

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
    const { companyName, name, avatar } = body;

    const newCompanyName = (companyName !== undefined && companyName !== '') ? companyName : currentUser.companyName;
    const newName = (name !== undefined && name !== '') ? name : currentUser.name;
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
      id: currentUser.id,
      email: currentUser.email,
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
    console.error('Erro na rota de atualização do perfil:', error);
    return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 });
  }
}

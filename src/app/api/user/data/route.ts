import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/auth';
import { query } from '@/lib/db';

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('eco_session')?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const workspaceId = user.companyId || user.id;

    try {
      const rows = await query(
        `SELECT setores, tarefas, metas, mural, eventos, notificacoes
         FROM user_workspaces
         WHERE user_id = $1
         LIMIT 1`,
        [workspaceId]
      );

      if (rows.length === 0) {
        return NextResponse.json({
          setores: [],
          tarefas: [],
          metas: [],
          mural: [],
          eventos: [],
          notificacoes: [],
        });
      }

      const ws = rows[0];
      return NextResponse.json({
        setores: typeof ws.setores === 'string' ? JSON.parse(ws.setores) : (ws.setores || []),
        tarefas: typeof ws.tarefas === 'string' ? JSON.parse(ws.tarefas) : (ws.tarefas || []),
        metas: typeof ws.metas === 'string' ? JSON.parse(ws.metas) : (ws.metas || []),
        mural: typeof ws.mural === 'string' ? JSON.parse(ws.mural) : (ws.mural || []),
        eventos: typeof ws.eventos === 'string' ? JSON.parse(ws.eventos) : (ws.eventos || []),
        notificacoes: typeof ws.notificacoes === 'string' ? JSON.parse(ws.notificacoes) : (ws.notificacoes || []),
      });
    } catch (dbErr: any) {
      if (dbErr.message === 'DATABASE_URL_NOT_CONFIGURED') {
        return NextResponse.json({
          setores: [],
          tarefas: [],
          metas: [],
          mural: [],
          eventos: [],
          notificacoes: [],
        });
      }
      throw dbErr;
    }
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    return NextResponse.json({ error: 'Erro ao carregar dados' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const { setores, tarefas, metas, mural, eventos, notificacoes } = body;
    const workspaceId = user.companyId || user.id;

    try {
      await query(
        `INSERT INTO user_workspaces (user_id, setores, tarefas, metas, mural, eventos, notificacoes, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id) DO UPDATE SET
           setores = EXCLUDED.setores,
           tarefas = EXCLUDED.tarefas,
           metas = EXCLUDED.metas,
           mural = EXCLUDED.mural,
           eventos = EXCLUDED.eventos,
           notificacoes = EXCLUDED.notificacoes,
           updated_at = CURRENT_TIMESTAMP`,
        [
          workspaceId,
          JSON.stringify(setores || []),
          JSON.stringify(tarefas || []),
          JSON.stringify(metas || []),
          JSON.stringify(mural || []),
          JSON.stringify(eventos || []),
          JSON.stringify(notificacoes || []),
        ]
      );
    } catch (dbErr: any) {
      if (dbErr.message !== 'DATABASE_URL_NOT_CONFIGURED') {
        throw dbErr;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar dados do usuário:', error);
    return NextResponse.json({ error: 'Erro ao salvar dados' }, { status: 500 });
  }
}

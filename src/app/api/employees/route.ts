import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/auth';
import { query } from '@/lib/db';
import { Funcionario } from '@/types';

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('eco_session')?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ECO-${code}`;
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const companyId = user.companyId || user.id;

    const rows = await query<any>(
      `SELECT id, company_id, nome, cargo, setor_id, setor_nome, tipo_contrato, salario, email, telefone, codigo_acesso, permissoes, ativo, data_admissao, avatar, created_at
       FROM company_employees
       WHERE company_id = $1
       ORDER BY created_at DESC`,
      [companyId]
    );

    const funcionarios: Funcionario[] = rows.map((r) => ({
      id: r.id,
      companyId: r.company_id,
      nome: r.nome,
      cargo: r.cargo,
      setorId: r.setor_id || undefined,
      setorNome: r.setor_nome || undefined,
      tipoContrato: r.tipo_contrato,
      salario: Number(r.salario) || 0,
      email: r.email || undefined,
      telefone: r.telefone || undefined,
      codigoAcesso: r.codigo_acesso,
      permissoes: typeof r.permissoes === 'string' ? JSON.parse(r.permissoes) : (r.permissoes || {}),
      ativo: r.ativo !== false,
      dataAdmissao: r.data_admissao || undefined,
      avatar: r.avatar || undefined,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : undefined,
    }));

    return NextResponse.json({ funcionarios });
  } catch (error) {
    console.error('Erro ao buscar colaboradores:', error);
    return NextResponse.json({ error: 'Erro ao listar colaboradores' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (user.role === 'funcionario') {
      return NextResponse.json(
        { error: 'Apenas a empresa administradora pode cadastrar colaboradores.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      nome,
      cargo,
      setorId,
      setorNome,
      tipoContrato,
      salario,
      email,
      telefone,
      permissoes,
      ativo,
      dataAdmissao,
      avatar,
      codigoAcesso,
    } = body;

    if (!nome || !cargo) {
      return NextResponse.json(
        { error: 'Nome e cargo são obrigatórios.' },
        { status: 400 }
      );
    }

    const id = `emp_${Math.random().toString(36).substring(2, 9)}${Date.now().toString(36)}`;
    const finalCodigo = (codigoAcesso && codigoAcesso.trim().toUpperCase()) || generateAccessCode();
    const finalTipoContrato = tipoContrato || 'CLT';
    const finalSalario = Number(salario) || 0;
    const finalAtivo = ativo !== false;
    const finalPermissoes = permissoes || {};

    const existingCode = await query('SELECT id FROM company_employees WHERE UPPER(codigo_acesso) = $1 LIMIT 1', [
      finalCodigo,
    ]);

    if (existingCode.length > 0) {
      return NextResponse.json(
        { error: 'Este código de acesso já está em uso por outro colaborador.' },
        { status: 400 }
      );
    }

    await query(
      `INSERT INTO company_employees (
        id, company_id, nome, cargo, setor_id, setor_nome, tipo_contrato, salario, email, telefone, codigo_acesso, permissoes, ativo, data_admissao, avatar, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        id,
        user.id,
        nome.trim(),
        cargo.trim(),
        setorId || null,
        setorNome || null,
        finalTipoContrato,
        finalSalario,
        email ? email.trim() : null,
        telefone ? telefone.trim() : null,
        finalCodigo,
        JSON.stringify(finalPermissoes),
        finalAtivo,
        dataAdmissao || new Date().toISOString().split('T')[0],
        avatar || null,
      ]
    );

    const novoFuncionario: Funcionario = {
      id,
      companyId: user.id,
      nome: nome.trim(),
      cargo: cargo.trim(),
      setorId: setorId || undefined,
      setorNome: setorNome || undefined,
      tipoContrato: finalTipoContrato,
      salario: finalSalario,
      email: email ? email.trim() : undefined,
      telefone: telefone ? telefone.trim() : undefined,
      codigoAcesso: finalCodigo,
      permissoes: finalPermissoes,
      ativo: finalAtivo,
      dataAdmissao: dataAdmissao || new Date().toISOString().split('T')[0],
      avatar: avatar || undefined,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, funcionario: novoFuncionario });
  } catch (error) {
    console.error('Erro ao cadastrar colaborador:', error);
    return NextResponse.json({ error: 'Erro ao cadastrar colaborador.' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (user.role === 'funcionario') {
      return NextResponse.json(
        { error: 'Apenas a empresa administradora pode editar colaboradores.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      id,
      nome,
      cargo,
      setorId,
      setorNome,
      tipoContrato,
      salario,
      email,
      telefone,
      permissoes,
      ativo,
      dataAdmissao,
      avatar,
      codigoAcesso,
    } = body;

    if (!id || !nome || !cargo) {
      return NextResponse.json(
        { error: 'ID, nome e cargo são obrigatórios.' },
        { status: 400 }
      );
    }

    const cleanCodigo = codigoAcesso ? codigoAcesso.trim().toUpperCase() : undefined;

    if (cleanCodigo) {
      const checkCode = await query(
        'SELECT id FROM company_employees WHERE UPPER(codigo_acesso) = $1 AND id != $2 LIMIT 1',
        [cleanCodigo, id]
      );
      if (checkCode.length > 0) {
        return NextResponse.json(
          { error: 'Este código de acesso já está em uso por outro colaborador.' },
          { status: 400 }
        );
      }
    }

    await query(
      `UPDATE company_employees SET
        nome = $1,
        cargo = $2,
        setor_id = $3,
        setor_nome = $4,
        tipo_contrato = $5,
        salario = $6,
        email = $7,
        telefone = $8,
        codigo_acesso = COALESCE($9, codigo_acesso),
        permissoes = $10,
        ativo = $11,
        data_admissao = $12,
        avatar = $13,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $14 AND company_id = $15`,
      [
        nome.trim(),
        cargo.trim(),
        setorId || null,
        setorNome || null,
        tipoContrato || 'CLT',
        Number(salario) || 0,
        email ? email.trim() : null,
        telefone ? telefone.trim() : null,
        cleanCodigo || null,
        JSON.stringify(permissoes || {}),
        ativo !== false,
        dataAdmissao || null,
        avatar || null,
        id,
        user.id,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar colaborador:', error);
    return NextResponse.json({ error: 'Erro ao atualizar colaborador.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (user.role === 'funcionario') {
      return NextResponse.json(
        { error: 'Apenas a empresa administradora pode remover colaboradores.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do colaborador não informado.' }, { status: 400 });
    }

    await query('DELETE FROM company_employees WHERE id = $1 AND company_id = $2', [id, user.id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir colaborador:', error);
    return NextResponse.json({ error: 'Erro ao excluir colaborador.' }, { status: 500 });
  }
}

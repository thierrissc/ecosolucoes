import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createSessionToken, AuthUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { codigoAcesso } = await req.json();

    if (!codigoAcesso || typeof codigoAcesso !== 'string' || !codigoAcesso.trim()) {
      return NextResponse.json(
        { error: 'Informe o código de acesso fornecido pela empresa.' },
        { status: 400 }
      );
    }

    const cleanCode = codigoAcesso.trim().toUpperCase();

    try {
      // Buscar colaborador pelo código de acesso
      const employeeRows = await query<{
        id: string;
        company_id: string;
        nome: string;
        cargo: string;
        email?: string;
        avatar?: string;
        permissoes: any;
        ativo: boolean;
      }>(
        'SELECT id, company_id, nome, cargo, email, avatar, permissoes, ativo FROM company_employees WHERE UPPER(codigo_acesso) = $1 LIMIT 1',
        [cleanCode]
      );

      if (employeeRows.length === 0) {
        return NextResponse.json(
          { error: 'Código de acesso não encontrado. Verifique com seu gestor.' },
          { status: 401 }
        );
      }

      const employee = employeeRows[0];

      if (!employee.ativo) {
        return NextResponse.json(
          { error: 'Acesso desativado pela empresa. Contate o administrador.' },
          { status: 403 }
        );
      }

      // Buscar nome da empresa
      const companyRows = await query<{
        id: string;
        company_name: string;
      }>('SELECT id, company_name FROM users WHERE id = $1 LIMIT 1', [employee.company_id]);

      if (companyRows.length === 0) {
        return NextResponse.json(
          { error: 'Empresa vinculada não foi encontrada.' },
          { status: 404 }
        );
      }

      const company = companyRows[0];
      const parsedPermissoes =
        typeof employee.permissoes === 'string'
          ? JSON.parse(employee.permissoes)
          : employee.permissoes || {};

      const user: AuthUser = {
        id: employee.id,
        name: employee.nome,
        companyName: company.company_name,
        email: employee.email || '',
        avatar: employee.avatar,
        role: 'funcionario',
        companyId: company.id,
        cargo: employee.cargo,
        permissoes: parsedPermissoes,
      };

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
    } catch (dbErr: any) {
      console.error('Erro de banco ao autenticar funcionário:', dbErr);
      return NextResponse.json(
        { error: 'Erro de conexão com o banco de dados.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erro na rota de employee-login:', error);
    return NextResponse.json(
      { error: 'Erro interno ao realizar login de colaborador.' },
      { status: 500 }
    );
  }
}

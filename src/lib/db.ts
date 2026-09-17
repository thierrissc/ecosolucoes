import { Pool } from 'pg';

const DEFAULT_DATABASE_URL =
  'postgresql://neondb_owner:npg_DNKibx1St8MQ@ep-flat-feather-b56k68hu-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || DEFAULT_DATABASE_URL;

let pool: Pool | null = null;
let initialized = false;

export function getPool(): Pool | null {
  if (!databaseUrl) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

export async function ensureTablesExist() {
  const p = getPool();
  if (!p || initialized) return;

  const client = await p.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        avatar TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_workspaces (
        user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        setores JSONB NOT NULL DEFAULT '[]',
        tarefas JSONB NOT NULL DEFAULT '[]',
        metas JSONB NOT NULL DEFAULT '[]',
        mural JSONB NOT NULL DEFAULT '[]',
        eventos JSONB NOT NULL DEFAULT '[]',
        notificacoes JSONB NOT NULL DEFAULT '[]',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
 
      CREATE TABLE IF NOT EXISTS company_employees (
        id VARCHAR(64) PRIMARY KEY,
        company_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        nome VARCHAR(255) NOT NULL,
        cargo VARCHAR(255) NOT NULL,
        setor_id VARCHAR(64),
        setor_nome VARCHAR(255),
        tipo_contrato VARCHAR(64) NOT NULL DEFAULT 'CLT',
        salario NUMERIC(12, 2) DEFAULT 0,
        email VARCHAR(255),
        telefone VARCHAR(64),
        codigo_acesso VARCHAR(64) UNIQUE NOT NULL,
        permissoes JSONB NOT NULL DEFAULT '{}',
        ativo BOOLEAN NOT NULL DEFAULT TRUE,
        data_admissao VARCHAR(64),
        avatar TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_company_employees_company ON company_employees(company_id);
      CREATE INDEX IF NOT EXISTS idx_company_employees_codigo ON company_employees(codigo_acesso);
    `);
    initialized = true;
  } catch (error) {
    console.error('Erro ao inicializar tabelas SQL:', error);
  } finally {
    client.release();
  }
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const p = getPool();
  if (!p) {
    throw new Error('DATABASE_URL_NOT_CONFIGURED');
  }

  await ensureTablesExist();
  const client = await p.connect();
  try {
    const res = await client.query(sql, params);
    return res.rows as T[];
  } finally {
    client.release();
  }
}

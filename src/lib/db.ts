import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

let pool: Pool | null = null;
let initialized = false;

// Obter pool de conexões com PostgreSQL
export function getPool(): Pool | null {
  if (!databaseUrl) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

// Inicializar tabelas SQL automaticamente se ainda não existirem
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
    `);
    initialized = true;
  } catch (error) {
    console.error('Erro ao inicializar tabelas SQL:', error);
  } finally {
    client.release();
  }
}

// Helper para executar queries SQL parametrizadas
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

// Autenticação Criptográfica com Web Crypto API nativa

const JWT_SECRET = process.env.JWT_SECRET || 'ecosolucoes_default_secure_key_2026';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  companyName: string;
  avatar?: string;
}

// ─── Hash e Verificação de Senha (PBKDF2 com Salt) ───

export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const hashArray = Array.from(new Uint8Array(derivedBits));
  const saltArray = Array.from(salt);
  const saltHex = saltArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return `${saltHex}:${hashHex}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltHex, originalHashHex] = storedHash.split(':');
  if (!saltHex || !originalHashHex) return false;

  const saltBytes = new Uint8Array(
    saltHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  );

  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const hashArray = Array.from(new Uint8Array(derivedBits));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return hashHex === originalHashHex;
}

// ─── Token de Sessão Assinado (HMAC-SHA256) ───

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return Buffer.from(base64, 'base64').toString('utf8');
}

export async function createSessionToken(user: AuthUser): Promise<string> {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64UrlEncode(
    JSON.stringify({
      ...user,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 dias
    })
  );

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    enc.encode(`${header}.${payload}`)
  );

  const signature = base64UrlEncode(
    Buffer.from(signatureBuffer).toString('binary')
  );

  return `${header}.${payload}.${signature}`;
}

export async function verifySessionToken(token: string): Promise<AuthUser | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const enc = new TextEncoder();

    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const sigBuffer = Buffer.from(base64UrlDecode(signature), 'binary');
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBuffer,
      enc.encode(`${header}.${payload}`)
    );

    if (!isValid) return null;

    const data = JSON.parse(base64UrlDecode(payload));
    if (data.exp && Date.now() > data.exp) return null;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      companyName: data.companyName,
      avatar: data.avatar,
    };
  } catch {
    return null;
  }
}

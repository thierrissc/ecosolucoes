// Utilitários de Segurança e Proteção Cibernética

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// ─── 11 & 12. Rate Limiting e Proteção contra Bots / Força Bruta ───
export function checkRateLimit(
  identifier: string,
  maxAttempts = 5,
  windowMs = 5 * 60 * 1000 // 5 minutos
): { allowed: boolean; remaining: number; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  if (record.count >= maxAttempts) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
    console.warn(`[Segurança] Rate limit excedido para identificador: ${identifier.substring(0, 8)}... Tente em ${retryAfterSeconds}s.`);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  record.count += 1;
  return { allowed: true, remaining: maxAttempts - record.count };
}

// Limpar registros expirados a cada 10 minutos
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of rateLimitMap.entries()) {
      if (now > val.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }, 10 * 60 * 1000);
}

// ─── 14 & 15. Validação e Sanitização de Entrada (Evitar XSS / Injeções) ───
export function sanitizeText(str: unknown, maxLength = 255): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '') // remove tags básicas de HTML para evitar XSS
    .trim()
    .slice(0, maxLength);
}

export function isValidEmail(email: unknown): boolean {
  if (typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim()) && email.length <= 120;
}

export function isValidAccessCode(code: unknown): boolean {
  if (typeof code !== 'string') return false;
  // Padrão ECO-XXXX onde caracteres são alfanuméricos
  const clean = code.trim().toUpperCase();
  return /^ECO-[A-Z0-9]{4,12}$/.test(clean);
}

// ─── 16. Validação e Restrição de Upload de Arquivos / Imagens ───
export function validateAvatarPayload(avatarDataUrl: string): { valid: boolean; error?: string } {
  if (!avatarDataUrl) return { valid: true };

  // Validar formato Data URL de imagem
  if (!avatarDataUrl.startsWith('data:image/')) {
    return { valid: false, error: 'Formato de imagem inválido. Apenas imagens são permitidas.' };
  }

  const allowedTypes = ['data:image/png', 'data:image/jpeg', 'data:image/jpg', 'data:image/webp', 'data:image/svg+xml'];
  const matchesType = allowedTypes.some((type) => avatarDataUrl.startsWith(type));

  if (!matchesType) {
    return { valid: false, error: 'Tipo de imagem não suportado. Utilize PNG, JPEG ou WEBP.' };
  }

  // Verificar tamanho aproximado (2MB máximo)
  const sizeInBytes = (avatarDataUrl.length * 3) / 4;
  const maxSize = 2 * 1024 * 1024; // 2MB

  if (sizeInBytes > maxSize) {
    return { valid: false, error: 'A imagem deve ter no máximo 2MB.' };
  }

  return { valid: true };
}

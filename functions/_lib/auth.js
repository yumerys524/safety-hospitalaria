async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hashBuffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function getSession(request, env) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/admin_session=([^;]+)/);
  if (!match) return null;

  const token = decodeURIComponent(match[1]);
  const parts = token.split(':');
  if (parts.length !== 2) return null;
  const [userId, tokenHash] = parts;

  const user = await env.DB.prepare('SELECT id, email, password_hash, role FROM users WHERE id = ?')
    .bind(userId)
    .first();
  if (!user) return null;

  const expectedHash = await sha256Hex(`${user.id}:${user.password_hash}`);
  if (expectedHash !== tokenHash) return null;

  return { id: user.id, email: user.email, role: user.role };
}

export async function verifyLogin(email, password, env) {
  const user = await env.DB.prepare('SELECT id, email, password_hash, role FROM users WHERE email = ?')
    .bind(email.toLowerCase().trim())
    .first();
  if (!user) return null;

  const passwordHash = await sha256Hex(password);
  if (passwordHash !== user.password_hash) return null;

  const tokenHash = await sha256Hex(`${user.id}:${user.password_hash}`);
  return { token: `${user.id}:${tokenHash}`, role: user.role, email: user.email };
}

export async function registerUser(email, password, inviteCode, env) {
  const normalizedEmail = email.toLowerCase().trim();

  let role;
  if (inviteCode === env.ADMIN_INVITE_CODE) {
    role = 'admin';
  } else if (inviteCode === env.CLOSER_INVITE_CODE) {
    role = 'closer';
  } else {
    return { error: 'invalid_invite_code' };
  }

  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(normalizedEmail).first();
  if (existing) {
    return { error: 'email_already_registered' };
  }

  const passwordHash = await sha256Hex(password);
  const result = await env.DB.prepare(
    'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)'
  ).bind(normalizedEmail, passwordHash, role).run();

  const userId = result.meta.last_row_id;
  const tokenHash = await sha256Hex(`${userId}:${passwordHash}`);
  return { token: `${userId}:${tokenHash}`, role, email: normalizedEmail };
}

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function sessionCookieHeaders(token) {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  headers.append(
    'Set-Cookie',
    `admin_session=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
  );
  return headers;
}

import { getSession, jsonResponse } from '../../_lib/auth.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const session = await getSession(request, env);
  if (!session) return jsonResponse({ ok: false }, 401);
  return jsonResponse({ ok: true, email: session.email, role: session.role });
}

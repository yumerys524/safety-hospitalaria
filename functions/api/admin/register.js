import { registerUser, jsonResponse, sessionCookieHeaders } from '../../_lib/auth.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { email, password, inviteCode } = await request.json();

    if (!email || !password || !inviteCode) {
      return jsonResponse({ ok: false, error: 'missing_fields' }, 400);
    }
    if (password.length < 8) {
      return jsonResponse({ ok: false, error: 'password_too_short' }, 400);
    }

    const result = await registerUser(email, password, inviteCode, env);
    if (result.error) {
      return jsonResponse({ ok: false, error: result.error }, 400);
    }

    const headers = sessionCookieHeaders(result.token);
    return new Response(JSON.stringify({ ok: true, role: result.role, email: result.email }), {
      status: 200,
      headers,
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) }, 500);
  }
}

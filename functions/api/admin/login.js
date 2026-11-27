import { verifyLogin, jsonResponse, sessionCookieHeaders } from '../../_lib/auth.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { email, password } = await request.json();
    const session = await verifyLogin(email, password, env);

    if (!session) {
      return jsonResponse({ ok: false, error: 'invalid_credentials' }, 401);
    }

    const headers = sessionCookieHeaders(session.token);
    return new Response(JSON.stringify({ ok: true, role: session.role, email: session.email }), {
      status: 200,
      headers,
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) }, 500);
  }
}

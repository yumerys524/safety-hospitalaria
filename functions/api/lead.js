export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.GHL_WEBHOOK_URL) {
    return new Response(JSON.stringify({ ok: false, error: 'no_webhook_url' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const ghlResponse = await fetch(env.GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const ghlText = await ghlResponse.text();
    return new Response(JSON.stringify({ ok: true, ghlStatus: ghlResponse.status, ghlBody: ghlText }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

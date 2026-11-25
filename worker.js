export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/lead' && request.method === 'POST') {
      if (!env.GHL_WEBHOOK_URL) {
        return new Response(JSON.stringify({ ok: false }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      try {
        const body = await request.json();
        await fetch(env.GHL_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return env.ASSETS.fetch(request);
  },
};

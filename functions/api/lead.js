export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ ok: false, error: 'no_database' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { name, organization, email, teamSize, source } = body;

    await env.DB.prepare(
      `INSERT INTO leads (name, organization, email, team_size, source)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(name || '', organization || '', email || '', teamSize || '', source || '').run();

    return new Response(JSON.stringify({ ok: true }), {
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

import { getSession, jsonResponse } from '../../_lib/auth.js';

export async function onRequestGet(context) {
  const { request, env } = context;

  const session = await getSession(request, env);
  if (!session) return jsonResponse({ ok: false, error: 'unauthorized' }, 401);

  const { results } = await env.DB.prepare(
    `SELECT id, name, organization, email, team_size, source, status, notes, created_at, updated_at
     FROM leads ORDER BY created_at DESC`
  ).all();

  return jsonResponse({ ok: true, leads: results });
}

export async function onRequestPatch(context) {
  const { request, env } = context;

  const session = await getSession(request, env);
  if (!session) return jsonResponse({ ok: false, error: 'unauthorized' }, 401);

  const body = await request.json();
  const { id, status, notes } = body;

  if (!id) return jsonResponse({ ok: false, error: 'missing_id' }, 400);

  const validStatuses = ['nuevo', 'contactado', 'llamada agendada', 'propuesta enviada', 'ganado', 'perdido'];
  if (status && !validStatuses.includes(status)) {
    return jsonResponse({ ok: false, error: 'invalid_status' }, 400);
  }

  const updates = [];
  const values = [];
  if (status !== undefined) {
    updates.push('status = ?');
    values.push(status);
  }
  if (notes !== undefined) {
    updates.push('notes = ?');
    values.push(notes);
  }
  updates.push("updated_at = datetime('now')");
  values.push(id);

  await env.DB.prepare(`UPDATE leads SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();

  return jsonResponse({ ok: true });
}

// SupabaseSync.js
// Optional. If SUPABASE_URL / SUPABASE_KEY env vars are set and the
// @supabase/supabase-js package is installed, every mesh message is
// mirrored into a `mesh_messages` table. If not configured, this is a
// no-op — the mesh runs fully locally without it.

export async function attachSupabaseSync(mesh, { table = 'mesh_messages' } = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) {
    console.log('[SupabaseSync] not configured (SUPABASE_URL/SUPABASE_KEY unset) — running mesh-only, no persistence.');
    return null;
  }

  let createClient;
  try {
    ({ createClient } = await import('@supabase/supabase-js'));
  } catch {
    console.log('[SupabaseSync] @supabase/supabase-js not installed — running mesh-only.');
    return null;
  }

  const client = createClient(url, key);

  mesh.subscribeAll(async (message) => {
    const { error } = await client.from(table).insert({
      id: message.id,
      channel: message.channel,
      source_tool: message.sourceTool,
      payload: message.payload,
      created_at: new Date(message.at).toISOString(),
    });
    if (error) console.error('[SupabaseSync] insert failed:', error.message);
  });

  console.log(`[SupabaseSync] attached — mirroring mesh traffic to "${table}"`);
  return client;
}

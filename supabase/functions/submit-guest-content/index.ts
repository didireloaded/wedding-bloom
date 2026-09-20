import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.98.0';
import { validGuestContent, ownsGuestPhoto } from '../_shared/guest-content-validation.ts';

const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json' } });

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response(null, { headers });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  let body;
  try { body = await req.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
  if (!body || !validGuestContent(body)) return json({ error: 'Invalid submission' }, 400);
  try {
    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body.guest_session));
    const tokenHash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
    const { data: session, error: sessionError } = await db.from('guest_sessions').select('id')
      .eq('wedding_id', body.wedding_id).eq('session_token_hash', tokenHash)
      .is('revoked_at', null).gt('expires_at', new Date().toISOString()).maybeSingle();
    if (sessionError) return json({ error: 'Unable to verify session' }, 503);
    if (!session) return json({ error: 'Please respond to the RSVP first' }, 401);
    const { data: wedding } = await db.from('weddings').select('published').eq('id', body.wedding_id).maybeSingle();
    if (!wedding?.published) return json({ error: 'Wedding unavailable' }, 403);
    let photoUrl = null;
    if (body.storage_path) {
      if (!ownsGuestPhoto(body.storage_path, body.wedding_id, session.id)) return json({ error: 'Invalid photo path' }, 400);
      const bucket = db.storage.from('wedding-assets');
      const { data: info, error } = await bucket.info(body.storage_path);
      if (error || !info || !Number.isFinite(Number(info.size)) || Number(info.size) <= 0 || Number(info.size) > 15 * 1024 * 1024) return json({ error: 'Photo unavailable or too large' }, 400);
      // Inspect the uploaded bytes; never accept a client-provided public URL.
      const { data: image, error: downloadError } = await bucket.download(body.storage_path);
      if (downloadError || !image) return json({ error: 'Photo verification failed' }, 400);
      const bytes = new Uint8Array(await image.slice(0, 3).arrayBuffer());
      if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) return json({ error: 'A JPEG photo is required' }, 400);
      photoUrl = bucket.getPublicUrl(body.storage_path).data.publicUrl;
    }
    const table = body.kind === 'guestbook' ? 'guestbook' : 'wedding_moments';
    const { data, error } = await db.from(table).insert({ wedding_id: body.wedding_id, guest_name: body.guest_name.trim(), message: body.message.trim() || null, photo_url: photoUrl, approved: false }).select('*').single();
    if (error) return json({ error: 'Unable to save submission' }, 500);
    return json(data);
  } catch {
    return json({ error: 'Unable to submit. Please try again.' }, 500);
  }
});

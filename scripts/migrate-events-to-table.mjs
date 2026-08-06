// One-off migration: moves site_settings['events'] (a JSONB blob with legacy string ids)
// into the new `public.events` table (UUID ids), uploading any base64 data-URL images to
// the `event-images` Storage bucket, and rewriting existing `rsvps.event_id` values +
// `site_settings['popupConfig'].eventId` to point at the new UUIDs.
//
// Run once, manually, against production:
//   node --env-file=.env scripts/migrate-events-to-table.mjs
//
// Requires VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (both already in .env).
// Must run AFTER supabase/migrations/20260806120000_events_table.sql has been applied,
// and BEFORE supabase/migrations/20260806123000_rsvps_event_fk.sql is applied.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const EXT_BY_MIME = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

function parseDataUrl(dataUrl) {
  const m = /^data:([^;]+);base64,(.+)$/s.exec(dataUrl);
  if (!m) return null;
  return { mime: m[1], buffer: Buffer.from(m[2], 'base64') };
}

let uploadCounter = 0;

async function migrateImageUrl(url, label) {
  if (!url || typeof url !== 'string' || !url.startsWith('data:')) return url;
  const parsed = parseDataUrl(url);
  if (!parsed) {
    console.warn(`  ! could not parse data URL for ${label}, leaving as-is`);
    return url;
  }
  const ext = EXT_BY_MIME[parsed.mime] || 'bin';
  uploadCounter += 1;
  const path = `migrated/${Date.now()}-${uploadCounter}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from('event-images')
    .upload(path, parsed.buffer, { contentType: parsed.mime, upsert: false });
  if (uploadError) {
    console.error(`  ! upload failed for ${label}: ${uploadError.message}`);
    return url; // leave the base64 blob in place rather than losing the image
  }
  const { data } = supabase.storage.from('event-images').getPublicUrl(path);
  console.log(`  uploaded ${label} -> ${data.publicUrl}`);
  return data.publicUrl;
}

async function main() {
  console.log('Reading site_settings...');
  const { data: settingsRows, error: settingsErr } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['events', 'popupConfig']);
  if (settingsErr) throw settingsErr;

  const settingsMap = new Map((settingsRows || []).map((r) => [r.key, r.value]));
  const legacyEvents = settingsMap.get('events') || [];
  const popupConfig = settingsMap.get('popupConfig') || null;

  if (!Array.isArray(legacyEvents) || legacyEvents.length === 0) {
    console.log('No events found in site_settings — nothing to migrate.');
  }

  console.log(`Found ${legacyEvents.length} legacy event(s).`);

  const legacyToNewId = new Map();
  let imagesUploaded = 0;

  for (const ev of legacyEvents) {
    console.log(`\nMigrating "${ev.title}" (legacy id ${ev.id})...`);

    const beforeCounter = uploadCounter;
    const imageUrl = await migrateImageUrl(ev.imageUrl, `${ev.title} thumbnail`);
    const media = [];
    for (const item of ev.media || []) {
      const migratedUrl = await migrateImageUrl(item.url, `${ev.title} gallery item`);
      media.push({ ...item, url: migratedUrl });
    }
    imagesUploaded += uploadCounter - beforeCounter;

    const insertRow = {
      legacy_id: ev.id,
      title: ev.title,
      date_text: ev.date || '',
      start_date: ev.startDate || null,
      end_date: ev.endDate || null,
      description: ev.description || '',
      image_url: imageUrl || '/placeholder.svg',
      video_url: ev.videoUrl || null,
      media,
      type: ev.type || 'upcoming',
      rsvp_link: ev.rsvpLink || null,
      photos_link: ev.photosLink || null,
    };

    const { data: inserted, error: insertErr } = await supabase
      .from('events')
      .insert(insertRow)
      .select('id')
      .single();
    if (insertErr) {
      console.error(`  ! insert failed for "${ev.title}": ${insertErr.message}`);
      continue;
    }
    legacyToNewId.set(ev.id, inserted.id);
    console.log(`  inserted as ${inserted.id}`);
  }

  // Rewrite popupConfig.eventId if it points at a migrated legacy id.
  if (popupConfig && popupConfig.mode === 'specific' && popupConfig.eventId) {
    const newId = legacyToNewId.get(popupConfig.eventId);
    if (newId) {
      const updatedConfig = { ...popupConfig, eventId: newId };
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'popupConfig', value: updatedConfig, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      if (error) console.error(`  ! failed to update popupConfig: ${error.message}`);
      else console.log(`\nUpdated popupConfig.eventId: ${popupConfig.eventId} -> ${newId}`);
    } else {
      console.warn(`\n! popupConfig.eventId "${popupConfig.eventId}" did not match any migrated event — left unchanged.`);
    }
  }

  // Rewrite existing rsvps.event_id values (column is still TEXT at this point).
  console.log('\nReading existing rsvps...');
  const { data: rsvpRows, error: rsvpErr } = await supabase.from('rsvps').select('id, event_id');
  if (rsvpErr) throw rsvpErr;

  const orphaned = [];
  let rsvpsUpdated = 0;
  for (const r of rsvpRows || []) {
    const newId = legacyToNewId.get(r.event_id);
    if (!newId) {
      orphaned.push(r);
      continue;
    }
    const { error } = await supabase.from('rsvps').update({ event_id: newId }).eq('id', r.id);
    if (error) {
      console.error(`  ! failed to update rsvp ${r.id}: ${error.message}`);
    } else {
      rsvpsUpdated += 1;
    }
  }

  console.log('\n===== MIGRATION REPORT =====');
  console.log(`Events migrated:     ${legacyToNewId.size} / ${legacyEvents.length}`);
  console.log(`Images uploaded:     ${imagesUploaded}`);
  console.log(`RSVPs remapped:      ${rsvpsUpdated}`);
  console.log(`RSVPs orphaned:      ${orphaned.length}`);
  if (orphaned.length > 0) {
    console.log('\nOrphaned rsvps (event_id did not match any legacy event — left UNCHANGED):');
    for (const r of orphaned) {
      console.log(`  rsvp id=${r.id} event_id="${r.event_id}"`);
    }
    console.log('\nThese must be resolved (e.g. nulled out) before running the second SQL');
    console.log('migration (20260806123000_rsvps_event_fk.sql), which requires every');
    console.log('rsvps.event_id to be castable to a UUID.');
  } else {
    console.log('\nNo orphaned rsvps — safe to proceed to the rsvps_event_fk migration.');
  }
  console.log('=============================\n');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

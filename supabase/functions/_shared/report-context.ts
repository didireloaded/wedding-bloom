export async function reportContext(db: any, weddingId: string) {
  const results = await Promise.all([
    db.from('weddings').select('couple_names,wedding_date,ceremony_venue,reception_venue,published,rsvp_deadline').eq('id', weddingId).single(),
    db.from('rsvps').select('attending,guest_count,dietary_preference,submitted_at').eq('wedding_id', weddingId),
    db.from('events').select('title,event_date,event_time,location').eq('wedding_id', weddingId),
    db.from('wedding_tasks').select('title,due_date,completed_at,target_tab').eq('wedding_id', weddingId),
    db.from('guest_photos').select('id', { count: 'exact', head: true }).eq('wedding_id', weddingId).eq('approved', false),
    db.from('guestbook').select('id', { count: 'exact', head: true }).eq('wedding_id', weddingId).eq('approved', false),
    db.from('wedding_guest_details').select('parking,transport,accessibility,contact_name').eq('wedding_id', weddingId).maybeSingle(),
  ]);
  if (results.some(result => result.error)) throw new Error('Wedding details could not be loaded for the report.');
  const rsvps = results[1].data || [];
  return {
    as_of: new Date().toISOString(), wedding: results[0].data,
    stats: {
      responses: rsvps.length,
      confirmed: rsvps.filter((row: any) => row.attending === true).length,
      confirmed_people: rsvps.filter((row: any) => row.attending === true).reduce((sum: number, row: any) => sum + row.guest_count, 0),
      undecided: rsvps.filter((row: any) => row.attending === null).length,
      declined: rsvps.filter((row: any) => row.attending === false).length,
      photos_to_review: results[4].count,
      messages_to_review: results[5].count,
    },
    events: results[2].data, next_steps: results[3].data, guest_details: results[6].data,
    dietary_responses: rsvps.filter((row: any) => row.attending === true && row.dietary_preference).map((row: any) => ({ preference: row.dietary_preference, party_size: row.guest_count })),
  };
}

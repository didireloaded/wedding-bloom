export type ScheduleEvent = {
  id: string;
  title: string;
  event_time: string | null;
  location: string | null;
  description: string | null;
};

export function weddingSchedule(events: ScheduleEvent[], wedding?: {
  ceremony_time?: string | null; ceremony_venue?: string | null;
  reception_time?: string | null; reception_venue?: string | null;
} | null): ScheduleEvent[] {
  if (events.length || !wedding) return events;
  return ["ceremony", "reception"].flatMap(kind => {
    const time = kind === "ceremony" ? wedding.ceremony_time : wedding.reception_time;
    const venue = kind === "ceremony" ? wedding.ceremony_venue : wedding.reception_venue;
    if (!time && !venue) return [];
    return [{ id: `details-${kind}`, title: kind === "ceremony" ? "Ceremony" : "Reception", event_time: time || null, location: venue || null, description: null }];
  });
}

import { CalendarDays, ChevronDown, Clock, MapPin, Pencil, Trash2 } from 'lucide-react';

export function timeMinutes(value: string | null) {
  const match = value?.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if (!match) return Infinity;
  let hour = Number(match[1]);
  if (match[3]) hour = hour % 12 + (match[3].toUpperCase() === 'PM' ? 12 : 0);
  return hour * 60 + Number(match[2]);
}

export default function CalendarTimeline({ events, onEdit, onDelete }: { events: any[]; onEdit: (event: any) => void; onDelete: (id: string) => void }) {
  const sorted = [...events].sort((a, b) => timeMinutes(a.event_time) - timeMinutes(b.event_time));
  return <div className="fv-timeline">{sorted.map((event, index) => <div className="fv-timeline-row" key={event.id}>
    <div className="fv-timeline-time"><time>{event.event_time || 'Time TBC'}</time><span /></div>
    <details className={`fv-agenda-card fv-agenda-${index % 3}`}>
      <summary><span className="fv-agenda-icon"><CalendarDays size={18} /></span><span className="fv-agenda-title"><strong>{event.title}</strong><small>{event.location || 'Wedding event'}</small></span><ChevronDown className="fv-agenda-chevron" size={17} /></summary>
      <div className="fv-agenda-details"><p><Clock size={15} />{event.event_time || 'Time to be confirmed'}</p>{event.location && <p><MapPin size={15} />{event.location}</p>}<p className="fv-agenda-description">{event.description || 'No additional details yet.'}</p><div className="fv-agenda-actions"><button onClick={() => onEdit(event)} aria-label={`Edit ${event.title}`}><Pencil size={16} />Edit</button><button onClick={() => onDelete(event.id)} aria-label={`Delete ${event.title}`}><Trash2 size={16} />Delete</button></div></div>
    </details>
  </div>)}</div>;
}

import { ArrowUpRight, CalendarDays, Check, Clock, Image, Users } from 'lucide-react';

export default function CoupleOverview({ wedding, progress, completedTasks, totalTasks, pending, events, rsvps, onTabChange }: any) {
  const confirmed = rsvps.filter((r: any) => r.attending === true).length;
  const declined = rsvps.filter((r: any) => r.attending === false).length;
  const date = wedding.wedding_date ? new Date(`${wedding.wedding_date.slice(0, 10)}T12:00:00`) : null;
  const days = date ? Math.max(0, Math.ceil((date.getTime() - Date.now()) / 86400000)) : null;
  const needs = [
    { label: 'Wedding details', done: Boolean(wedding.wedding_date && wedding.ceremony_venue), tab: 'profile' },
    { label: 'Guest responses', done: rsvps.length > 0 && !pending, tab: 'guests' },
    { label: 'Wedding schedule', done: events.length > 0, tab: 'calendar' },
    { label: 'Invitation published', done: Boolean(wedding.published), tab: 'profile' },
  ];
  return <div className="fv-overview">
    <section className="fv-day-card">
      <div className="fv-row"><span><CalendarDays size={17} />{date ? date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : 'Your celebration'}</span><button onClick={() => onTabChange('updates')}>Daily report <ArrowUpRight size={13} /></button></div>
      <p>{days === 0 ? 'Your next chapter' : days === null ? 'Let the planning begin' : `${days} days until your day`}</p>
      <h1>{wedding.couple_names || 'Your wedding'}</h1>
      <span className="fv-day-foot">{pending ? `${pending} guest response${pending === 1 ? '' : 's'} to follow up` : 'A little closer to your celebration'}</span>
    </section>
    <div className="fv-bento">
      <section className="fv-priorities"><h2>The essentials</h2>{needs.map(item => <button key={item.label} onClick={() => onTabChange(item.tab)}><span className={item.done ? 'fv-check checked' : 'fv-check'}>{item.done && <Check size={12} />}</span>{item.label}<ArrowUpRight size={13} /></button>)}</section>
      <div className="fv-bento-stack"><button className="fv-readiness" onClick={() => onTabChange('profile')}><div className="fv-ring" style={{ background: `conic-gradient(#f74896 ${Math.max(0, Math.min(100, progress))}%, #363636 0)` }}><span>{progress}%</span></div><strong>Wedding readiness</strong><small>{completedTasks} of {totalTasks} details ready</small></button><button className="fv-response-tile" onClick={() => onTabChange('guests')}><Users size={20} /><strong>{confirmed}</strong><small>Confirmed responses</small></button></div>
    </div>
    <section className="fv-section"><div className="fv-section-title"><h2>Guest responses</h2><button onClick={() => onTabChange('guests')} aria-label="View guests"><ArrowUpRight size={20} /></button></div>
      <div className="fv-segments" aria-label={`${confirmed} confirmed, ${pending} undecided, ${declined} declined`}>{[{ value: confirmed, color: '#b2dc6b' }, { value: pending, color: '#22c4b5' }, { value: declined, color: '#fa7589' }].map((part, i) => <span key={i} style={{ flex: part.value || .15, background: rsvps.length ? part.color : '#333' }} />)}</div>
      <div className="fv-response-labels"><span><i style={{ background: '#b2dc6b' }} />Confirmed <b>{confirmed}</b></span><span><i style={{ background: '#22c4b5' }} />Undecided <b>{pending}</b></span><span><i style={{ background: '#fa7589' }} />Declined <b>{declined}</b></span></div>
    </section>
    <section className="fv-section"><div className="fv-section-title"><h2>On the calendar</h2><button onClick={() => onTabChange('calendar')} aria-label="Open calendar"><ArrowUpRight size={20} /></button></div>{events.length ? events.slice(0, 2).map((event: any, i: number) => <button className={`fv-event-preview tone-${i}`} key={event.id} onClick={() => onTabChange('calendar')}><span><CalendarDays size={15} />{event.event_date || wedding.wedding_date || 'Date to be set'}</span><strong>{event.title}</strong><small><Clock size={13} />{event.event_time || 'Time to be set'}{event.location ? ` · ${event.location}` : ''}</small></button>) : <button className="fv-empty-action" onClick={() => onTabChange('calendar')}>Add your first wedding event <ArrowUpRight size={17} /></button>}</section>
    {wedding.cover_image && <button className="fv-photo-link" onClick={() => onTabChange('moments')}><img src={wedding.cover_image} alt={wedding.couple_names} /><span><Image size={17} />Your memories<ArrowUpRight size={17} /></span></button>}
  </div>;
}

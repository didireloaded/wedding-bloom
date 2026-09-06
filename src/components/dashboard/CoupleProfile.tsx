import { ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, Bell, ChevronRight, ClipboardCheck, Globe2, Info, LogOut, Pencil, Wallet } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import NotificationPreferences from './NotificationPreferences';

type Props = { wedding: any; onEdit: () => void; publishing: ReactNode; information: ReactNode; budget: ReactNode; readiness: ReactNode };
export default function CoupleProfile({ wedding, onEdit, publishing, information, budget, readiness }: Props) {
  const [params, setParams] = useSearchParams();
  const { signOut } = useAuth();
  const sections = [
    { id: 'publishing', title: 'Invitation and sharing', subtitle: wedding.published ? 'Published and ready to share' : 'Preview and publish your invitation', icon: Globe2, content: publishing },
    { id: 'budget', title: 'Budget', subtitle: 'Your spending, all in one place', icon: Wallet, content: budget },
    { id: 'information', title: 'Guest information', subtitle: 'Directions, travel and useful details', icon: Info, content: information },
    { id: 'notifications', title: 'Notifications', subtitle: 'Choose what reaches you', icon: Bell, content: <NotificationPreferences weddingId={wedding.id} /> },
    { id: 'readiness', title: 'Wedding readiness', subtitle: 'Finish the details before you share', icon: ClipboardCheck, content: readiness },
  ];
  const current = sections.find(item => item.id === params.get('section'));
  const open = (section?: string) => { const next = new URLSearchParams(params); section ? next.set('section', section) : next.delete('section'); setParams(next); };
  if (current) return <div className="fv-profile-detail"><header className="fv-detail-header"><button onClick={() => open()} className="fv-icon-button" aria-label="Back to profile"><ArrowLeft size={20} /></button><h1>{current.title}</h1></header>{current.content}</div>;
  return <div className="fv-profile">
    <h1>Profile</h1>
    <div className="fv-identity">{wedding.cover_image ? <img src={wedding.cover_image} alt="Couple photo" /> : <span className="fv-avatar">{String(wedding.couple_names || 'F').charAt(0)}</span>}<div><h2>{wedding.couple_names}</h2><p>{wedding.wedding_date ? new Date(`${wedding.wedding_date.slice(0, 10)}T12:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : 'Wedding date to be set'}</p></div><span className="fv-status">{wedding.published ? 'Live' : 'Draft'}</span></div>
    <div className="fv-profile-group"><h2>Your wedding</h2><button onClick={onEdit} className="fv-settings-row"><Pencil size={20} /><span><strong>Wedding details</strong><small>Date, venues and contact details</small></span><ChevronRight size={18} /></button>{sections.slice(0, 3).map(item => <button key={item.id} onClick={() => open(item.id)} className="fv-settings-row"><item.icon size={20} /><span><strong>{item.title}</strong><small>{item.subtitle}</small></span><ChevronRight size={18} /></button>)}</div>
    <div className="fv-profile-group"><h2>Preferences</h2>{sections.slice(3).map(item => <button key={item.id} onClick={() => open(item.id)} className="fv-settings-row"><item.icon size={20} /><span><strong>{item.title}</strong><small>{item.subtitle}</small></span><ChevronRight size={18} /></button>)}</div>
    <button className="fv-signout" onClick={() => void signOut()}><LogOut size={18} />Sign out</button>
  </div>;
}

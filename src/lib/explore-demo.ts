import { z } from 'zod';

export const DEMO_KEY = 'forevervow-explore-v2';
export const demoPhoto = '/demo/couple.jpg';
export const locations = ['Windhoek', 'Swakopmund', 'Rehoboth'] as const;
export const categories = ['Venue', 'Food & drinks', 'Photography', 'Flowers', 'Attire', 'Other'] as const;
export const categoryColors = ['#b7df75', '#20c6b5', '#f5a5be', '#b8bfff', '#ffc16f', '#fc7358'];
const guestSchema = z.object({ id: z.string(), name: z.string().max(80), status: z.enum(['Confirmed', 'Not sure', 'Declined']), party: z.number().int().min(1).max(6), meal: z.string(), town: z.string() });
export type DemoGuest = z.infer<typeof guestSchema>;
const schema = z.object({
  names: z.string().min(1).max(60), town: z.enum(locations), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), published: z.boolean(), budget: z.number().positive().max(100000000),
  guests: z.array(guestSchema),
  expenses: z.array(z.object({ id: z.string(), name: z.string().max(80), amount: z.number().positive().max(10000000), category: z.enum(categories) })),
  events: z.array(z.object({ id: z.string(), time: z.string(), title: z.string().max(80), place: z.string().max(80), detail: z.string() })),
  tasks: z.array(z.object({ id: z.string(), title: z.string(), done: z.boolean() })),
  updates: z.array(z.object({ id: z.string(), text: z.string().max(1000), time: z.string() })),
  wishes: z.array(z.object({ id: z.string(), name: z.string().max(80), text: z.string().max(500) })),
  photos: z.array(z.object({ id: z.string(), src: z.string().regex(/^(\/demo\/|data:image\/(jpeg|png|webp);base64,)/), caption: z.string().max(100), by: z.string(), approved: z.boolean(), liked: z.boolean() })),
  reminders: z.array(z.string()), visited: z.array(z.string()),
});
export type DemoState = z.infer<typeof schema>;
export function freshDemo(): DemoState {
  return {
    names: 'Amara & Elias', town: 'Windhoek', date: '2027-11-21', published: true, budget: 85000,
    guests: [
      { id: 'g1', name: 'Anna Shilongo', status: 'Confirmed', party: 2, meal: 'Vegetarian', town: 'Windhoek' },
      { id: 'g2', name: 'Daniel Beukes', status: 'Confirmed', party: 2, meal: 'No preference', town: 'Rehoboth' },
      { id: 'g3', name: 'Selma Amutenya', status: 'Not sure', party: 1, meal: 'No preference', town: 'Oshakati' },
      { id: 'g4', name: 'Mia de Klerk', status: 'Confirmed', party: 1, meal: 'No preference', town: 'Swakopmund' },
      { id: 'g5', name: 'Petrus !Gawaxab', status: 'Declined', party: 1, meal: 'No preference', town: 'Walvis Bay' },
      { id: 'g6', name: 'Lydia Nghipandulwa', status: 'Confirmed', party: 2, meal: 'Gluten-free', town: 'Windhoek' },
      { id: 'g7', name: 'Noah van Wyk', status: 'Not sure', party: 2, meal: 'No preference', town: 'Keetmanshoop' },
    ],
    expenses: [{ id: 'e1', name: 'Venue deposit', amount: 18000, category: 'Venue' }, { id: 'e2', name: 'Dinner & welcome drinks', amount: 14500, category: 'Food & drinks' }, { id: 'e3', name: 'Wedding photography', amount: 8000, category: 'Photography' }, { id: 'e4', name: 'Flowers for the day', amount: 6500, category: 'Flowers' }, { id: 'e5', name: 'Wedding attire', amount: 4200, category: 'Attire' }],
    events: [{ id: 's1', time: '15:00', title: 'A warm welcome', place: 'Garden entrance', detail: 'Welcome drinks, a familiar face and a little time to settle in.' }, { id: 's2', time: '15:30', title: 'We say I do', place: 'Acacia House garden', detail: 'An intimate ceremony with our favourite people. Please be seated by 15:20.' }, { id: 's3', time: '16:30', title: 'Golden-hour together', place: 'The terrace', detail: 'Family photographs, canapes and a toast to what comes next.' }, { id: 's4', time: '18:00', title: 'Dinner, stories & dancing', place: 'The dining room', detail: 'Dinner at 18:00, speeches at 19:00 and our first dance at 19:30.' }],
    tasks: [{ id: 't1', title: 'Publish our invitation', done: true }, { id: 't2', title: 'Confirm the ceremony', done: true }, { id: 't3', title: 'Book our photographer', done: true }, { id: 't4', title: 'Choose our flowers', done: true }, { id: 't5', title: 'Share travel details', done: true }, { id: 't6', title: 'Check dietary preferences', done: true }, { id: 't7', title: 'Confirm the final guest count', done: false }, { id: 't8', title: 'Choose our first dance', done: false }],
    updates: [{ id: 'u1', text: 'A little note for our out-of-town guests: our welcome gathering is on the terrace at 15:00. We cannot wait to see you in Windhoek.', time: 'Today' }, { id: 'u2', text: 'Our dress code is garden formal. Bring a light layer for the evening and your favourite dancing shoes.', time: 'Yesterday' }],
    wishes: [{ id: 'w1', name: 'Anna & Thomas', text: 'Here is to a lifetime of little adventures. We are so happy for you both!' }, { id: 'w2', name: 'Mia', text: 'From Swakopmund with love. Counting down the days until we celebrate!' }],
    photos: [{ id: 'p1', src: demoPhoto, caption: 'The start of forever', by: 'Wedding album', approved: true, liked: false }, { id: 'p2', src: '/demo/celebration.jpg', caption: 'All the little moments', by: 'Inspiration album', approved: true, liked: false }, { id: 'p3', src: '/demo/together.jpg', caption: 'Hand in hand', by: 'Inspiration album', approved: true, liked: false }],
    reminders: [], visited: [],
  };
}
export function loadDemo(raw: string | null): DemoState {
  try { return schema.parse(JSON.parse(raw || 'null')); } catch { return freshDemo(); }
}
export function demoTotals(state: DemoState) {
  const spent = Math.round(state.expenses.reduce((sum, e) => sum + e.amount, 0) * 100) / 100;
  return { spent, remaining: state.budget - spent, confirmed: state.guests.filter(g => g.status === 'Confirmed').reduce((sum, g) => sum + g.party, 0), waiting: state.guests.filter(g => g.status === 'Not sure').length, declined: state.guests.filter(g => g.status === 'Declined').length, readiness: Math.round(state.tasks.filter(t => t.done).length / state.tasks.length * 100) };
}
export const money = (value: number) => `N$ ${value.toLocaleString('en-NA', { maximumFractionDigits: 2 })}`;
export const weddingDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

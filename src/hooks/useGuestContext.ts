import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getGuestSessionToken } from '@/lib/guestSession';

export type GuestResponse = { id: string; guest_name: string; attending: boolean | null; guest_count: number; email: string | null; phone: string | null; dietary_preference: string | null; dietary_note: string | null; message: string | null };
export type GuestNotification = { id: string; title: string; body: string; target_url: string; read_at: string | null; created_at: string };
export type GuestContext = { notifications: GuestNotification[]; response: GuestResponse; checked_in: boolean };

export function useGuestContext(weddingId?: string) {
  const client = useQueryClient();
  const [session, setSession] = useState<string | null>(null);
  useEffect(() => {
    const refresh = () => {
      setSession(weddingId ? getGuestSessionToken(weddingId) : null);
      void client.invalidateQueries({ queryKey: ['guest-context', weddingId] });
    };
    refresh();
    window.addEventListener('forevervow:guest-session', refresh);
    window.addEventListener('storage', refresh);
    window.addEventListener('forevervow:guest-realtime', refresh);
    return () => {
      window.removeEventListener('forevervow:guest-session', refresh);
      window.removeEventListener('storage', refresh);
      window.removeEventListener('forevervow:guest-realtime', refresh);
      client.removeQueries({ queryKey: ['guest-context', weddingId] });
    };
  }, [client, weddingId]);
  const query = useQuery({
    queryKey: ['guest-context', weddingId, session],
    enabled: Boolean(weddingId && session && weddingId !== 'preview-wedding'),
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-guest-notifications', { body: { wedding_id: weddingId, guest_session: session } });
      if (error || data?.error) throw new Error('Your saved response and updates could not be loaded. Please retry or contact the couple.');
      return data as GuestContext;
    },
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: 1,
  });
  return { ...query, session };
}

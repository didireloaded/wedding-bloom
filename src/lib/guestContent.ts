import { supabase } from '@/integrations/supabase/client';
import { getGuestSessionToken } from './guestSession';

export async function submitGuestContent(weddingId: string, kind: 'guestbook' | 'moment', name: string, message: string, photo: File | null) {
  const session = getGuestSessionToken(weddingId);
  if (!session) throw new Error('Please respond to the RSVP before sharing.');
  let path: string | null = null;
  if (photo) {
    if (!photo.type.startsWith('image/') || photo.size > 15 * 1024 * 1024) {
      throw new Error('Choose an image smaller than 15 MB.');
    }
    const image = await createImageBitmap(photo);
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 1800 / Math.max(image.width, image.height));
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext('2d');
    if (!context) { image.close(); throw new Error('Unable to prepare this photo.'); }
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    image.close();
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(
      value => value ? resolve(value) : reject(new Error('Unable to prepare this photo.')), 'image/jpeg', 0.84,
    ));
    const registration = await supabase.functions.invoke('register-memory-upload', {
      body: { wedding_id: weddingId, guest_session: session, file_name: 'photo.jpg', mime_type: 'image/jpeg', file_size: blob.size },
    });
    if (registration.error || !registration.data?.upload_token) throw new Error('Could not authorize your photo. Please check your RSVP session.');
    path = registration.data.storage_path;
    const uploaded = await supabase.storage.from('wedding-assets').uploadToSignedUrl(path!, registration.data.upload_token, blob, { contentType: 'image/jpeg' });
    if (uploaded.error) throw new Error('Photo upload failed. Please try again.');
  }
  const response = await supabase.functions.invoke('submit-guest-content', {
    body: { wedding_id: weddingId, guest_session: session, kind, guest_name: name.trim(), message: message.trim(), storage_path: path },
  });
  if (response.error || !response.data?.id) throw new Error('Could not submit your message. Please check your connection and RSVP session.');
  return response.data;
}

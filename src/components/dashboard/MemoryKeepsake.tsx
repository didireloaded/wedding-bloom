import { useState } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

type Memory = { id: string; image_url?: string; photo_url?: string; guest_name?: string; message?: string; created_at?: string; approved?: boolean };
export default function MemoryKeepsake({ wedding, gallery, photos, messages, moments }: { wedding: { couple_names: string; wedding_date?: string; slug: string }; gallery: Memory[]; photos: Memory[]; messages: Memory[]; moments: Memory[] }) {
  const [busy, setBusy] = useState(false);
  const entries = [...gallery, ...photos.filter(row => row.approved), ...messages.filter(row => row.approved), ...moments.filter(row => row.approved)].sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
  const pictures = entries.filter(row => row.image_url || row.photo_url);
  const download = async () => {
    setBusy(true);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const pdf = await PDFDocument.create();
      pdf.setTitle(`${wedding.couple_names} - Our wedding memories`);
      const canvas = document.createElement('canvas');
      canvas.width = 1200; canvas.height = 1696;
      const ctx = canvas.getContext('2d')!;
      let y = 100;
      const reset = () => { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#202020'; y = 100; };
      const page = async () => {
        const image = await pdf.embedJpg(canvas.toDataURL('image/jpeg', .85));
        pdf.addPage([600, 848]).drawImage(image, { x: 0, y: 0, width: 600, height: 848 });
        reset();
      };
      const text = async (value: string, size = 28) => {
        ctx.font = `${size}px sans-serif`;
        let line = '';
        for (const char of value) {
          if (char === '\n' || ctx.measureText(line + char).width > 1000) {
            if (y > 1560) { await page(); ctx.font = `${size}px sans-serif`; }
            ctx.fillText(line, 100, y); y += size * 1.5; line = '';
          }
          if (char !== '\n') line += char;
        }
        if (y > 1560) { await page(); ctx.font = `${size}px sans-serif`; }
        ctx.fillText(line, 100, y); y += size * 1.8;
      };
      reset();
      await text(wedding.couple_names, 56);
      await text('Our wedding memories', 36);
      if (wedding.wedding_date) await text(new Date(`${wedding.wedding_date.slice(0, 10)}T12:00:00`).toLocaleDateString());
      await page();
      let skipped = 0;
      for (const entry of entries) {
        if (y > 1200) await page();
        await text(entry.guest_name || 'From our wedding', 32);
        if (entry.created_at) await text(new Date(entry.created_at).toLocaleDateString(), 22);
        const url = entry.image_url || entry.photo_url;
        if (url) {
          try {
            const image = new Image(); image.crossOrigin = 'anonymous';
            await new Promise<void>((resolve, reject) => { const timer = setTimeout(() => reject(new Error('Image timed out')), 10000); image.onload = () => { clearTimeout(timer); resolve(); }; image.onerror = () => { clearTimeout(timer); reject(new Error('Image unavailable')); }; image.src = url; });
            const scale = Math.min(1000 / image.naturalWidth, 850 / image.naturalHeight);
            const width = image.naturalWidth * scale, height = image.naturalHeight * scale;
            if (y + height > 1560) await page();
            ctx.drawImage(image, (1200 - width) / 2, y, width, height); y += height + 50;
          } catch { skipped++; await text('Photo unavailable in this download.', 24); }
        }
        if (entry.message) await text(entry.message);
        y += 40;
      }
      if (y > 100) await page();
      const bytes = await pdf.save();
      const url = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }));
      const link = document.createElement('a'); link.href = url; link.download = `${wedding.slug}-memories.pdf`; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      if (skipped) toast.warning(`Keepsake downloaded with ${skipped} unavailable photo${skipped === 1 ? '' : 's'}.`);
      else toast.success('Your keepsake is ready.');
    } catch { toast.error('Your keepsake could not be created. Please retry.'); }
    finally { setBusy(false); }
  };
  return <section className="space-y-3 font-body"><h3 className="text-xl font-semibold">Your wedding keepsake</h3>
    {pictures.length > 0 && <div className="grid grid-cols-3 gap-2 overflow-hidden rounded-3xl">{pictures.slice(0, 3).map(row => <img key={row.id} src={row.image_url || row.photo_url} alt="Wedding memory" className="aspect-square w-full object-cover" loading="lazy" />)}</div>}
    <p className="text-sm text-muted-foreground">{entries.length ? `${entries.length} approved memories, together in one keepsake.` : 'Your approved photos and messages will appear here.'}</p>
    <button onClick={() => void download()} disabled={busy || !entries.length} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white disabled:opacity-40"><Download className="h-4 w-4" />{busy ? 'Preparing keepsake...' : 'Download keepsake'}</button>
  </section>;
}

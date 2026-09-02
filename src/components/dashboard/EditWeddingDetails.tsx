import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

interface EditWeddingDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wedding: any;
  weddingId: string;
  accessCode: string;
  onSaved: () => void;
}

const EditWeddingDetails = ({
  open,
  onOpenChange,
  wedding,
  weddingId,
  accessCode,
  onSaved,
}: EditWeddingDetailsProps) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    wedding_date: "",
    ceremony_venue: "",
    reception_venue: "",
    ceremony_time: "",
    reception_time: "",
    dress_code: "",
    story: "",
    contact_email: "",
  });

  useEffect(() => {
    if (wedding && open) {
      setForm({
        wedding_date: wedding.wedding_date || "",
        ceremony_venue: wedding.ceremony_venue || "",
        reception_venue: wedding.reception_venue || "",
        ceremony_time: wedding.ceremony_time || "",
        reception_time: wedding.reception_time || "",
        dress_code: wedding.dress_code || "",
        story: wedding.story || "",
        contact_email: wedding.contact_email || "",
      });
    }
  }, [wedding, open]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/couple-update-wedding`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wedding_id: weddingId,
            access_code: accessCode,
            updates: form,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to save changes");
        return;
      }
      toast.success("Wedding details updated!");
      onSaved();
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const fields: { key: string; label: string; type: "text" | "date" | "textarea" }[] = [
    { key: "wedding_date", label: "Wedding Date", type: "date" },
    { key: "ceremony_venue", label: "Ceremony Venue", type: "text" },
    { key: "ceremony_time", label: "Ceremony Time", type: "text" },
    { key: "reception_venue", label: "Reception Venue", type: "text" },
    { key: "reception_time", label: "Reception Time", type: "text" },
    { key: "dress_code", label: "Dress Code", type: "text" },
    { key: "contact_email", label: "Contact Email", type: "text" },
    { key: "story", label: "Our Story", type: "textarea" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-light">
            Edit Wedding Details
          </DialogTitle>
          <DialogDescription className="font-body text-xs text-muted-foreground">
            Update your wedding information. Changes will appear on your wedding page immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground block mb-1.5">
                {field.label}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  value={(form as any)[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  maxLength={2000}
                  rows={4}
                  className="w-full border border-border bg-background px-3 py-2 font-body text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20 resize-none"
                />
              ) : (
                <input
                  type={field.type}
                  value={(form as any)[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  maxLength={200}
                  className="w-full border border-border bg-background px-3 py-2 font-body text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20 min-h-[40px]"
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="px-4 py-2 border border-border font-body text-xs tracking-[0.15em] uppercase hover:bg-muted transition-colors min-h-[40px]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-foreground text-background font-body text-xs tracking-[0.15em] uppercase hover:bg-foreground/90 transition-colors min-h-[40px] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditWeddingDetails;

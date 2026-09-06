import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
      const updates = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim() || null]));
      const { error } = await supabase.from("weddings").update(updates).eq("id", weddingId);
      if (error) throw error;
      toast.success("Wedding details updated.");
      onSaved();
      onOpenChange(false);
    } catch {
      toast.error("Wedding details could not be saved.");
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
      <DialogContent className="w-[calc(100%-24px)] max-w-lg max-h-[85dvh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-body text-xl font-semibold">
            Edit Wedding Details
          </DialogTitle>
          <DialogDescription className="font-body text-xs text-muted-foreground">
            Update your wedding information. Changes will appear on your wedding page immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {fields.map((field) => (
            <div key={field.key}>
              <label htmlFor={`wedding-${field.key}`} className="font-body text-xs text-muted-foreground block mb-1.5">
                {field.label}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  id={`wedding-${field.key}`}
                  value={(form as any)[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  maxLength={2000}
                  rows={4}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 font-body text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              ) : (
                <input
                  id={`wedding-${field.key}`}
                  type={field.type}
                  value={(form as any)[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  maxLength={200}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 font-body text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="rounded-full px-4 py-2 border border-border font-body text-xs hover:bg-muted transition-colors min-h-[44px]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-full px-5 py-2 bg-primary text-primary-foreground font-body text-xs min-h-[44px] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditWeddingDetails;

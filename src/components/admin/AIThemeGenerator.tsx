import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LoaderCircle, Palette } from "lucide-react";
import { motion } from "framer-motion";

interface Theme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  primary_name: string;
  secondary_name: string;
  accent_name: string;
  font_display: string;
  font_body: string;
}

interface DBTheme {
  id: string;
  name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  foreground_color: string;
  font_display: string;
  font_body: string;
  generated_by_ai: boolean;
}

interface AIThemeGeneratorProps {
  coupleNames: string;
  currentStyle?: string;
  onStyleChange: (style: string) => void;
  onThemeGenerated: (theme: Theme) => void;
}

const AIThemeGenerator = ({ coupleNames, currentStyle, onStyleChange, onThemeGenerated }: AIThemeGeneratorProps) => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<Theme | null>(null);
  const [dbThemes, setDbThemes] = useState<DBTheme[]>([]);

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    const { data, error } = await supabase.from("themes").select("*").order("generated_by_ai").order("name");
    if (error) toast.error("Wedding styles could not be loaded. Try again later.");
    if (data) setDbThemes(data);
  };

  const selectExistingTheme = (theme: DBTheme) => {
    const converted: Theme = {
      primary: theme.primary_color,
      secondary: theme.secondary_color,
      accent: theme.accent_color,
      background: theme.background_color,
      foreground: theme.foreground_color,
      primary_name: theme.name,
      secondary_name: theme.name,
      accent_name: theme.name,
      font_display: theme.font_display,
      font_body: theme.font_body,
    };
    onStyleChange(theme.name);
    setPreview(converted);
  };

  const generate = async (style: string) => {
    if (!style) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-wedding", {
        body: { type: "generate_theme", style, coupleNames },
      });
      if (error) throw error;
      if (data?.result) {
        setPreview(data.result);
        toast.success("Theme draft ready. Review and apply below.");
      }
    } catch {
      toast.error("Failed to generate theme.");
    }
    setLoading(false);
  };

  const applyTheme = () => {
    if (preview) {
      onThemeGenerated(preview);
      toast.success("Theme applied to wedding page!");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Palette className="h-4 w-4 text-[#ff6245]" />
        <h4 className="text-base font-semibold">Wedding style</h4>
      </div>
      <p className="text-xs text-black/55">Choose a look, review the preview, then apply it to this wedding.</p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {dbThemes.length === 0 && ["Garden", "Romantic", "Modern", "Minimal", "Classic", "Coastal"].map((style) => (
          <button key={style} onClick={() => { onStyleChange(style); setPreview(null); }} aria-pressed={currentStyle === style} className={`min-h-11 rounded-lg border px-3 py-2 text-left text-xs font-medium ${currentStyle === style ? "border-black bg-black text-white" : "border-black/15 bg-white text-black"}`}>{style}</button>
        ))}
        {dbThemes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => selectExistingTheme(theme)}
            className={`min-h-11 rounded-lg border px-3 py-2 text-left font-body text-xs font-medium transition-colors ${
              currentStyle === theme.name
                ? "bg-foreground text-background border-foreground"
                : "border-foreground/20 hover:border-foreground/40"
            }`}
          >
            <span className="flex items-center gap-1.5">
              {theme.name}
            </span>
          </button>
        ))}
      </div>
      {currentStyle && <button onClick={() => void generate(currentStyle)} disabled={loading} className="min-h-11 rounded-full border border-black/15 px-4 text-xs font-semibold disabled:opacity-50">{preview ? "Refine this style" : "Preview this style"}</button>}

      {loading && (
        <div className="flex items-center gap-2 py-4">
          <LoaderCircle className="h-4 w-4 animate-spin text-[#ff6245]" />
          <p className="font-body text-xs text-muted-foreground">Preparing your theme...</p>
        </div>
      )}

      {preview && !loading && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 rounded-lg border border-black/10 bg-[#f7f7f8] p-5">
          <p className="text-sm font-semibold">Theme preview</p>

          <div className="grid grid-cols-3 gap-3">
            {[
              { name: preview.primary_name, hsl: preview.primary },
              { name: preview.secondary_name, hsl: preview.secondary },
              { name: preview.accent_name, hsl: preview.accent },
            ].map((c, i) => (
              <div key={i} className="text-center">
                <div
                  className="w-full aspect-square rounded-full border border-foreground/10 mb-2"
                  style={{ backgroundColor: `hsl(${c.hsl})` }}
                />
                <p className="font-body text-xs">{c.name}</p>
                <p className="font-body text-[10px] text-muted-foreground">{c.hsl}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="font-body text-xs text-muted-foreground mb-1">Display Font</p>
              <p className="font-body text-sm">{preview.font_display}</p>
            </div>
            <div>
              <p className="font-body text-xs text-muted-foreground mb-1">Body Font</p>
              <p className="font-body text-sm">{preview.font_body}</p>
            </div>
          </div>

          {/* Mini preview card */}
          <div
            className="space-y-2 rounded-lg p-6 text-center"
            style={{ backgroundColor: `hsl(${preview.background})`, color: `hsl(${preview.foreground})` }}
          >
            <p className="text-xs tracking-[0.3em] uppercase" style={{ color: `hsl(${preview.accent})` }}>
              YOU ARE INVITED
            </p>
            <h3 className="text-2xl font-light">{coupleNames}</h3>
            <div className="flex justify-center gap-2 pt-2">
              <span className="px-3 py-1 text-xs" style={{ backgroundColor: `hsl(${preview.primary})`, color: `hsl(${preview.background})` }}>
                RSVP
              </span>
              <span className="px-3 py-1 text-xs border" style={{ borderColor: `hsl(${preview.secondary})`, color: `hsl(${preview.secondary})` }}>
                DETAILS
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={applyTheme} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-black px-4 py-3 text-xs font-semibold text-white">
              <Palette className="w-4 h-4" /> Apply style
            </button>
            <button onClick={() => generate(currentStyle || dbThemes[0]?.name || "Classic white")} className="min-h-11 rounded-full border border-black/15 px-4 py-3 text-xs font-semibold">
              Try another
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AIThemeGenerator;

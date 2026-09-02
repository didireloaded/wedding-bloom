import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Palette, Wand2 } from "lucide-react";
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
    const { data } = await supabase.from("themes" as any).select("*").order("generated_by_ai").order("name");
    if (data) setDbThemes(data as any as DBTheme[]);
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
        toast.success("Theme generated! Review and apply below.");
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
        <Palette className="w-4 h-4 text-wedding-gold" />
        <h4 className="wedding-label">WEDDING STYLE & THEME</h4>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {dbThemes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => { selectExistingTheme(theme); generate(theme.name); }}
            className={`px-3 py-2 border font-body text-xs tracking-wider transition-colors min-h-[44px] text-left ${
              currentStyle === theme.name
                ? "bg-foreground text-background border-foreground"
                : "border-foreground/20 hover:border-foreground/40"
            }`}
          >
            <span className="flex items-center gap-1.5">
              {theme.name}
              {theme.generated_by_ai && (
                <Sparkles className="w-3 h-3 text-wedding-gold shrink-0" />
              )}
            </span>
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-4">
          <Sparkles className="w-4 h-4 text-wedding-gold animate-spin" />
          <p className="font-body text-xs text-muted-foreground">Generating your theme...</p>
        </div>
      )}

      {preview && !loading && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 border border-foreground/10 bg-card space-y-4">
          <p className="wedding-label">GENERATED THEME PREVIEW</p>

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
            className="p-6 text-center space-y-2"
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
            <button onClick={applyTheme} className="flex-1 py-3 bg-foreground text-background font-body text-xs tracking-[0.2em] uppercase min-h-[44px] flex items-center justify-center gap-2">
              <Wand2 className="w-4 h-4" /> APPLY THEME
            </button>
            <button onClick={() => generate(currentStyle || dbThemes[0]?.name || "Classic white")} className="px-4 py-3 border border-foreground/20 font-body text-xs tracking-[0.2em] uppercase min-h-[44px]">
              REGENERATE
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AIThemeGenerator;

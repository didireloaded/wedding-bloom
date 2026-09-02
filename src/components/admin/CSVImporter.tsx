import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Papa from "papaparse";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Sparkles, Check, X, AlertTriangle, FileSpreadsheet, ArrowRight, Shield, Palette } from "lucide-react";
import { cleanWeddingRow, generateAccessCode, type ColumnMapping, type CleanedWedding } from "@/lib/cleanWeddingData";

type Stage = "upload" | "analyzing" | "themes" | "preview" | "importing" | "done";

interface ThemeResult {
  theme: string;
  new_theme: boolean;
  colors?: { primary: string; secondary: string; accent: string; background: string; foreground: string };
  font_display?: string;
  font_body?: string;
  reason?: string;
}

interface CSVImporterProps {
  adminUserId: string;
  onComplete: () => void;
}

const SYSTEM_FIELDS: { key: keyof ColumnMapping; label: string }[] = [
  { key: "couple_names", label: "Couple Names" },
  { key: "wedding_date", label: "Wedding Date" },
  { key: "ceremony_time", label: "Ceremony Time" },
  { key: "reception_time", label: "Reception Time" },
  { key: "venue_name", label: "Venue Name" },
  { key: "venue_address", label: "Venue Address" },
  { key: "reception_venue", label: "Reception Venue" },
  { key: "story_meet", label: "How They Met" },
  { key: "proposal_story", label: "Proposal Story" },
  { key: "guest_message", label: "Guest Message" },
  { key: "dress_code", label: "Dress Code" },
  { key: "max_guests", label: "Max Guests" },
  { key: "whatsapp_group_url", label: "WhatsApp URL" },
  { key: "contact_email", label: "Contact Email" },
];

const CSVImporter = ({ adminUserId, onComplete }: CSVImporterProps) => {
  const [stage, setStage] = useState<Stage>("upload");
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [detectedThemes, setDetectedThemes] = useState<Map<number, ThemeResult>>(new Map());
  const [themeProgress, setThemeProgress] = useState(0);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 });

  // Stage 1: Parse CSV
  const handleFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const data = result.data as Record<string, string>[];
        const columns = result.meta.fields || [];
        setRawRows(data);
        setCsvColumns(columns);
        setStage("analyzing");
        analyzeColumns(columns, data);
      },
    });
  };

  // Stage 1b: AI Column Analysis
  const analyzeColumns = async (columns: string[], rows: Record<string, string>[]) => {
    try {
      const { data, error } = await supabase.functions.invoke("analyze-csv-import", {
        body: { columns },
      });
      if (error) throw error;
      if (data?.mapping) {
        setMapping(data.mapping);
        toast.success("AI mapped your columns successfully");
      } else {
        toast.error("AI could not map columns — please map manually");
      }
    } catch (err) {
      console.error("AI analysis failed:", err);
      toast.error("AI analysis failed — please map columns manually");
    }
    setStage("preview");
  };

  // Update mapping manually
  const updateMapping = (field: keyof ColumnMapping, csvCol: string) => {
    setMapping((prev) => {
      if (!csvCol) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return { ...prev, [field]: csvCol };
    });
  };

  // Build preview from current mapping
  const buildPreview = (): CleanedWedding[] => {
    return rawRows
      .map((row) => cleanWeddingRow(row, mapping))
      .filter((w): w is CleanedWedding => w !== null);
  };

  // Stage 1c: AI Theme Detection
  const detectThemes = async () => {
    const weddings = buildPreview();
    if (!weddings.length) {
      toast.error("No valid weddings to detect themes for");
      return;
    }

    setStage("themes");
    setThemeProgress(0);

    // Fetch existing themes from DB
    const { data: existingThemes } = await supabase
      .from("themes" as any)
      .select("id, name, primary_color, secondary_color, accent_color")
      .order("name");

    const themes = new Map<number, ThemeResult>();

    for (let i = 0; i < weddings.length; i++) {
      const w = weddings[i];
      try {
        const { data, error } = await supabase.functions.invoke("analyze-wedding-theme", {
          body: {
            venue: w.ceremony_venue,
            dress_code: w.dress_code,
            story: w.story,
            location: w.ceremony_venue,
            existing_themes: existingThemes || [],
          },
        });

        if (error) throw error;
        if (data?.theme) {
          themes.set(i, data as ThemeResult);
        }
      } catch (err) {
        console.error(`Theme detection failed for ${w.couple_names}:`, err);
        // Default fallback
        themes.set(i, { theme: "Classic white", new_theme: false, reason: "Fallback — AI analysis failed" });
      }

      setThemeProgress(Math.round(((i + 1) / weddings.length) * 100));
    }

    setDetectedThemes(themes);
    setStage("preview");
    toast.success("Theme detection complete!");
  };

  // Stage 2: Import after confirmation
  const importWeddings = async () => {
    const weddings = buildPreview();
    if (!weddings.length) {
      toast.error("No valid weddings to import");
      return;
    }

    setStage("importing");
    setImportProgress(0);
    let success = 0;
    let failed = 0;

    // Fetch all themes for ID lookup
    const { data: allThemes } = await supabase.from("themes" as any).select("id, name");
    const themeMap = new Map((allThemes || []).map((t: any) => [t.name, t.id]));

    for (let i = 0; i < weddings.length; i++) {
      const w = weddings[i];
      const themeResult = detectedThemes.get(i);
      let themeId: string | null = null;
      let themeJsonb: any = null;

      if (themeResult) {
        if (themeResult.new_theme && themeResult.colors) {
          // Create new theme in DB
          const { data: newTheme, error: themeErr } = await supabase.from("themes" as any).insert({
            name: themeResult.theme,
            primary_color: themeResult.colors.primary,
            secondary_color: themeResult.colors.secondary,
            accent_color: themeResult.colors.accent,
            background_color: themeResult.colors.background || "30 30% 96%",
            foreground_color: themeResult.colors.foreground || "0 0% 10%",
            font_display: themeResult.font_display || "Cormorant Garamond",
            font_body: themeResult.font_body || "Josefin Sans",
            generated_by_ai: true,
          } as any).select("id, primary_color, secondary_color, accent_color, background_color, foreground_color, font_display, font_body, name").single();

          if (!themeErr && newTheme) {
            const t = newTheme as any;
            themeId = t.id;
            themeMap.set(themeResult.theme, t.id);
            themeJsonb = {
              primary: t.primary_color, secondary: t.secondary_color, accent: t.accent_color,
              background: t.background_color, foreground: t.foreground_color,
              primary_name: themeResult.theme, secondary_name: themeResult.theme, accent_name: themeResult.theme,
              font_display: t.font_display, font_body: t.font_body,
            };
          }
        } else {
          // Use existing theme
          themeId = themeMap.get(themeResult.theme) || null;
          if (themeId) {
            const { data: existingTheme } = await supabase.from("themes" as any)
              .select("*").eq("id", themeId).single();
            if (existingTheme) {
              const t = existingTheme as any;
              themeJsonb = {
                primary: t.primary_color, secondary: t.secondary_color, accent: t.accent_color,
                background: t.background_color, foreground: t.foreground_color,
                primary_name: t.name, secondary_name: t.name, accent_name: t.name,
                font_display: t.font_display, font_body: t.font_body,
              };
            }
          }
        }
      }

      const { error } = await supabase.from("weddings").insert({
        couple_names: w.couple_names,
        slug: w.slug,
        wedding_date: w.wedding_date,
        ceremony_time: w.ceremony_time,
        reception_time: w.reception_time,
        ceremony_venue: w.ceremony_venue,
        reception_venue: w.reception_venue,
        story: w.story,
        dress_code: w.dress_code,
        max_guests: w.max_guests,
        whatsapp_group_url: w.whatsapp_group_url,
        contact_email: w.contact_email,
        access_code: generateAccessCode(),
        admin_user_id: adminUserId,
        published: true,
        theme_id: themeId,
        theme: themeJsonb,
      } as any);

      if (error) {
        console.error(`Failed: ${w.couple_names}`, error.message);
        failed++;
      } else {
        success++;
      }

      setImportProgress(Math.round(((i + 1) / weddings.length) * 100));
    }

    setImportResults({ success, failed });
    setStage("done");
    if (success > 0) onComplete();
  };

  const reset = () => {
    setStage("upload");
    setRawRows([]);
    setCsvColumns([]);
    setMapping({});
    setDetectedThemes(new Map());
    setThemeProgress(0);
    setImportProgress(0);
    setImportResults({ success: 0, failed: 0 });
  };

  const previewData = stage === "preview" ? buildPreview() : [];
  const themesDetected = detectedThemes.size > 0;

  return (
    <div className="border border-border p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-wedding-gold" />
        <h2 className="font-display text-xl font-light">AI-Assisted Wedding Import</h2>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border border-border text-xs font-body text-muted-foreground">
        <Shield className="w-3.5 h-3.5" />
        <span>AI maps fields, cleans data & detects themes — never invents details. Nothing saved until you confirm.</span>
      </div>

      <AnimatePresence mode="wait">
        {/* UPLOAD */}
        {stage === "upload" && (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <label className="flex flex-col items-center justify-center gap-3 cursor-pointer py-12 border-2 border-dashed border-foreground/15 hover:border-foreground/30 transition-colors">
              <FileSpreadsheet className="w-8 h-8 text-muted-foreground" />
              <span className="font-body text-sm text-muted-foreground">Drop a CSV file or click to upload</span>
              <span className="font-body text-xs tracking-[0.2em] uppercase text-foreground px-4 py-2 border border-foreground/20">
                Choose CSV File
              </span>
              <input type="file" accept=".csv" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
            </label>
          </motion.div>
        )}

        {/* ANALYZING */}
        {stage === "analyzing" && (
          <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3 py-12">
            <Sparkles className="w-6 h-6 text-wedding-gold animate-spin" />
            <p className="font-body text-sm text-muted-foreground">AI is analyzing your CSV columns...</p>
            <p className="font-body text-xs text-muted-foreground">{rawRows.length} rows · {csvColumns.length} columns detected</p>
          </motion.div>
        )}

        {/* THEME DETECTION */}
        {stage === "themes" && (
          <motion.div key="themes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4 py-12">
            <Palette className="w-6 h-6 text-wedding-gold animate-pulse" />
            <p className="font-body text-sm text-muted-foreground">AI is detecting wedding themes...</p>
            <div className="w-full max-w-xs bg-muted h-2">
              <div className="bg-foreground h-2 transition-all duration-300" style={{ width: `${themeProgress}%` }} />
            </div>
            <p className="font-body text-xs text-muted-foreground">{themeProgress}%</p>
          </motion.div>
        )}

        {/* PREVIEW */}
        {stage === "preview" && (
          <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Column Mapping Editor */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-wedding-gold" />
                <p className="wedding-label">COLUMN MAPPING</p>
              </div>
              <p className="font-body text-xs text-muted-foreground">AI suggested these mappings. Adjust if needed.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SYSTEM_FIELDS.map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="font-body text-xs text-muted-foreground w-28 shrink-0">{label}</span>
                    <select
                      value={mapping[key] || ""}
                      onChange={(e) => updateMapping(key, e.target.value)}
                      className="flex-1 bg-transparent border border-foreground/20 py-1.5 px-2 font-body text-xs focus:outline-none focus:border-foreground"
                    >
                      <option value="">— not mapped —</option>
                      {csvColumns.map((col) => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                    {mapping[key] && <Check className="w-3.5 h-3.5 text-wedding-sage shrink-0" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Theme Detection Button */}
            {!themesDetected && previewData.length > 0 && (
              <button
                onClick={detectThemes}
                className="flex items-center gap-2 px-6 py-3 border border-wedding-gold/40 text-wedding-gold font-body text-xs tracking-[0.2em] uppercase hover:bg-wedding-gold/5 transition-colors"
              >
                <Palette className="w-4 h-4" /> DETECT THEMES WITH AI
              </button>
            )}

            {/* Data Preview Table */}
            {previewData.length > 0 && (
              <div className="space-y-3">
                <p className="wedding-label">PREVIEW ({previewData.length} WEDDINGS)</p>
                <div className="overflow-x-auto border border-border">
                  <table className="w-full font-body text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left p-2 font-normal tracking-wider text-muted-foreground">COUPLE</th>
                        <th className="text-left p-2 font-normal tracking-wider text-muted-foreground">DATE</th>
                        <th className="text-left p-2 font-normal tracking-wider text-muted-foreground">VENUE</th>
                        <th className="text-left p-2 font-normal tracking-wider text-muted-foreground">DETECTED THEME</th>
                        <th className="text-left p-2 font-normal tracking-wider text-muted-foreground">SLUG</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((w, i) => {
                        const theme = detectedThemes.get(i);
                        return (
                          <tr key={i} className="border-b border-border/50 hover:bg-muted/20">
                            <td className="p-2 font-medium">{w.couple_names}</td>
                            <td className="p-2">{w.wedding_date || <span className="text-muted-foreground italic">—</span>}</td>
                            <td className="p-2">{w.ceremony_venue || <span className="text-muted-foreground italic">—</span>}</td>
                            <td className="p-2">
                              {theme ? (
                                <span className="inline-flex items-center gap-1.5">
                                  <Palette className="w-3 h-3 text-wedding-gold" />
                                  <span>{theme.theme}</span>
                                  {theme.new_theme && (
                                    <span className="text-[10px] px-1.5 py-0.5 bg-wedding-gold/10 text-wedding-gold tracking-wider">NEW</span>
                                  )}
                                </span>
                              ) : (
                                <span className="text-muted-foreground italic">—</span>
                              )}
                            </td>
                            <td className="p-2 text-muted-foreground">{w.slug}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* AI Theme Decisions Log */}
                {themesDetected && (
                  <div className="space-y-2">
                    <p className="wedding-label">AI THEME DECISIONS</p>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {previewData.map((w, i) => {
                        const theme = detectedThemes.get(i);
                        if (!theme) return null;
                        return (
                          <div key={i} className="flex items-start gap-2 px-3 py-2 bg-muted/30 border border-border/50 text-xs font-body">
                            <Sparkles className="w-3 h-3 text-wedding-gold mt-0.5 shrink-0" />
                            <div>
                              <span className="font-medium">{w.couple_names}</span>
                              <span className="text-muted-foreground"> → {theme.theme}</span>
                              {theme.new_theme && <span className="text-wedding-gold"> (AI Generated)</span>}
                              {theme.reason && <p className="text-muted-foreground mt-0.5">{theme.reason}</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {previewData.length === 0 && (
              <div className="flex items-center gap-2 py-4 text-muted-foreground">
                <AlertTriangle className="w-4 h-4" />
                <p className="font-body text-xs">No valid weddings found. Make sure "Couple Names" is mapped.</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={importWeddings}
                disabled={previewData.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-foreground text-background font-body text-xs tracking-[0.2em] uppercase disabled:opacity-40"
              >
                <Check className="w-4 h-4" /> CONFIRM & IMPORT {previewData.length} WEDDING{previewData.length !== 1 ? "S" : ""}
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-2 px-6 py-3 border border-foreground/20 font-body text-xs tracking-[0.2em] uppercase"
              >
                <X className="w-4 h-4" /> CANCEL
              </button>
            </div>
          </motion.div>
        )}

        {/* IMPORTING */}
        {stage === "importing" && (
          <motion.div key="importing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 py-8">
            <p className="font-body text-sm text-center">Creating weddings with themes...</p>
            <div className="w-full bg-muted h-2">
              <div className="bg-foreground h-2 transition-all duration-300" style={{ width: `${importProgress}%` }} />
            </div>
            <p className="font-body text-xs text-center text-muted-foreground">{importProgress}%</p>
          </motion.div>
        )}

        {/* DONE */}
        {stage === "done" && (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8 space-y-4">
            <Check className="w-10 h-10 text-wedding-sage mx-auto" />
            <p className="font-display text-xl font-light">Import Complete</p>
            <p className="font-body text-sm text-muted-foreground">
              {importResults.success} wedding{importResults.success !== 1 ? "s" : ""} created with themes
              {importResults.failed > 0 && ` · ${importResults.failed} failed`}
            </p>
            <button onClick={reset} className="px-6 py-3 border border-foreground/20 font-body text-xs tracking-[0.2em] uppercase">
              IMPORT MORE
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CSVImporter;

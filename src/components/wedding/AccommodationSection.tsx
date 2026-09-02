import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Hotel, Car, ParkingCircle, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AccommodationItem {
  name: string;
  detail: string;
  link?: string | null;
}

interface Accommodation {
  id: string;
  title: string;
  category: string;
  items: string[];
  sort_order: number;
}

interface AccommodationSectionProps {
  weddingId: string;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "hotels":
      return Hotel;
    case "travel":
      return Car;
    case "parking":
      return ParkingCircle;
    default:
      return Hotel;
  }
};

const parseItems = (items: string[]): AccommodationItem[] => {
  return items.map((item) => {
    try {
      return JSON.parse(item) as AccommodationItem;
    } catch {
      return { name: item, detail: "" };
    }
  });
};

const AccommodationSection = ({ weddingId }: AccommodationSectionProps) => {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccommodations = async () => {
      const { data } = await supabase
        .from("accommodations")
        .select("*")
        .eq("wedding_id", weddingId)
        .order("sort_order");
      if (data) setAccommodations(data);
      setLoading(false);
    };
    fetchAccommodations();
  }, [weddingId]);

  if (loading || accommodations.length === 0) return null;

  return (
    <section className="wedding-section bg-wedding-champagne/30">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="wedding-label mb-4">TRAVEL & STAY</p>
          <h2 className="wedding-heading">Accommodation</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {accommodations.map((acc, i) => {
            const Icon = getCategoryIcon(acc.category);
            const parsedItems = parseItems(acc.items);
            return (
              <motion.div
                key={acc.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.7 }}
                className="bg-background/60 backdrop-blur-sm p-8 border border-border/40"
              >
                <div className="w-12 h-12 rounded-full bg-wedding-champagne/60 flex items-center justify-center mb-6 mx-auto">
                  <Icon className="w-5 h-5 text-wedding-gold" strokeWidth={1.5} />
                </div>
                <h3 className="wedding-label text-center mb-6">{acc.title}</h3>
                <ul className="space-y-4">
                  {parsedItems.map((item, j) => (
                    <li key={j} className="text-center">
                      <p className="font-display text-base font-light">{item.name}</p>
                      <p className="font-body text-[10px] tracking-wider text-muted-foreground mt-0.5">
                        {item.detail}
                      </p>
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-1 font-body text-[9px] tracking-[0.2em] uppercase text-wedding-gold hover:underline"
                        >
                          View <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AccommodationSection;

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

interface WeddingNavProps {
  coupleNames?: string;
}

const WeddingNav = ({ coupleNames = "J&A" }: WeddingNavProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const links = ["Our Story", "Events", "Venue", "Live Feed", "Guestbook", "Gallery"];

  const initials = coupleNames
    .split("&")
    .map((n) => n.trim()[0])
    .join(" & ");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? "bg-background/90 backdrop-blur-md border-b border-border/30 py-3" : "bg-transparent py-5"
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`font-display text-xl tracking-[0.15em] font-light transition-colors duration-500 ${
            scrolled ? "text-foreground" : "text-primary-foreground"
          }`}
        >
          {initials}
        </motion.span>

        <div className="hidden md:flex items-center gap-10">
          {links.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(" ", "-")}`}
              className={`font-body text-[10px] tracking-[0.25em] uppercase transition-colors duration-300 hover:opacity-100 ${
                scrolled ? "text-muted-foreground hover:text-foreground" : "text-primary-foreground/70 hover:text-primary-foreground"
              }`}
            >
              {link}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <a
            href="#rsvp"
            className={`hidden sm:inline-flex items-center font-body text-[10px] tracking-[0.25em] uppercase transition-all duration-300 px-5 py-2 border ${
              scrolled 
                ? "border-foreground/20 text-foreground hover:bg-foreground hover:text-background" 
                : "border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            }`}
          >
            RSVP
          </a>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 transition-colors ${scrolled ? "text-foreground" : "text-primary-foreground"}`}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-background/98 backdrop-blur-xl border-b border-border/30"
        >
          <div className="px-6 py-6 space-y-1">
            {links.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(" ", "-")}`}
                onClick={() => setMobileOpen(false)}
                className="block font-body text-sm tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors py-3 border-b border-border/20"
              >
                {link}
              </a>
            ))}
            <a
              href="#rsvp"
              onClick={() => setMobileOpen(false)}
              className="block w-full text-center py-4 mt-4 bg-foreground text-background font-body text-xs tracking-[0.25em] uppercase"
            >
              RSVP NOW
            </a>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default WeddingNav;

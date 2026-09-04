import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-lg"
      >
        <p className="wedding-label mb-4">FOREVERVOW</p>
        <h1 className="font-display text-5xl md:text-7xl font-light mb-6 tracking-wide">
          ForeverVow
        </h1>
        <p className="font-body text-sm font-light text-muted-foreground mb-10 leading-relaxed">
          Beautiful, personalized wedding invitations for your most important day.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/wedding/john-anna"
            className="inline-block border border-foreground px-8 py-4 font-body text-xs tracking-[0.3em] uppercase hover:bg-foreground hover:text-background transition-colors min-h-[48px]"
          >
            EXPLORE AN INVITATION
          </Link>
          <Link
            to="/couple-login"
            className="inline-block bg-foreground text-background px-8 py-4 font-body text-xs tracking-[0.3em] uppercase hover:bg-foreground/90 transition-colors min-h-[48px]"
          >
            COUPLE LOGIN
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Index;

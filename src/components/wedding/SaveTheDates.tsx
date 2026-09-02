import { motion } from "framer-motion";
import heroImg1 from "@/assets/wedding-hero-1.jpg";
import heroImg2 from "@/assets/wedding-hero-2.jpg";
import heroImg3 from "@/assets/wedding-hero-3.jpg";

const SaveTheDates = () => {
  const milestones = [
    { img: heroImg1, number: "01", date: "15 SEP 2020", title: "The Day We Met" },
    { img: heroImg2, number: "02", date: "14 FEB 2023", title: "The Proposal" },
    { img: heroImg3, number: "03", date: "24 JUN 2026", title: "The Wedding" },
  ];

  return (
    <section className="wedding-section bg-background overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="wedding-label mb-4">OUR JOURNEY</p>
          <h2 className="wedding-heading">Save the Dates</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 md:gap-10">
          {milestones.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.2 }}
              className="text-center group"
            >
              <div className="arch-image aspect-[3/4] mb-8 relative overflow-hidden">
                <img
                  src={m.img}
                  alt={m.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <span className="absolute bottom-6 right-6 font-display text-5xl md:text-6xl font-light text-primary-foreground/60">
                  {m.number}
                </span>
              </div>
              <p className="wedding-label mb-2">{m.date}</p>
              <p className="font-display text-xl md:text-2xl font-light italic tracking-wide">
                {m.title}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SaveTheDates;

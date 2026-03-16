import { motion } from "framer-motion";
import heroImage from "@/assets/hero-crochet.jpg";

const HeroSection = () => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroImage} alt="Peças artesanais de crochê" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30" />
      </div>

      <div className="container mx-auto px-6 relative z-10 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-xl"
        >
          <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-4">Feito à mão com amor</p>
          <h1 className="font-display text-5xl md:text-7xl font-semibold text-foreground leading-tight mb-6">
            Por Dois<br />Fios
          </h1>
          <p className="font-body text-lg text-muted-foreground leading-relaxed mb-10 max-w-md">
            Peças exclusivas em crochê, feitas à mão com materiais naturais. Cada fio carrega uma história de delicadeza e cuidado.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => scrollTo("catalogo")}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-sm font-body text-sm tracking-wider uppercase hover:opacity-90 transition-opacity"
            >
              Ver Catálogo
            </button>
            <button
              onClick={() => scrollTo("encomendas")}
              className="border border-foreground text-foreground px-8 py-3 rounded-sm font-body text-sm tracking-wider uppercase hover:bg-foreground hover:text-background transition-colors"
            >
              Fazer Encomenda
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

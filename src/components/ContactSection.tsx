import { motion } from "framer-motion";
import { Instagram, Mail, MessageCircle } from "lucide-react";

const ContactSection = () => (
  <section id="contato" className="py-24 bg-background">
    <div className="container mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-3">Fale conosco</p>
        <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground">Contato</h2>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-8 max-w-2xl mx-auto">
        <a href="https://wa.me/5527999999999" target="_blank" rel="noopener noreferrer"
          className="flex flex-col items-center gap-3 p-6 bg-card rounded-lg border border-border hover:shadow-md transition-shadow min-w-[160px]">
          <div className="w-12 h-12 rounded-full bg-sage-light flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-primary" />
          </div>
          <span className="font-body text-sm text-foreground">WhatsApp</span>
        </a>
        <a href="https://instagram.com/pordoisfios" target="_blank" rel="noopener noreferrer"
          className="flex flex-col items-center gap-3 p-6 bg-card rounded-lg border border-border hover:shadow-md transition-shadow min-w-[160px]">
          <div className="w-12 h-12 rounded-full bg-dusty-rose-light flex items-center justify-center">
            <Instagram className="w-6 h-6 text-accent" />
          </div>
          <span className="font-body text-sm text-foreground">Instagram</span>
        </a>
        <a href="mailto:contato@pordoisfios.com"
          className="flex flex-col items-center gap-3 p-6 bg-card rounded-lg border border-border hover:shadow-md transition-shadow min-w-[160px]">
          <div className="w-12 h-12 rounded-full bg-terracotta-light flex items-center justify-center">
            <Mail className="w-6 h-6 text-terracotta" />
          </div>
          <span className="font-body text-sm text-foreground">E-mail</span>
        </a>
      </div>
    </div>
  </section>
);

export default ContactSection;

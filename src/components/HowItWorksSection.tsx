import { motion } from "framer-motion";
import { Scissors, Ruler, Truck, CreditCard } from "lucide-react";

const steps = [
  {
    icon: Ruler,
    title: "Escolha e Meça",
    desc: "Selecione a peça desejada e informe suas medidas com a ajuda dos nossos vídeos.",
  },
  {
    icon: CreditCard,
    title: "Pagamento Inicial (50%)",
    desc: "Pague 50% do valor para que possamos adquirir o material necessário para sua peça.",
  },
  {
    icon: Scissors,
    title: "Confecção Artesanal",
    desc: "Sua peça é feita à mão com todo carinho e atenção aos detalhes.",
  },
  {
    icon: Truck,
    title: "Envio + Pagamento Final (50%)",
    desc: "Pague os 50% restantes e sua peça é enviada com frete calculado para seu CEP.",
  },
];

const HowItWorksSection = () => (
  <section id="como-funciona" className="py-24 bg-background">
    <div className="container mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-3">Passo a passo</p>
        <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground">Como Funciona</h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="text-center"
          >
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-sage-light flex items-center justify-center">
              <step.icon className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-display text-lg font-medium text-foreground mb-2">{step.title}</h3>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorksSection;

import { motion } from 'framer-motion';
import { Heart, Sparkles, Leaf, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import aboutCrochet from '@/assets/about-crochet.jpg';

const values = [
  { icon: Heart, title: 'Feito com Amor', desc: 'Cada peça carrega a dedicação e o carinho de quem acredita no poder do artesanal. Não é apenas um produto — é uma extensão do nosso afeto.' },
  { icon: Sparkles, title: 'Exclusividade', desc: 'Nenhuma peça é igual à outra. Trabalhamos com criações únicas e personalizáveis, para que cada cliente tenha algo verdadeiramente especial.' },
  { icon: Leaf, title: 'Sustentabilidade', desc: 'Priorizamos fios de qualidade e práticas conscientes. Acreditamos que moda e sustentabilidade caminham juntas.' },
  { icon: Clock, title: 'Tempo e Paciência', desc: 'O crochê é uma arte que exige tempo. Cada ponto é feito com calma, garantindo qualidade e durabilidade em cada criação.' },
];

const About = () => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl md:text-5xl font-semibold">Sobre a Por Dois Fios</h1>
            <p className="text-muted-foreground mt-3 max-w-lg">
              Uma história tecida com amor, paciência e muita criatividade.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="aspect-[4/5] rounded-2xl overflow-hidden">
                <img src={aboutCrochet} alt="Processo artesanal" className="w-full h-full object-cover" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-5"
            >
              <h2 className="font-display text-3xl font-semibold">Nossa História</h2>
              <p className="text-muted-foreground leading-relaxed">
                A Por Dois Fios nasceu em Vitória, Espírito Santo, de uma paixão que começou como hobby e se 
                transformou em propósito. O que era um passatempo entre agulhas e novelos se tornou uma marca 
                que celebra a arte do feito à mão.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                O nome "Por Dois Fios" vem da essência do crochê — onde dois fios se entrelaçam para criar 
                algo novo, bonito e resistente. Assim como na vida, é na conexão entre as coisas simples que 
                surgem as criações mais bonitas.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Cada peça é pensada com carinho, desde a escolha do fio até o último acabamento. Trabalhamos 
                com materiais de qualidade, priorizando algodão natural e fios sustentáveis, porque acreditamos 
                que beleza e consciência podem andar juntas.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-semibold">Processo Artesanal</h2>
            <p className="text-muted-foreground mt-3 max-w-md mx-auto">
              Do fio à peça final, cada etapa é feita com cuidado e dedicação
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {['Escolha do Fio', 'Criação do Design', 'Confecção Manual', 'Acabamento Final'].map((step, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 font-display text-lg font-semibold">
                  {i + 1}
                </div>
                <h3 className="font-display text-lg font-medium">{step}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl font-semibold text-center mb-12"
          >
            Nossos Valores
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl border border-border bg-card"
              >
                <div className="inline-flex p-3 rounded-full bg-secondary mb-4">
                  <v.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-xl font-medium mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-semibold">Quer uma peça exclusiva?</h2>
          <p className="text-muted-foreground mt-3">Encomende agora e tenha algo feito especialmente para você.</p>
          <Link
            to="/encomendas"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Fazer Encomenda
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;

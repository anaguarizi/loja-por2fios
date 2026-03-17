import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { products } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import { ArrowRight, Heart, Sparkles, Leaf } from 'lucide-react';
import heroCrochet from '@/assets/hero-crochet.jpg';
import aboutCrochet from '@/assets/about-crochet.jpg';

const testimonials = [
  { name: 'Marina S.', text: 'Recebi minha bandana e fiquei encantada! A qualidade é incrível e o acabamento é perfeito. Com certeza vou pedir mais!', city: 'São Paulo, SP' },
  { name: 'Camila R.', text: 'O bucket hat ficou lindo demais! Todos perguntam onde comprei. O cuidado nos detalhes faz toda diferença.', city: 'Belo Horizonte, MG' },
  { name: 'Juliana M.', text: 'Encomendei um top personalizado e superou todas as expectativas. Atendimento carinhoso e produto maravilhoso!', city: 'Curitiba, PR' },
];

const Index = () => {
  const featured = products.filter(p => p.featured);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroCrochet} alt="Crochê artesanal" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
        </div>
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-6">
              Artesanal · Responsável
            </span>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold text-foreground leading-tight">
              Feito à mão, com carinho em cada laçada
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-lg">
              Peças criadas com delicadeza e atenção em cada detalhe. 
              <br />
              De Vitória para o Brasil inteiro, com amor.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/produtos"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Ver Coleção <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/encomendas"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-background text-foreground font-semibold text-sm border border-border hover:bg-card transition-colors"
              >
                Fazer Encomenda
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Heart, title: 'Feito com Amor', desc: 'Cada ponto é dado com carinho e dedicação' },
              { icon: Sparkles, title: 'Peças Exclusivas', desc: 'Designs únicos que você não encontra em outro lugar' },
              { icon: Leaf, title: 'Materiais de Qualidade', desc: 'Fios selecionados, priorizando aparência e durabilidade' },
            ].map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center p-6"
              >
                <div className="inline-flex p-3 rounded-full bg-secondary mb-4">
                  <feat.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-xl font-medium mb-2">{feat.title}</h3>
                <p className="text-sm text-muted-foreground">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-semibold">Destaques da Coleção</h2>
            <p className="text-muted-foreground mt-3 max-w-md mx-auto">
              Peças selecionadas com todo cuidado para você se encantar
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/produtos"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              Ver todos os produtos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="aspect-square rounded-2xl overflow-hidden">
                <img src={aboutCrochet} alt="Processo artesanal" className="w-full h-full object-cover" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-xs font-semibold tracking-wider uppercase text-primary">Sobre a marca</span>
              <h2 className="font-display text-3xl md:text-4xl font-semibold mt-3">
                Dois fios, infinitas possibilidades
              </h2>
              <p className="text-muted-foreground mt-4 leading-relaxed">
                A Por Dois Fios nasceu do amor pelo crochê e pela vontade de criar peças que contam histórias. 
                De Vitória, no Espírito Santo, cada criação sai das nossas mãos com dedicação, usando fios 
                selecionados e técnicas tradicionais misturadas com design contemporâneo.
              </p>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                Acreditamos que o feito à mão carrega uma energia especial — a de quem dedica tempo, paciência 
                e carinho em cada ponto. Nossas peças são para quem valoriza o único, o autêntico e o sustentável.
              </p>
              <Link
                to="/sobre"
                className="inline-flex items-center gap-2 mt-6 text-sm font-medium text-primary hover:underline"
              >
                Conheça nossa história <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-semibold">O que dizem nossas clientes</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="p-6 rounded-xl bg-card border border-border"
              >
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="text-accent">★</span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">"{t.text}"</p>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="font-medium text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.city}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-semibold">
              Cada peça tem a sua história
            </h2>
            <p className="mt-4 max-w-md mx-auto opacity-80">
              Encomende uma peça exclusiva e personalizada, feita especialmente para você.
            </p>
            <Link
              to="/encomendas"
              className="inline-flex items-center gap-2 mt-8 px-8 py-3 rounded-lg bg-background text-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Fazer Encomenda <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;

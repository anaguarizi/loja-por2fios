import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { products, categories } from '@/data/products';
import type { ProductCategory } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import Header from './Header';

const Products = () => {
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return products;
    return products.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl md:text-5xl font-semibold">Nossos Produtos</h1>
            <p className="text-muted-foreground mt-3 max-w-lg">
              Cada peça é única, feita à mão com fios selecionados e muito amor.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters + Products */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 mb-10">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-muted'
              }`}
            >
              Todos
            </button>
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-muted'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </motion.div>

          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">Nenhum produto encontrado nesta categoria.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Products;

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Product } from '@/data/products';
import { formatPrice } from '@/data/products';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link to={`/produtos/${product.slug}`} className="group block">
        <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary mb-3">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {product.customizable && (
            <span className="absolute top-3 left-3 px-2 py-1 text-xs font-semibold rounded-full bg-accent text-accent-foreground">
              Personalizável
            </span>
          )}
        </div>
        <h3 className="font-display text-lg font-medium text-foreground group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{product.shortDescription}</p>
        <p className="font-semibold text-foreground mt-2">{formatPrice(product.price)}</p>
      </Link>
    </motion.div>
  );
};

export default ProductCard;

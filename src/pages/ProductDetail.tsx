import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { products, formatPrice } from '@/data/products';
import type { ProductSize } from '@/data/products';
import { useCart } from '../contexts/CartContext';
import { ArrowLeft, ShoppingBag, Check } from 'lucide-react';

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const product = products.find(p => p.slug === slug);
  const { addItem } = useCart();

  const [selectedSize, setSelectedSize] = useState<ProductSize | ''>('');
  const [selectedColor, setSelectedColor] = useState('');
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Produto não encontrado</p>
        <Link to="/produtos" className="text-primary hover:underline text-sm">Voltar aos produtos</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) return;
    addItem(product, selectedSize, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const sizeLabel = (s: ProductSize) => s === 'unico' ? 'Único' : s;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Link to="/produtos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Voltar aos produtos
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="aspect-square rounded-2xl overflow-hidden bg-secondary"
          >
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <span className="text-xs font-semibold tracking-wider uppercase text-primary mb-2">
              {product.category === 'bandanas' ? 'Bandanas' :
               product.category === 'acessorios' ? 'Acessórios' :
               product.category === 'roupas' ? 'Roupas' :
               product.category === 'decoracao' ? 'Decoração' : 'Personalizados'}
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-semibold">{product.name}</h1>
            <p className="font-display text-2xl font-semibold text-primary mt-3">{formatPrice(product.price)}</p>

            <p className="text-muted-foreground mt-6 leading-relaxed">{product.description}</p>

            <div className="mt-6 p-4 rounded-lg bg-card border border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-1">Fio utilizado</p>
              <p className="text-sm font-medium">{product.yarnType.name}</p>
            </div>

            {/* Size selection */}
            <div className="mt-6">
              <p className="text-sm font-semibold mb-3">Tamanho</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      selectedSize === size
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background hover:bg-card'
                    }`}
                  >
                    {sizeLabel(size)}
                  </button>
                ))}
              </div>
            </div>

            {/* Color selection */}
            <div className="mt-6">
              <p className="text-sm font-semibold mb-3">Cor ({product.yarnType.name})</p>
              <div className="flex flex-wrap gap-2">
                {product.yarnType.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      selectedColor === color
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background hover:bg-card'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize || !selectedColor}
              className={`mt-8 w-full py-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                !selectedSize || !selectedColor
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : added
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-primary text-primary-foreground hover:opacity-90'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" /> Adicionado!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" /> Adicionar ao Carrinho
                </>
              )}
            </button>

            {(!selectedSize || !selectedColor) && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Selecione o tamanho e a cor para adicionar ao carrinho
              </p>
            )}

            {product.customizable && (
              <Link
                to="/encomendas"
                className="mt-4 text-center text-sm text-primary hover:underline"
              >
                Quer personalizar? Faça uma encomenda →
              </Link>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

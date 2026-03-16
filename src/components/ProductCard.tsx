import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const ProductCard = ({ product }: { product: Product }) => {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.standardSizes?.[0] || "");

  const handleAdd = () => {
    addItem({
      product,
      quantity: 1,
      size: selectedSize || undefined,
      isCustomOrder: false,
    });
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  const categoryLabels: Record<string, string> = {
    roupa: "Roupa",
    acessorio: "Acessório",
    decoracao: "Decoração",
  };

  return (
    <div className="group bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-shadow duration-300">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute top-4 left-4 bg-background/90 text-foreground text-xs font-body tracking-wider uppercase px-3 py-1 rounded-sm">
          {categoryLabels[product.category]}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-display text-xl font-medium text-foreground mb-1">{product.name}</h3>
        <p className="font-body text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>

        {product.standardSizes && product.available && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {product.standardSizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`text-xs font-body px-3 py-1 rounded-sm border transition-colors ${
                  selectedSize === size
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-foreground"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <span className="font-display text-2xl font-semibold text-foreground">
            R$ {product.price.toFixed(2).replace(".", ",")}
          </span>
          {product.available && (
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-sm font-body text-sm hover:opacity-90 transition-opacity"
            >
              <ShoppingBag className="w-4 h-4" />
              Comprar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

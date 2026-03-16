import { useState } from "react";
import { motion } from "framer-motion";
import { products, type Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Play, X } from "lucide-react";

const CustomOrderSection = () => {
  const customProducts = products.filter((p) => p.customOrder);
  const [selected, setSelected] = useState<Product | null>(null);
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [selectedSize, setSelectedSize] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const { addItem } = useCart();

  const handleSelect = (product: Product) => {
    setSelected(product);
    setMeasurements({});
    setSelectedSize(product.standardSizes?.[0] || "");
  };

  const handleSubmit = () => {
    if (!selected) return;

    if (selected.measurements) {
      const allFilled = selected.measurements.every((m) => measurements[m.id]?.trim());
      if (!allFilled) {
        toast.error("Por favor, preencha todas as medidas.");
        return;
      }
    }

    addItem({
      product: selected,
      quantity: 1,
      size: selectedSize || undefined,
      measurements: selected.measurements ? measurements : undefined,
      isCustomOrder: true,
    });

    toast.success(`Encomenda de ${selected.name} adicionada ao carrinho!`);
    setSelected(null);
    setMeasurements({});
  };

  return (
    <section id="encomendas" className="py-24 bg-secondary">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-3">Sob medida para você</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground">Encomendas</h2>
          <p className="font-body text-muted-foreground mt-4 max-w-lg mx-auto">
            Escolha a peça e informe suas medidas. Confeccionamos especialmente para você.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {customProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => handleSelect(product)}
              className={`rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                selected?.id === product.id
                  ? "border-primary shadow-lg scale-105"
                  : "border-transparent hover:border-border"
              }`}
            >
              <img src={product.image} alt={product.name} className="w-full aspect-square object-cover" />
              <p className="font-body text-xs text-center py-2 text-foreground">{product.name}</p>
            </button>
          ))}
        </div>

        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto bg-background rounded-lg p-8 border border-border"
          >
            <div className="flex items-start gap-6 mb-8">
              <img src={selected.image} alt={selected.name} className="w-28 h-28 object-cover rounded-lg" />
              <div>
                <h3 className="font-display text-2xl font-medium text-foreground">{selected.name}</h3>
                <p className="font-body text-sm text-muted-foreground mt-1">{selected.description}</p>
                <p className="font-display text-xl font-semibold text-foreground mt-2">
                  R$ {selected.price.toFixed(2).replace(".", ",")}
                </p>
              </div>
            </div>

            {selected.measurements && (
              <div className="space-y-5 mb-8">
                <h4 className="font-display text-lg font-medium text-foreground">Suas Medidas (em cm)</h4>
                {selected.measurements.map((m) => (
                  <div key={m.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-body text-sm font-medium text-foreground">{m.label}</label>
                      {m.videoUrl && (
                        <button
                          onClick={() => setVideoUrl(m.videoUrl!)}
                          className="flex items-center gap-1 text-primary text-xs font-body hover:underline"
                        >
                          <Play className="w-3 h-3" /> Como medir
                        </button>
                      )}
                    </div>
                    <p className="font-body text-xs text-muted-foreground">{m.description}</p>
                    <input
                      type="number"
                      placeholder="Ex: 88"
                      value={measurements[m.id] || ""}
                      onChange={(e) => setMeasurements((prev) => ({ ...prev, [m.id]: e.target.value }))}
                      className="w-full border border-input rounded-sm px-4 py-2 font-body text-sm bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            )}

            {selected.standardSizes && !selected.measurements && (
              <div className="mb-8">
                <h4 className="font-display text-lg font-medium text-foreground mb-3">Tamanho</h4>
                <div className="flex gap-3 flex-wrap">
                  {selected.standardSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`font-body text-sm px-5 py-2 rounded-sm border transition-colors ${
                        selectedSize === size
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-foreground"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-dusty-rose-light rounded-lg p-4 mb-6">
              <p className="font-body text-sm text-secondary-foreground">
                <strong>Pagamento em duas etapas:</strong> 50% antecipado (para aquisição do material) + 50% no momento do envio.
              </p>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-primary text-primary-foreground py-3 rounded-sm font-body text-sm tracking-wider uppercase hover:opacity-90 transition-opacity"
            >
              Adicionar Encomenda ao Carrinho
            </button>
          </motion.div>
        )}

        {videoUrl && (
          <div className="fixed inset-0 bg-foreground/60 z-50 flex items-center justify-center p-6" onClick={() => setVideoUrl(null)}>
            <div className="bg-background rounded-lg p-4 max-w-2xl w-full relative" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setVideoUrl(null)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
              <h4 className="font-display text-lg font-medium text-foreground mb-4">Como tirar a medida</h4>
              <div className="aspect-video w-full">
                <iframe
                  src={videoUrl}
                  title="Como tirar medidas"
                  className="w-full h-full rounded"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CustomOrderSection;

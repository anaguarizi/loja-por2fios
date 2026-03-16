import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Truck, Package } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ShippingOption = {
  name: string;
  price: number;
  days: string;
};

const CartSection = () => {
  const { items, removeItem, total } = useCart();
  const [cep, setCep] = useState("");
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[] | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [loadingCep, setLoadingCep] = useState(false);

  const hasCustomOrders = items.some((i) => i.isCustomOrder);
  const firstPayment = hasCustomOrders ? total * 0.5 : total;

  const calculateShipping = async () => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      toast.error("Por favor, insira um CEP válido com 8 dígitos.");
      return;
    }

    setLoadingCep(true);
    try {
      const { data, error } = await supabase.functions.invoke("calcular-frete", {
        body: { cepDestino: cleanCep },
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
        setLoadingCep(false);
        return;
      }

      const options: ShippingOption[] = data.options
        .filter((o: any) => !o.error && o.price > 0)
        .map((o: any) => ({
          name: o.name,
          price: o.price,
          days: o.days,
        }));

      if (options.length === 0) {
        toast.error("Nenhuma opção de frete disponível para este CEP.");
      } else {
        setShippingOptions(options);
        setSelectedShipping(options[0]);
      }
    } catch (err) {
      console.error("Erro ao calcular frete:", err);
      toast.error("Erro ao calcular o frete. Tente novamente.");
    } finally {
      setLoadingCep(false);
    }
  };

  const grandTotal = total + (selectedShipping?.price || 0);

  return (
    <section id="carrinho" className="py-24 bg-secondary">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="font-body text-sm tracking-[0.3em] uppercase text-primary mb-3">Seu pedido</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground">Carrinho</h2>
        </motion.div>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="font-body text-muted-foreground">Seu carrinho está vazio.</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4 mb-8">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-background rounded-lg p-4 border border-border">
                  <img src={item.product.image} alt={item.product.name} className="w-20 h-20 object-cover rounded" />
                  <div className="flex-1">
                    <h4 className="font-display text-lg font-medium text-foreground">{item.product.name}</h4>
                    <div className="font-body text-xs text-muted-foreground space-x-2">
                      {item.isCustomOrder && <span className="bg-terracotta-light text-terracotta px-2 py-0.5 rounded">Encomenda</span>}
                      {item.size && <span>Tamanho: {item.size}</span>}
                    </div>
                    {item.measurements && (
                      <p className="font-body text-xs text-muted-foreground mt-1">
                        Medidas: {Object.entries(item.measurements).map(([k, v]) => `${k}: ${v}cm`).join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg font-semibold text-foreground">
                      R$ {item.product.price.toFixed(2).replace(".", ",")}
                    </p>
                    <button onClick={() => removeItem(item.product.id)} className="text-muted-foreground hover:text-destructive mt-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Shipping */}
            <div className="bg-background rounded-lg p-6 border border-border mb-6">
              <h4 className="font-display text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" /> Calcular Frete
              </h4>
              <p className="font-body text-xs text-muted-foreground mb-3">Envio a partir de Vitória - ES</p>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Digite seu CEP"
                  maxLength={9}
                  value={cep}
                  onChange={(e) => setCep(e.target.value.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2"))}
                  className="flex-1 border border-input rounded-sm px-4 py-2 font-body text-sm bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                />
                <button
                  onClick={calculateShipping}
                  disabled={loadingCep}
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-sm font-body text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loadingCep ? "Calculando..." : "Calcular"}
                </button>
              </div>

              {shippingOptions && (
                <div className="mt-4 space-y-2">
                  {shippingOptions.map((opt) => (
                    <button
                      key={opt.name}
                      onClick={() => setSelectedShipping(opt)}
                      className={`w-full flex items-center justify-between p-3 rounded-sm border transition-colors text-left ${
                        selectedShipping?.name === opt.name
                          ? "border-primary bg-sage-light"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      <div>
                        <p className="font-body text-sm font-medium text-foreground">{opt.name}</p>
                        <p className="font-body text-xs text-muted-foreground">{opt.days}</p>
                      </div>
                      <p className="font-display text-sm font-semibold text-foreground">
                        R$ {opt.price.toFixed(2).replace(".", ",")}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="bg-background rounded-lg p-6 border border-border">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between font-body text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>R$ {total.toFixed(2).replace(".", ",")}</span>
                </div>
                {selectedShipping && (
                  <div className="flex justify-between font-body text-sm text-muted-foreground">
                    <span>Frete ({selectedShipping.name})</span>
                    <span>R$ {selectedShipping.price.toFixed(2).replace(".", ",")}</span>
                  </div>
                )}
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="font-display text-lg font-semibold text-foreground">Total</span>
                  <span className="font-display text-lg font-semibold text-foreground">
                    R$ {grandTotal.toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>

              {hasCustomOrders && (
                <div className="bg-dusty-rose-light rounded-lg p-4 mb-4">
                  <p className="font-body text-sm text-secondary-foreground">
                    <strong>Pagamento em duas etapas:</strong>
                  </p>
                  <p className="font-body text-sm text-muted-foreground mt-1">
                    • 1ª parcela (agora): <strong>R$ {(firstPayment + (selectedShipping?.price || 0) * 0.5).toFixed(2).replace(".", ",")}</strong> — para aquisição do material
                  </p>
                  <p className="font-body text-sm text-muted-foreground">
                    • 2ª parcela (no envio): <strong>R$ {(total * 0.5 + (selectedShipping?.price || 0) * 0.5).toFixed(2).replace(".", ",")}</strong>
                  </p>
                </div>
              )}

              <button
                onClick={() => toast.success("Pedido realizado com sucesso! Entraremos em contato em breve.")}
                className="w-full bg-primary text-primary-foreground py-3 rounded-sm font-body text-sm tracking-wider uppercase hover:opacity-90 transition-opacity"
              >
                Finalizar Pedido
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CartSection;

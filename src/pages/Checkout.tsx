import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/data/products";

type ShippingOption = { name: string; price: number; days: string };

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();

  const [cep, setCep] = useState("");
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingResult, setShippingResult] = useState<{
    options: ShippingOption[];
    destination: { city: string; state: string };
  } | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<string>("");
  const selected = useMemo(
    () => shippingResult?.options.find((o) => o.name === selectedShipping) ?? null,
    [selectedShipping, shippingResult]
  );

  const [placing, setPlacing] = useState(false);

  const calcShipping = async () => {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) {
      toast.error("CEP inválido. Insira 8 dígitos.");
      return;
    }
    setShippingLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("calcular-frete", {
        body: { cepDestino: clean },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      setShippingResult(data);
      setSelectedShipping(data?.options?.[0]?.name ?? "");
    } catch {
      toast.error("Erro ao calcular frete.");
    } finally {
      setShippingLoading(false);
    }
  };

  const placeOrder = async () => {
    if (items.length === 0) {
      toast.error("Seu carrinho está vazio.");
      return;
    }
    if (!shippingResult || !selected) {
      toast.error("Calcule e selecione o frete.");
      return;
    }
    setPlacing(true);
    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr || !user) {
        toast.error("Você precisa estar logada para finalizar.");
        navigate("/login", { replace: true });
        return;
      }

      const itemsTotal = totalPrice;
      const shippingCost = selected.price;
      const orderTotal = itemsTotal + shippingCost;

      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          status: "new",
          total: orderTotal,
          shipping_cep: cep.replace(/\D/g, ""),
          shipping_city: shippingResult.destination.city,
          shipping_state: shippingResult.destination.state,
          shipping_method: selected.name,
          shipping_cost: shippingCost,
          has_custom_orders: false,
        })
        .select("id")
        .single();
      if (orderErr) throw orderErr;

      await supabase.rpc("assign_artisan_to_order", { _order_id: order.id }).catch(() => null);

      const { error: itemsErr } = await supabase.from("order_items").insert(
        items.map((i) => ({
          order_id: order.id,
          product_id: i.product.id,
          product_name: i.product.name,
          product_price: i.product.price,
          quantity: i.quantity,
          size: i.size,
          measurements: null,
          is_custom_order: false,
        }))
      );
      if (itemsErr) throw itemsErr;

      toast.success("Pedido criado! Vamos preparar com carinho.");
      clearCart();
      navigate("/minha-conta", { replace: true });
    } catch {
      toast.error("Não foi possível criar seu pedido.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen">
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-4xl md:text-5xl font-semibold">Checkout</h1>
          <p className="text-muted-foreground mt-3 max-w-lg">
            Informe o CEP, escolha o frete e finalize seu pedido.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
              <h2 className="font-display text-xl font-semibold">Entrega</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="CEP"
                  maxLength={9}
                  value={cep}
                  onChange={(e) =>
                    setCep(
                      e.target.value
                        .replace(/\D/g, "")
                        .replace(/(\d{5})(\d)/, "$1-$2")
                    )
                  }
                  className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  onClick={calcShipping}
                  disabled={shippingLoading}
                  className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {shippingLoading ? "Calculando..." : "Calcular frete"}
                </button>
              </div>

              {shippingResult && (
                <div className="pt-2 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Destino: {shippingResult.destination.city}/{shippingResult.destination.state}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {shippingResult.options.map((opt) => (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => setSelectedShipping(opt.name)}
                        className={`p-4 rounded-lg border text-left transition-all ${
                          selectedShipping === opt.name
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border bg-background hover:bg-card"
                        }`}
                      >
                        <p className="text-sm font-semibold">{opt.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatPrice(opt.price)} · {opt.days}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 rounded-xl bg-card border border-border">
              <h2 className="font-display text-xl font-semibold">Itens</h2>
              <div className="mt-4 space-y-3">
                {items.map((i) => (
                  <div
                    key={`${i.product.id}-${i.size}-${i.color}`}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{i.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {i.size !== "unico" ? `Tam: ${i.size}` : "Tamanho único"} · {i.color} · Qtde:{" "}
                        {i.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">{formatPrice(i.product.price * i.quantity)}</p>
                  </div>
                ))}
                {items.length === 0 && (
                  <p className="text-sm text-muted-foreground">Seu carrinho está vazio.</p>
                )}
              </div>
            </div>
          </div>

          <aside className="p-6 rounded-xl bg-card border border-border h-fit space-y-4">
            <h2 className="font-display text-xl font-semibold">Resumo</h2>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Itens</span>
              <span className="font-medium">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Frete</span>
              <span className="font-medium">{selected ? formatPrice(selected.price) : "—"}</span>
            </div>
            <div className="border-t border-border pt-4 flex justify-between">
              <span className="font-medium">Total</span>
              <span className="font-display text-xl font-semibold">
                {formatPrice(totalPrice + (selected?.price ?? 0))}
              </span>
            </div>
            <button
              onClick={placeOrder}
              disabled={placing}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {placing ? "Finalizando..." : "Confirmar pedido"}
            </button>
          </aside>
        </div>
      </section>
    </div>
  );
}


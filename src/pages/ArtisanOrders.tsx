import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/data/products";
import { useAuth } from "@/hooks/useAuth";

type OrderRow = {
  id: string;
  created_at: string;
  status: string;
  total: number;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_method: string | null;
  shipping_cost: number | null;
  has_custom_orders: boolean | null;
  notes: string | null;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  size: string | null;
  is_custom_order: boolean | null;
  measurements: unknown | null;
};

const statusLabels: Record<string, string> = {
  new: "Novo",
  in_progress: "Em produção",
  ready: "Pronto",
  shipped: "Enviado",
  done: "Concluído",
  cancelled: "Cancelado",
};

export default function ArtisanOrders() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [itemsByOrder, setItemsByOrder] = useState<Record<string, OrderItemRow[]>>({});

  const orderIds = useMemo(() => orders.map((o) => o.id), [orders]);

  useEffect(() => {
    const run = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("orders")
          .select(
            "id, created_at, status, total, shipping_city, shipping_state, shipping_method, shipping_cost, has_custom_orders, notes"
          )
          .eq("artisan_id", user.id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        setOrders((data ?? []) as unknown as OrderRow[]);
      } catch {
        toast.error("Não foi possível carregar as encomendas.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user]);

  useEffect(() => {
    const run = async () => {
      if (orderIds.length === 0) {
        setItemsByOrder({});
        return;
      }
      try {
        const { data, error } = await supabase
          .from("order_items")
          .select("id, order_id, product_name, product_price, quantity, size, is_custom_order, measurements")
          .in("order_id", orderIds);
        if (error) throw error;
        const grouped: Record<string, OrderItemRow[]> = {};
        ((data ?? []) as unknown as OrderItemRow[]).forEach((it) => {
          grouped[it.order_id] = grouped[it.order_id] ?? [];
          grouped[it.order_id].push(it);
        });
        setItemsByOrder(grouped);
      } catch {
        toast.error("Não foi possível carregar os itens.");
      }
    };
    run();
  }, [orderIds]);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
      if (error) throw error;
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      toast.success("Status atualizado.");
    } catch {
      toast.error("Não foi possível atualizar o status.");
    }
  };

  return (
    <div className="min-h-screen">
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-4xl md:text-5xl font-semibold">Área da artesã</h1>
          <p className="text-muted-foreground mt-3 max-w-lg">
            Encomendas atribuídas a você (auto-distribuídas pelo sistema).
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma encomenda atribuída no momento.</p>
          ) : (
            orders.map((o) => (
              <div key={o.id} className="p-6 rounded-xl bg-card border border-border">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">#{o.id.slice(0, 8)} · {new Date(o.created_at).toLocaleString()}</p>
                    <p className="font-display text-xl font-semibold mt-1">{formatPrice(o.total)}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {o.shipping_city && o.shipping_state ? `${o.shipping_city}/${o.shipping_state}` : "—"} ·{" "}
                      {o.shipping_method ?? "—"} ({o.shipping_cost != null ? formatPrice(o.shipping_cost) : "—"})
                    </p>
                    {o.notes && (
                      <p className="text-sm mt-2">
                        <span className="text-muted-foreground">Obs:</span> {o.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {statusLabels[o.status] ?? o.status}
                    </span>
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
                    >
                      {Object.keys(statusLabels).map((s) => (
                        <option key={s} value={s}>
                          {statusLabels[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 border-t border-border pt-4 space-y-2">
                  {(itemsByOrder[o.id] ?? []).map((it) => (
                    <div key={it.id} className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{it.product_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {it.size ? `Tam: ${it.size}` : "Tamanho —"} · Qtde: {it.quantity}{" "}
                          {it.is_custom_order ? "· Personalizado" : ""}
                        </p>
                        {it.measurements && (
                          <pre className="mt-2 text-xs bg-secondary/60 rounded-lg p-3 overflow-auto">
                            {JSON.stringify(it.measurements, null, 2)}
                          </pre>
                        )}
                      </div>
                      <p className="text-sm font-semibold">
                        {formatPrice(it.product_price * it.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}


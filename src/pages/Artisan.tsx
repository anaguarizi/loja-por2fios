import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft, Package, Clock, Truck, CheckCircle, XCircle,
  ChevronDown, ChevronUp, LogOut, HandHeart, Scissors
} from "lucide-react";

type OrderRow = {
  id: string;
  user_id: string;
  artisan_id: string | null;
  status: string;
  total: number;
  shipping_cost: number | null;
  shipping_method: string | null;
  shipping_cep: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  has_custom_orders: boolean | null;
  notes: string | null;
  created_at: string;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  size: string | null;
  measurements: any;
  is_custom_order: boolean | null;
};

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  confirmed: { label: "Confirmado", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  in_production: { label: "Em Produção", color: "bg-purple-100 text-purple-800", icon: Package },
  ready: { label: "Pronto", color: "bg-green-100 text-green-800", icon: CheckCircle },
  shipped: { label: "Enviado", color: "bg-indigo-100 text-indigo-800", icon: Truck },
  delivered: { label: "Entregue", color: "bg-emerald-100 text-emerald-800", icon: CheckCircle },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800", icon: XCircle },
};

const ARTISAN_STATUSES = ["in_production", "ready"];

const Artisan = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [isArtisan, setIsArtisan] = useState(false);
  const [tab, setTab] = useState<"available" | "mine">("available");
  const [availableOrders, setAvailableOrders] = useState<OrderRow[]>([]);
  const [myOrders, setMyOrders] = useState<OrderRow[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItemRow[]>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      checkArtisanRole();
    } else if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading]);

  const checkArtisanRole = async () => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user!.id)
      .eq("role", "artisan")
      .maybeSingle();

    if (!data) {
      toast.error("Você não tem permissão de artesã.");
      navigate("/");
      return;
    }
    setIsArtisan(true);
    fetchOrders();
  };

  const fetchOrders = async () => {
    setLoading(true);

    // Fetch available (unassigned, confirmed) orders
    const { data: available } = await supabase
      .from("orders")
      .select("*")
      .is("artisan_id", null)
      .in("status", ["confirmed", "pending"])
      .order("created_at", { ascending: false });

    // Fetch my assigned orders
    const { data: mine } = await supabase
      .from("orders")
      .select("*")
      .eq("artisan_id", user!.id)
      .order("created_at", { ascending: false });

    setAvailableOrders(available || []);
    setMyOrders(mine || []);
    setLoading(false);
  };

  const claimOrder = async (orderId: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ artisan_id: user!.id, status: "in_production" } as any)
      .eq("id", orderId)
      .is("artisan_id", null);

    if (error) {
      toast.error("Erro ao aceitar encomenda. Talvez já tenha sido escolhida.");
    } else {
      toast.success("Encomenda aceita! Boa produção 🧶");
      fetchOrders();
    }
  };

  const updateMyOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus } as any)
      .eq("id", orderId)
      .eq("artisan_id", user!.id);

    if (error) {
      toast.error("Erro ao atualizar status");
    } else {
      toast.success(`Status atualizado para: ${STATUS_MAP[newStatus]?.label}`);
      setMyOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    }
  };

  const fetchItems = async (orderId: string) => {
    if (orderItems[orderId]) return;
    const { data } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);
    setOrderItems((prev) => ({ ...prev, [orderId]: data || [] }));
  };

  const toggleExpand = (orderId: string) => {
    if (expanded === orderId) {
      setExpanded(null);
    } else {
      setExpanded(orderId);
      fetchItems(orderId);
    }
  };

  const renderOrder = (order: OrderRow, isMine: boolean) => {
    const status = STATUS_MAP[order.status] || STATUS_MAP.pending;
    const StatusIcon = status.icon;
    const isExpanded = expanded === order.id;

    return (
      <div key={order.id} className="bg-card rounded-lg border border-border overflow-hidden">
        <button
          onClick={() => toggleExpand(order.id)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-4 flex-1">
            <StatusIcon className="w-5 h-5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="font-display text-sm font-medium text-foreground truncate">
                Pedido #{order.id.slice(0, 8)}
              </p>
              <p className="font-body text-xs text-muted-foreground">
                {new Date(order.created_at).toLocaleDateString("pt-BR")}
                {order.shipping_city && ` • ${order.shipping_city}/${order.shipping_state}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-body font-medium ${status.color}`}>
              {status.label}
            </span>
            {order.has_custom_orders && (
              <span className="px-2 py-1 rounded-full text-xs font-body font-medium bg-accent/20 text-accent-foreground">
                Sob medida
              </span>
            )}
            {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </button>

        {isExpanded && (
          <div className="px-6 pb-6 border-t border-border pt-4 space-y-5">
            {/* Items */}
            <div>
              <p className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-2">Itens do Pedido</p>
              {orderItems[order.id] ? (
                <div className="space-y-2">
                  {orderItems[order.id].map((item) => (
                    <div key={item.id} className="bg-muted rounded-sm p-3">
                      <p className="font-body text-sm font-medium text-foreground">{item.product_name}</p>
                      <div className="font-body text-xs text-muted-foreground space-x-2 mt-1">
                        {item.is_custom_order && <span className="bg-accent/20 text-foreground px-1.5 py-0.5 rounded">Encomenda</span>}
                        {item.size && <span>Tam: {item.size}</span>}
                        <span>Qtd: {item.quantity}</span>
                      </div>
                      {item.measurements && (
                        <p className="font-body text-xs text-muted-foreground mt-1">
                          Medidas: {Object.entries(item.measurements as Record<string, string>).map(([k, v]) => `${k}: ${v}cm`).join(", ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-body text-sm text-muted-foreground">Carregando itens...</p>
              )}
            </div>

            {order.notes && (
              <div>
                <p className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-1">Observações</p>
                <p className="font-body text-sm text-foreground">{order.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2">
              {!isMine ? (
                <button
                  onClick={() => claimOrder(order.id)}
                  className="w-full bg-primary text-primary-foreground font-body text-sm font-medium py-3 rounded-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <HandHeart className="w-4 h-4" />
                  Aceitar Encomenda
                </button>
              ) : (
                <div>
                  <p className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-2">Atualizar Status</p>
                  <div className="flex flex-wrap gap-2">
                    {ARTISAN_STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => updateMyOrderStatus(order.id, s)}
                        className={`px-4 py-2 rounded-sm font-body text-xs transition-colors ${
                          order.status === s
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {STATUS_MAP[s].label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-body text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const currentOrders = tab === "available" ? availableOrders : myOrders;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
              <Scissors className="w-5 h-5" />
              Painel da Artesã
            </h1>
          </div>
          <button onClick={signOut} className="text-muted-foreground hover:text-foreground flex items-center gap-1 font-body text-sm">
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex border-b border-border mb-8">
          <button
            onClick={() => setTab("available")}
            className={`px-6 py-3 font-body text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === "available"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Disponíveis ({availableOrders.length})
          </button>
          <button
            onClick={() => setTab("mine")}
            className={`px-6 py-3 font-body text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === "mine"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Minhas Encomendas ({myOrders.length})
          </button>
        </div>

        {currentOrders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="font-body text-muted-foreground">
              {tab === "available"
                ? "Nenhuma encomenda disponível no momento."
                : "Você ainda não aceitou nenhuma encomenda."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentOrders.map((order) => renderOrder(order, tab === "mine"))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Artisan;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Package, Clock, Truck, CheckCircle, XCircle, ChevronDown, ChevronUp, LogOut, UserPlus, Scissors, Trash2 } from "lucide-react";

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
  first_payment_amount: number | null;
  second_payment_amount: number | null;
  first_payment_paid: boolean | null;
  second_payment_paid: boolean | null;
  has_custom_orders: boolean | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type ArtisanProfile = {
  user_id: string;
  full_name: string | null;
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

const STATUSES = ["pending", "confirmed", "in_production", "ready", "shipped", "delivered", "cancelled"];

const Admin = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItemRow[]>>({});
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [adminTab, setAdminTab] = useState<"orders" | "artisans">("orders");
  const [artisans, setArtisans] = useState<ArtisanProfile[]>([]);
  const [newArtisanEmail, setNewArtisanEmail] = useState("");
  const [addingArtisan, setAddingArtisan] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/auth");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchOrders();
      fetchArtisans();
    }
  }, [isAdmin]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar pedidos");
      setLoading(false);
      return;
    }

    setOrders(data || []);

    // Fetch profiles for user names
    const userIds = [...new Set((data || []).map((o) => o.user_id))];
    if (userIds.length > 0) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);
      const map: Record<string, string> = {};
      (profileData || []).forEach((p) => {
        map[p.user_id] = p.full_name || "Sem nome";
      });
      setProfiles(map);
    }

    setLoading(false);
  };

  const fetchArtisans = async () => {
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "artisan");
    
    if (roleData && roleData.length > 0) {
      const artisanIds = roleData.map((r) => r.user_id);
      const { data: profileData } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", artisanIds);
      setArtisans((profileData || []) as ArtisanProfile[]);
    } else {
      setArtisans([]);
    }
  };

  const addArtisan = async () => {
    if (!newArtisanEmail.trim()) return;
    setAddingArtisan(true);

    // Look up user by email via profiles — we need an edge function or a workaround
    // Since we can't query auth.users, we'll add by user_id lookup
    // For now, search profiles by name (admin manually provides user_id or we use a simpler approach)
    toast.error("Para adicionar uma artesã, insira o user_id dela. Peça para ela criar uma conta primeiro.");
    setAddingArtisan(false);
  };

  const addArtisanById = async (userId: string) => {
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role: "artisan" as any });
    
    if (error) {
      if (error.code === "23505") {
        toast.error("Esta usuária já é artesã.");
      } else {
        toast.error("Erro ao adicionar artesã: " + error.message);
      }
    } else {
      toast.success("Artesã adicionada com sucesso!");
      setNewArtisanEmail("");
      fetchArtisans();
    }
  };

  const removeArtisan = async (userId: string) => {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", "artisan" as any);
    
    if (error) {
      toast.error("Erro ao remover artesã");
    } else {
      toast.success("Artesã removida");
      fetchArtisans();
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

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);
    if (error) {
      toast.error("Erro ao atualizar status");
    } else {
      toast.success(`Status atualizado para: ${STATUS_MAP[newStatus]?.label}`);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    }
  };

  const togglePayment = async (orderId: string, field: "first_payment_paid" | "second_payment_paid", current: boolean) => {
    const { error } = await supabase
      .from("orders")
      .update({ [field]: !current })
      .eq("id", orderId);
    if (error) {
      toast.error("Erro ao atualizar pagamento");
    } else {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, [field]: !current } : o)));
      toast.success("Pagamento atualizado!");
    }
  };

  const filtered = filterStatus === "all" ? orders : orders.filter((o) => o.status === filterStatus);

  const getArtisanName = (artisanId: string | null) => {
    if (!artisanId) return null;
    const artisan = artisans.find((a) => a.user_id === artisanId);
    return artisan?.full_name || "Artesã";
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-body text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display text-xl font-semibold text-foreground">
              Painel Administrativo
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-body text-sm text-muted-foreground hidden sm:block">
              Por Dois Fios
            </span>
            <button onClick={signOut} className="text-muted-foreground hover:text-foreground flex items-center gap-1 font-body text-sm">
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Admin Tabs */}
        <div className="flex border-b border-border mb-8">
          <button
            onClick={() => setAdminTab("orders")}
            className={`px-6 py-3 font-body text-sm font-medium transition-colors border-b-2 -mb-px ${
              adminTab === "orders"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Encomendas ({orders.length})
          </button>
          <button
            onClick={() => setAdminTab("artisans")}
            className={`px-6 py-3 font-body text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 ${
              adminTab === "artisans"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Scissors className="w-4 h-4" /> Artesãs ({artisans.length})
          </button>
        </div>

        {adminTab === "artisans" ? (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mb-1">Gerenciar Artesãs</h2>
              <p className="font-body text-sm text-muted-foreground">Adicione ou remova artesãs que podem aceitar encomendas.</p>
            </div>

            {/* Add artisan form */}
            <div className="bg-card border border-border rounded-lg p-6">
              <label className="font-body text-xs text-muted-foreground uppercase tracking-wider block mb-2">Adicionar Artesã por User ID</label>
              <p className="font-body text-xs text-muted-foreground mb-3">Peça para a artesã criar uma conta primeiro, depois copie o user_id dela da tabela de perfis.</p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newArtisanEmail}
                  onChange={(e) => setNewArtisanEmail(e.target.value)}
                  placeholder="Cole o user_id aqui..."
                  className="flex-1 border border-input rounded-sm px-4 py-2 font-body text-sm bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                />
                <button
                  onClick={() => addArtisanById(newArtisanEmail.trim())}
                  disabled={!newArtisanEmail.trim() || addingArtisan}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-sm font-body text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Adicionar
                </button>
              </div>
            </div>

            {/* Artisan list */}
            <div className="space-y-3">
              {artisans.length === 0 ? (
                <div className="text-center py-12">
                  <Scissors className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="font-body text-muted-foreground">Nenhuma artesã cadastrada.</p>
                </div>
              ) : (
                artisans.map((artisan) => (
                  <div key={artisan.user_id} className="bg-card border border-border rounded-lg px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-body text-sm font-medium text-foreground">{artisan.full_name || "Sem nome"}</p>
                      <p className="font-body text-xs text-muted-foreground">{artisan.user_id}</p>
                    </div>
                    <button
                      onClick={() => removeArtisan(artisan.user_id)}
                      className="text-destructive hover:text-destructive/80 transition-colors p-2"
                      title="Remover artesã"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="font-display text-2xl font-semibold text-foreground">Encomendas</h2>
                <p className="font-body text-sm text-muted-foreground">{orders.length} pedido(s) no total</p>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-input rounded-sm px-4 py-2 font-body text-sm bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
              >
                <option value="all">Todos os status</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_MAP[s].label}</option>
                ))}
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="font-body text-muted-foreground">Nenhum pedido encontrado.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((order) => {
                  const status = STATUS_MAP[order.status] || STATUS_MAP.pending;
                  const StatusIcon = status.icon;
                  const isExpanded = expanded === order.id;
                  const artisanName = getArtisanName(order.artisan_id);

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
                              {profiles[order.user_id] || "—"} • {new Date(order.created_at).toLocaleDateString("pt-BR")}
                              {artisanName && <span className="ml-2">🧶 {artisanName}</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-body font-medium ${status.color}`}>
                            {status.label}
                          </span>
                          <span className="font-display text-sm font-semibold text-foreground whitespace-nowrap">
                            R$ {order.total.toFixed(2).replace(".", ",")}
                          </span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-6 pb-6 border-t border-border pt-4 space-y-6">
                          {/* Status */}
                          <div>
                            <label className="font-body text-xs text-muted-foreground uppercase tracking-wider block mb-2">Alterar Status</label>
                            <div className="flex flex-wrap gap-2">
                              {STATUSES.map((s) => (
                                <button
                                  key={s}
                                  onClick={() => updateStatus(order.id, s)}
                                  className={`px-3 py-1.5 rounded-sm font-body text-xs transition-colors ${
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

                          {/* Artisan info */}
                          <div>
                            <p className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-1">Artesã Responsável</p>
                            <p className="font-body text-sm text-foreground">
                              {artisanName || "Nenhuma artesã atribuída (aguardando escolha)"}
                            </p>
                          </div>

                          {/* Order info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">Envio</p>
                              <div className="font-body text-sm text-foreground space-y-1">
                                <p>{order.shipping_method || "Não definido"}</p>
                                <p>CEP: {order.shipping_cep || "—"}</p>
                                <p>{order.shipping_city ? `${order.shipping_city}/${order.shipping_state}` : "—"}</p>
                                <p>Frete: R$ {(order.shipping_cost || 0).toFixed(2).replace(".", ",")}</p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">Pagamento</p>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-body text-sm text-foreground">
                                    1ª parcela: R$ {(order.first_payment_amount || 0).toFixed(2).replace(".", ",")}
                                  </span>
                                  <button
                                    onClick={() => togglePayment(order.id, "first_payment_paid", !!order.first_payment_paid)}
                                    className={`px-3 py-1 rounded-sm font-body text-xs ${
                                      order.first_payment_paid
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {order.first_payment_paid ? "Pago ✓" : "Pendente"}
                                  </button>
                                </div>
                                {order.has_custom_orders && (
                                  <div className="flex items-center justify-between">
                                    <span className="font-body text-sm text-foreground">
                                      2ª parcela: R$ {(order.second_payment_amount || 0).toFixed(2).replace(".", ",")}
                                    </span>
                                    <button
                                      onClick={() => togglePayment(order.id, "second_payment_paid", !!order.second_payment_paid)}
                                      className={`px-3 py-1 rounded-sm font-body text-xs ${
                                        order.second_payment_paid
                                          ? "bg-emerald-100 text-emerald-800"
                                          : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {order.second_payment_paid ? "Pago ✓" : "Pendente"}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Items */}
                          <div>
                            <p className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-2">Itens do Pedido</p>
                            {orderItems[order.id] ? (
                              <div className="space-y-2">
                                {orderItems[order.id].map((item) => (
                                  <div key={item.id} className="bg-muted rounded-sm p-3 flex items-center justify-between">
                                    <div>
                                      <p className="font-body text-sm font-medium text-foreground">{item.product_name}</p>
                                      <div className="font-body text-xs text-muted-foreground space-x-2">
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
                                    <p className="font-display text-sm font-semibold text-foreground">
                                      R$ {item.product_price.toFixed(2).replace(".", ",")}
                                    </p>
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
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;

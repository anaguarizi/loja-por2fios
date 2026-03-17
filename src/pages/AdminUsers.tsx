import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Role = "admin" | "artisan" | "buyer";

export default function AdminUsers() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("artisan");
  const [loading, setLoading] = useState(false);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-create-user", {
        body: { email: email.trim(), password, full_name: fullName.trim(), role },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      toast.success("Usuário criado com sucesso.");
      setFullName("");
      setEmail("");
      setPassword("");
      setRole("artisan");
    } catch {
      toast.error("Não foi possível criar o usuário.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-4xl md:text-5xl font-semibold">Admin · Usuários</h1>
          <p className="text-muted-foreground mt-3 max-w-lg">
            Crie novos usuários (admin, artesã ou cliente).
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-xl">
          <form onSubmit={createUser} className="space-y-4 p-6 rounded-xl bg-card border border-border">
            <div>
              <label className="text-sm font-medium mb-1 block">Nome</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                minLength={6}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tipo</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="artisan">Artesã</option>
                <option value="buyer">Cliente</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Criando..." : "Criar usuário"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}


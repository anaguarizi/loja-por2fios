import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Account() {
  const { user, isAdmin, isArtisan, signOut } = useAuth();
  const navigate = useNavigate();

  const onSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen">
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-4xl md:text-5xl font-semibold">Minha conta</h1>
          <p className="text-muted-foreground mt-3 max-w-lg">
            {user?.email}
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-2xl space-y-4">
          <div className="p-6 rounded-xl bg-card border border-border">
            <p className="text-sm text-muted-foreground">Acessos</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {isArtisan && (
                <Link
                  to="/artesa/encomendas"
                  className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium"
                >
                  Área da artesã
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin/usuarios"
                  className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium"
                >
                  Admin · Usuários
                </Link>
              )}
            </div>
          </div>

          <button
            onClick={onSignOut}
            className="w-full py-3 rounded-lg bg-destructive text-destructive-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Sair
          </button>
        </div>
      </section>
    </div>
  );
}


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, ShoppingBag, User, LogOut, Shield, Scissors } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { items } = useCart();
  const { user, isAdmin, isArtisan, signOut } = useAuth();
  const navigate = useNavigate();
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const handleAuth = () => {
    if (user) {
      signOut();
    } else {
      navigate("/auth");
    }
    setMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <button onClick={() => scrollTo("hero")} className="font-display text-2xl font-semibold tracking-wide text-foreground">
          Por Dois Fios
        </button>

        <nav className="hidden md:flex items-center gap-8 font-body text-sm tracking-wide">
          <button onClick={() => scrollTo("catalogo")} className="text-muted-foreground hover:text-foreground transition-colors">Catálogo</button>
          <button onClick={() => scrollTo("encomendas")} className="text-muted-foreground hover:text-foreground transition-colors">Encomendas</button>
          <button onClick={() => scrollTo("como-funciona")} className="text-muted-foreground hover:text-foreground transition-colors">Como Funciona</button>
          <button onClick={() => scrollTo("contato")} className="text-muted-foreground hover:text-foreground transition-colors">Contato</button>
          <button onClick={() => scrollTo("carrinho")} className="relative text-foreground hover:text-primary transition-colors">
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </button>
          {isArtisan && (
            <button onClick={() => navigate("/artesa")} className="text-accent hover:text-foreground transition-colors" title="Painel Artesã">
              <Scissors className="w-5 h-5" />
            </button>
          )}
          {isAdmin && (
            <button onClick={() => navigate("/admin")} className="text-primary hover:text-foreground transition-colors" title="Painel Admin">
              <Shield className="w-5 h-5" />
            </button>
          )}
          <button onClick={handleAuth} className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            {user ? <LogOut className="w-4 h-4" /> : <User className="w-4 h-4" />}
            <span className="text-xs">{user ? "Sair" : "Entrar"}</span>
          </button>
        </nav>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-foreground">
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-background border-b border-border px-6 py-4 space-y-3 font-body text-sm">
          <button onClick={() => scrollTo("catalogo")} className="block w-full text-left text-muted-foreground hover:text-foreground">Catálogo</button>
          <button onClick={() => scrollTo("encomendas")} className="block w-full text-left text-muted-foreground hover:text-foreground">Encomendas</button>
          <button onClick={() => scrollTo("como-funciona")} className="block w-full text-left text-muted-foreground hover:text-foreground">Como Funciona</button>
          <button onClick={() => scrollTo("contato")} className="block w-full text-left text-muted-foreground hover:text-foreground">Contato</button>
          <button onClick={() => scrollTo("carrinho")} className="flex items-center gap-2 text-foreground">
            <ShoppingBag className="w-5 h-5" /> Carrinho {totalItems > 0 && `(${totalItems})`}
          </button>
          {isArtisan && (
            <button onClick={() => { navigate("/artesa"); setMenuOpen(false); }} className="flex items-center gap-2 text-accent">
              <Scissors className="w-5 h-5" /> Painel Artesã
            </button>
          )}
          {isAdmin && (
            <button onClick={() => { navigate("/admin"); setMenuOpen(false); }} className="flex items-center gap-2 text-primary">
              <Shield className="w-5 h-5" /> Painel Admin
            </button>
          )}
          <button onClick={handleAuth} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            {user ? <LogOut className="w-5 h-5" /> : <User className="w-5 h-5" />}
            {user ? "Sair" : "Entrar / Cadastrar"}
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;

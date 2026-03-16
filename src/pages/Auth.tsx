import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : error.message);
      } else {
        toast.success("Bem-vinda de volta!");
        navigate("/");
      }
    } else {
      if (!fullName.trim()) {
        toast.error("Preencha seu nome completo.");
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Cadastro realizado! Verifique seu e-mail para confirmar.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <button onClick={() => navigate("/")} className="font-display text-3xl font-semibold text-foreground tracking-wide">
            Por Dois Fios
          </button>
          <p className="font-body text-sm text-muted-foreground mt-2">
            {isLogin ? "Entre na sua conta" : "Crie sua conta de compradora"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-lg p-8 border border-border space-y-5">
          {!isLogin && (
            <div>
              <label className="font-body text-sm text-foreground block mb-1">Nome completo</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-input rounded-sm px-4 py-2.5 font-body text-sm bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                placeholder="Seu nome"
              />
            </div>
          )}

          <div>
            <label className="font-body text-sm text-foreground block mb-1">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-input rounded-sm px-4 py-2.5 font-body text-sm bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="font-body text-sm text-foreground block mb-1">Senha</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-input rounded-sm px-4 py-2.5 font-body text-sm bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none pr-10"
                placeholder="Mínimo 6 caracteres"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-sm font-body text-sm tracking-wider uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Aguarde..." : isLogin ? "Entrar" : "Cadastrar"}
          </button>

          <p className="text-center font-body text-sm text-muted-foreground">
            {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline">
              {isLogin ? "Cadastre-se" : "Faça login"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Auth;

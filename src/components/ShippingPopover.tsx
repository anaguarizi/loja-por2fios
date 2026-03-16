import { useState } from "react";
import { X, Truck, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ShippingPopover = () => {
  const [open, setOpen] = useState(true);
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    options: { name: string; price: number; days: string }[];
    destination: { city: string; state: string };
  } | null>(null);

  const calculate = async () => {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) {
      toast.error("CEP inválido. Insira 8 dígitos.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("calcular-frete", {
        body: { cepDestino: clean },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      setResult(data);
    } catch {
      toast.error("Erro ao calcular frete.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed top-[73px] left-0 right-0 z-40 bg-sage-light border-b border-border shadow-sm">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Truck className="w-5 h-5 text-primary shrink-0" />
            <p className="font-body text-sm text-foreground hidden sm:block">
              Calcule o frete antes de continuar:
            </p>
            <div className="flex gap-2 flex-1 max-w-md">
              <input
                type="text"
                placeholder="Digite seu CEP"
                maxLength={9}
                value={cep}
                onChange={(e) =>
                  setCep(
                    e.target.value
                      .replace(/\D/g, "")
                      .replace(/(\d{5})(\d)/, "$1-$2")
                  )
                }
                className="flex-1 border border-input rounded-sm px-3 py-1.5 font-body text-sm bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
              />
              <button
                onClick={calculate}
                disabled={loading}
                className="bg-primary text-primary-foreground px-4 py-1.5 rounded-sm font-body text-sm hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
              >
                {loading ? "..." : "Calcular"}
              </button>
            </div>
          </div>

          {result && (
            <div className="hidden md:flex items-center gap-4 text-sm font-body">
              <span className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                {result.destination.city}/{result.destination.state}
              </span>
              {result.options.map((opt) => (
                <span key={opt.name} className="text-foreground">
                  <strong>{opt.name.split(" - ")[0]}:</strong>{" "}
                  R$ {opt.price.toFixed(2).replace(".", ",")} ({opt.days})
                </span>
              ))}
            </div>
          )}

          <button
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {result && (
          <div className="md:hidden mt-2 space-y-1">
            <p className="font-body text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {result.destination.city}/{result.destination.state}
            </p>
            {result.options.map((opt) => (
              <p key={opt.name} className="font-body text-xs text-foreground">
                <strong>{opt.name.split(" - ")[0]}:</strong>{" "}
                R$ {opt.price.toFixed(2).replace(".", ",")} — {opt.days}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShippingPopover;

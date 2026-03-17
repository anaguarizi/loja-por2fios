// Supabase Edge Function: calcular-frete
// Provider: Melhor Envio (optional) + ViaCEP for destination city/state

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

type Body = {
  cepDestino: string;
  products?: Array<{
    id: string;
    width: number;
    height: number;
    length: number;
    weight: number;
    insurance_value: number;
    quantity: number;
  }>;
};

function json(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init.headers ?? {}),
    },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204 });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, { status: 405 });

  try {
    const body = (await req.json()) as Body;
    const cepDestino = (body.cepDestino ?? "").replace(/\D/g, "");
    if (cepDestino.length !== 8) return json({ error: "CEP inválido" }, { status: 400 });

    const viaCepResp = await fetch(`https://viacep.com.br/ws/${cepDestino}/json/`);
    const viaCep = await viaCepResp.json();
    if (!viaCepResp.ok || viaCep?.erro) return json({ error: "CEP não encontrado" }, { status: 400 });

    const destination = { city: viaCep.localidade as string, state: viaCep.uf as string };

    const melhorEnvioToken = Deno.env.get("MELHOR_ENVIO_TOKEN") ?? "";
    const fromCep = (Deno.env.get("MELHOR_ENVIO_FROM_CEP") ?? "").replace(/\D/g, "");
    const services = Deno.env.get("MELHOR_ENVIO_SERVICES") ?? "1,2";

    const products = (body.products?.length ? body.products : [
      {
        id: "default",
        width: 12,
        height: 6,
        length: 18,
        weight: 0.4,
        insurance_value: 100,
        quantity: 1,
      },
    ]).map((p) => ({
      ...p,
      weight: Number(p.weight),
      width: Number(p.width),
      height: Number(p.height),
      length: Number(p.length),
      insurance_value: Number(p.insurance_value),
      quantity: Number(p.quantity),
    }));

    if (melhorEnvioToken && fromCep.length === 8) {
      const resp = await fetch("https://www.melhorenvio.com.br/api/v2/me/shipment/calculate", {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authorization: `Bearer ${melhorEnvioToken}`,
          "user-agent": "por-dois-fios/1.0",
        },
        body: JSON.stringify({
          from: { postal_code: fromCep },
          to: { postal_code: cepDestino },
          products,
          options: { receipt: false, own_hand: false },
          services,
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        return json({ error: "Erro ao cotar frete no provedor", details: data }, { status: 502 });
      }

      const options = (Array.isArray(data) ? data : []).filter((s) => !s.error).map((s) => ({
        name: `${s.company?.name ?? s.name ?? "Entrega"} - ${s.name ?? ""}`.trim(),
        price: Number(s.custom_price ?? s.price ?? 0),
        days: `${s.custom_delivery_time ?? s.delivery_time ?? "?"} dias`,
      }));

      if (options.length > 0) return json({ destination, options });
    }

    // Fallback when provider isn't configured.
    return json({
      destination,
      options: [
        { name: "PAC", price: 29.9, days: "8-12 dias" },
        { name: "SEDEX", price: 49.9, days: "3-5 dias" },
      ],
    });
  } catch {
    return json({ error: "Erro interno" }, { status: 500 });
  }
});


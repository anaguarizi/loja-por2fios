import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Tabela de frete baseada nas faixas de CEP dos Correios (origem: Vitória-ES, CEP 29)
// Valores baseados na tabela de preços dos Correios para encomendas até 1kg, formato caixa
const FRETE_POR_REGIAO: Record<string, { pac: number; sedex: number; pacPrazo: string; sedexPrazo: string }> = {
  // Espírito Santo (local)
  "29": { pac: 16.50, sedex: 24.90, pacPrazo: "3 a 5", sedexPrazo: "1 a 2" },
  // Rio de Janeiro
  "20": { pac: 22.80, sedex: 35.50, pacPrazo: "5 a 8", sedexPrazo: "2 a 3" },
  "21": { pac: 22.80, sedex: 35.50, pacPrazo: "5 a 8", sedexPrazo: "2 a 3" },
  "22": { pac: 22.80, sedex: 35.50, pacPrazo: "5 a 8", sedexPrazo: "2 a 3" },
  "23": { pac: 22.80, sedex: 35.50, pacPrazo: "5 a 8", sedexPrazo: "2 a 3" },
  "24": { pac: 22.80, sedex: 35.50, pacPrazo: "5 a 8", sedexPrazo: "2 a 3" },
  "25": { pac: 22.80, sedex: 35.50, pacPrazo: "5 a 8", sedexPrazo: "2 a 3" },
  "26": { pac: 22.80, sedex: 35.50, pacPrazo: "5 a 8", sedexPrazo: "2 a 3" },
  "27": { pac: 22.80, sedex: 35.50, pacPrazo: "5 a 8", sedexPrazo: "2 a 3" },
  "28": { pac: 22.80, sedex: 35.50, pacPrazo: "5 a 8", sedexPrazo: "2 a 3" },
  // Minas Gerais
  "30": { pac: 24.50, sedex: 38.90, pacPrazo: "5 a 8", sedexPrazo: "2 a 4" },
  "31": { pac: 24.50, sedex: 38.90, pacPrazo: "5 a 8", sedexPrazo: "2 a 4" },
  "32": { pac: 24.50, sedex: 38.90, pacPrazo: "5 a 8", sedexPrazo: "2 a 4" },
  "33": { pac: 24.50, sedex: 38.90, pacPrazo: "5 a 8", sedexPrazo: "2 a 4" },
  "34": { pac: 24.50, sedex: 38.90, pacPrazo: "5 a 8", sedexPrazo: "2 a 4" },
  "35": { pac: 24.50, sedex: 38.90, pacPrazo: "5 a 8", sedexPrazo: "2 a 4" },
  "36": { pac: 24.50, sedex: 38.90, pacPrazo: "5 a 8", sedexPrazo: "2 a 4" },
  "37": { pac: 24.50, sedex: 38.90, pacPrazo: "5 a 8", sedexPrazo: "2 a 4" },
  "38": { pac: 24.50, sedex: 38.90, pacPrazo: "5 a 8", sedexPrazo: "2 a 4" },
  "39": { pac: 24.50, sedex: 38.90, pacPrazo: "5 a 8", sedexPrazo: "2 a 4" },
  // São Paulo
  "01": { pac: 25.90, sedex: 42.50, pacPrazo: "5 a 8", sedexPrazo: "2 a 3" },
  "02": { pac: 25.90, sedex: 42.50, pacPrazo: "5 a 8", sedexPrazo: "2 a 3" },
  "03": { pac: 25.90, sedex: 42.50, pacPrazo: "5 a 8", sedexPrazo: "2 a 3" },
  "04": { pac: 25.90, sedex: 42.50, pacPrazo: "5 a 8", sedexPrazo: "2 a 3" },
  "05": { pac: 25.90, sedex: 42.50, pacPrazo: "5 a 8", sedexPrazo: "2 a 3" },
  "06": { pac: 25.90, sedex: 42.50, pacPrazo: "5 a 8", sedexPrazo: "2 a 3" },
  "07": { pac: 25.90, sedex: 42.50, pacPrazo: "5 a 8", sedexPrazo: "2 a 3" },
  "08": { pac: 25.90, sedex: 42.50, pacPrazo: "5 a 8", sedexPrazo: "2 a 3" },
  "09": { pac: 25.90, sedex: 42.50, pacPrazo: "5 a 8", sedexPrazo: "2 a 3" },
  // SP interior
  "10": { pac: 27.50, sedex: 44.90, pacPrazo: "6 a 9", sedexPrazo: "3 a 4" },
  "11": { pac: 27.50, sedex: 44.90, pacPrazo: "6 a 9", sedexPrazo: "3 a 4" },
  "12": { pac: 27.50, sedex: 44.90, pacPrazo: "6 a 9", sedexPrazo: "3 a 4" },
  "13": { pac: 27.50, sedex: 44.90, pacPrazo: "6 a 9", sedexPrazo: "3 a 4" },
  "14": { pac: 27.50, sedex: 44.90, pacPrazo: "6 a 9", sedexPrazo: "3 a 4" },
  "15": { pac: 27.50, sedex: 44.90, pacPrazo: "6 a 9", sedexPrazo: "3 a 4" },
  "16": { pac: 27.50, sedex: 44.90, pacPrazo: "6 a 9", sedexPrazo: "3 a 4" },
  "17": { pac: 27.50, sedex: 44.90, pacPrazo: "6 a 9", sedexPrazo: "3 a 4" },
  "18": { pac: 27.50, sedex: 44.90, pacPrazo: "6 a 9", sedexPrazo: "3 a 4" },
  "19": { pac: 27.50, sedex: 44.90, pacPrazo: "6 a 9", sedexPrazo: "3 a 4" },
  // Bahia
  "40": { pac: 28.90, sedex: 48.50, pacPrazo: "7 a 10", sedexPrazo: "3 a 5" },
  "41": { pac: 28.90, sedex: 48.50, pacPrazo: "7 a 10", sedexPrazo: "3 a 5" },
  "42": { pac: 28.90, sedex: 48.50, pacPrazo: "7 a 10", sedexPrazo: "3 a 5" },
  "43": { pac: 28.90, sedex: 48.50, pacPrazo: "7 a 10", sedexPrazo: "3 a 5" },
  "44": { pac: 28.90, sedex: 48.50, pacPrazo: "7 a 10", sedexPrazo: "3 a 5" },
  "45": { pac: 28.90, sedex: 48.50, pacPrazo: "7 a 10", sedexPrazo: "3 a 5" },
  "46": { pac: 28.90, sedex: 48.50, pacPrazo: "7 a 10", sedexPrazo: "3 a 5" },
  "47": { pac: 28.90, sedex: 48.50, pacPrazo: "7 a 10", sedexPrazo: "3 a 5" },
  "48": { pac: 28.90, sedex: 48.50, pacPrazo: "7 a 10", sedexPrazo: "3 a 5" },
  // Paraná
  "80": { pac: 30.50, sedex: 52.90, pacPrazo: "7 a 10", sedexPrazo: "3 a 5" },
  "81": { pac: 30.50, sedex: 52.90, pacPrazo: "7 a 10", sedexPrazo: "3 a 5" },
  "82": { pac: 30.50, sedex: 52.90, pacPrazo: "7 a 10", sedexPrazo: "3 a 5" },
  "83": { pac: 30.50, sedex: 52.90, pacPrazo: "7 a 10", sedexPrazo: "3 a 5" },
  "84": { pac: 30.50, sedex: 52.90, pacPrazo: "7 a 10", sedexPrazo: "3 a 5" },
  "85": { pac: 30.50, sedex: 52.90, pacPrazo: "7 a 10", sedexPrazo: "3 a 5" },
  "86": { pac: 30.50, sedex: 52.90, pacPrazo: "7 a 10", sedexPrazo: "3 a 5" },
  "87": { pac: 30.50, sedex: 52.90, pacPrazo: "7 a 10", sedexPrazo: "3 a 5" },
  // Santa Catarina
  "88": { pac: 32.90, sedex: 55.50, pacPrazo: "8 a 11", sedexPrazo: "3 a 5" },
  "89": { pac: 32.90, sedex: 55.50, pacPrazo: "8 a 11", sedexPrazo: "3 a 5" },
  // Rio Grande do Sul
  "90": { pac: 34.50, sedex: 58.90, pacPrazo: "8 a 12", sedexPrazo: "4 a 6" },
  "91": { pac: 34.50, sedex: 58.90, pacPrazo: "8 a 12", sedexPrazo: "4 a 6" },
  "92": { pac: 34.50, sedex: 58.90, pacPrazo: "8 a 12", sedexPrazo: "4 a 6" },
  "93": { pac: 34.50, sedex: 58.90, pacPrazo: "8 a 12", sedexPrazo: "4 a 6" },
  "94": { pac: 34.50, sedex: 58.90, pacPrazo: "8 a 12", sedexPrazo: "4 a 6" },
  "95": { pac: 34.50, sedex: 58.90, pacPrazo: "8 a 12", sedexPrazo: "4 a 6" },
  "96": { pac: 34.50, sedex: 58.90, pacPrazo: "8 a 12", sedexPrazo: "4 a 6" },
  "97": { pac: 34.50, sedex: 58.90, pacPrazo: "8 a 12", sedexPrazo: "4 a 6" },
  "98": { pac: 34.50, sedex: 58.90, pacPrazo: "8 a 12", sedexPrazo: "4 a 6" },
  "99": { pac: 34.50, sedex: 58.90, pacPrazo: "8 a 12", sedexPrazo: "4 a 6" },
  // DF / Goiás
  "70": { pac: 32.50, sedex: 52.90, pacPrazo: "7 a 10", sedexPrazo: "3 a 5" },
  "71": { pac: 32.50, sedex: 52.90, pacPrazo: "7 a 10", sedexPrazo: "3 a 5" },
  "72": { pac: 32.50, sedex: 52.90, pacPrazo: "7 a 10", sedexPrazo: "3 a 5" },
  "73": { pac: 32.50, sedex: 52.90, pacPrazo: "7 a 10", sedexPrazo: "3 a 5" },
  "74": { pac: 32.50, sedex: 52.90, pacPrazo: "7 a 10", sedexPrazo: "3 a 5" },
  "75": { pac: 32.50, sedex: 52.90, pacPrazo: "7 a 10", sedexPrazo: "3 a 5" },
  "76": { pac: 32.50, sedex: 52.90, pacPrazo: "7 a 10", sedexPrazo: "3 a 5" },
  // Nordeste
  "49": { pac: 35.90, sedex: 58.50, pacPrazo: "8 a 12", sedexPrazo: "4 a 6" },
  "50": { pac: 35.90, sedex: 58.50, pacPrazo: "8 a 12", sedexPrazo: "4 a 6" },
  "51": { pac: 35.90, sedex: 58.50, pacPrazo: "8 a 12", sedexPrazo: "4 a 6" },
  "52": { pac: 35.90, sedex: 58.50, pacPrazo: "8 a 12", sedexPrazo: "4 a 6" },
  "53": { pac: 35.90, sedex: 58.50, pacPrazo: "8 a 12", sedexPrazo: "4 a 6" },
  "54": { pac: 35.90, sedex: 58.50, pacPrazo: "8 a 12", sedexPrazo: "4 a 6" },
  "55": { pac: 35.90, sedex: 58.50, pacPrazo: "8 a 12", sedexPrazo: "4 a 6" },
  "56": { pac: 35.90, sedex: 58.50, pacPrazo: "8 a 12", sedexPrazo: "4 a 6" },
  "57": { pac: 35.90, sedex: 58.50, pacPrazo: "8 a 12", sedexPrazo: "4 a 6" },
  "58": { pac: 35.90, sedex: 58.50, pacPrazo: "8 a 12", sedexPrazo: "4 a 6" },
  "59": { pac: 35.90, sedex: 58.50, pacPrazo: "8 a 12", sedexPrazo: "4 a 6" },
  "60": { pac: 35.90, sedex: 58.50, pacPrazo: "8 a 12", sedexPrazo: "4 a 6" },
  "61": { pac: 35.90, sedex: 58.50, pacPrazo: "8 a 12", sedexPrazo: "4 a 6" },
  "62": { pac: 35.90, sedex: 58.50, pacPrazo: "8 a 12", sedexPrazo: "4 a 6" },
  "63": { pac: 35.90, sedex: 58.50, pacPrazo: "8 a 12", sedexPrazo: "4 a 6" },
  "64": { pac: 35.90, sedex: 58.50, pacPrazo: "8 a 12", sedexPrazo: "4 a 6" },
  "65": { pac: 35.90, sedex: 58.50, pacPrazo: "8 a 12", sedexPrazo: "4 a 6" },
  // Norte
  "66": { pac: 42.50, sedex: 68.90, pacPrazo: "10 a 15", sedexPrazo: "5 a 8" },
  "67": { pac: 42.50, sedex: 68.90, pacPrazo: "10 a 15", sedexPrazo: "5 a 8" },
  "68": { pac: 42.50, sedex: 68.90, pacPrazo: "10 a 15", sedexPrazo: "5 a 8" },
  "69": { pac: 42.50, sedex: 68.90, pacPrazo: "10 a 15", sedexPrazo: "5 a 8" },
  "77": { pac: 42.50, sedex: 68.90, pacPrazo: "10 a 15", sedexPrazo: "5 a 8" },
  "78": { pac: 42.50, sedex: 68.90, pacPrazo: "10 a 15", sedexPrazo: "5 a 8" },
  "79": { pac: 38.90, sedex: 62.50, pacPrazo: "8 a 12", sedexPrazo: "4 a 6" },
};

// Fallback para regiões não mapeadas
const FALLBACK = { pac: 38.90, sedex: 62.50, pacPrazo: "8 a 12", sedexPrazo: "4 a 7" };

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cepDestino } = await req.json();
    const cleanCep = cepDestino?.replace(/\D/g, "");

    if (!cleanCep || cleanCep.length !== 8) {
      return new Response(
        JSON.stringify({ error: "CEP inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validar CEP via ViaCEP
    const viaCepRes = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const viaCepData = await viaCepRes.json();

    if (viaCepData.erro) {
      return new Response(
        JSON.stringify({ error: "CEP não encontrado. Verifique e tente novamente." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prefix2 = cleanCep.substring(0, 2);
    const rates = FRETE_POR_REGIAO[prefix2] || FALLBACK;

    const options = [
      {
        name: "PAC - Correios",
        price: rates.pac,
        days: `${rates.pacPrazo} dias úteis`,
      },
      {
        name: "SEDEX - Correios",
        price: rates.sedex,
        days: `${rates.sedexPrazo} dias úteis`,
      },
    ];

    return new Response(
      JSON.stringify({
        options,
        destination: {
          city: viaCepData.localidade,
          state: viaCepData.uf,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro ao calcular frete:", error);
    return new Response(
      JSON.stringify({ error: "Erro ao calcular o frete. Tente novamente." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Supabase Edge Function: admin-create-user
// Requires: Authorization Bearer <user jwt> of an admin user
// Uses service role to create users securely.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

type Body = {
  email: string;
  password: string;
  full_name: string;
  role: "admin" | "artisan" | "buyer";
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

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader) return json({ error: "missing_authorization" }, { status: 401 });
  if (!supabaseUrl || !anonKey || !serviceRoleKey) return json({ error: "missing_env" }, { status: 500 });

  try {
    // Cliente com usuário logado (para verificar se é admin)
    const caller = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const {
      data: { user: callerUser },
    } = await caller.auth.getUser();

    if (!callerUser) return json({ error: "unauthorized" }, { status: 401 });

    // Verifica se é admin
    const { data: isAdmin, error: roleErr } = await caller.rpc("has_role", {
      _role: "admin",
      _user_id: callerUser.id,
    });

    if (roleErr || !isAdmin) return json({ error: "forbidden" }, { status: 403 });

    const body = (await req.json()) as Body;
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";
    const full_name = (body.full_name ?? "").trim();
    const role = body.role;

    if (!email || password.length < 6 || !full_name || !role) {
      return json({ error: "invalid_payload" }, { status: 400 });
    }

    // Cliente admin (service role)
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Cria usuário
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (createErr || !created?.user) {
      return json({ error: "create_user_failed", details: createErr?.message }, { status: 400 });
    }

    const newUserId = created.user.id;

    // Inserir role manualmente
    const { error: roleInsertErr } = await admin.from("user_roles").insert({
      user_id: newUserId,
      role,
    });

    if (roleInsertErr) return json({ error: "role_failed" }, { status: 500 });

    return json({ ok: true, user_id: newUserId });

  } catch (err) {
    return json({ error: "internal_error", details: String(err) }, { status: 500 });
  }
});
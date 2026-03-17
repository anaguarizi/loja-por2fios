-- Auth + Authorization + Order assignment (admin/artisan/buyer)

-- 1) Roles enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'artisan', 'buyer');
  END IF;
END$$;

-- 2) Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3) User roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- 4) Orders + items
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  artisan_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'new',
  total numeric NOT NULL DEFAULT 0,
  notes text,
  has_custom_orders boolean DEFAULT false,
  shipping_cep text,
  shipping_city text,
  shipping_state text,
  shipping_method text,
  shipping_cost numeric,
  first_payment_amount numeric,
  first_payment_paid boolean,
  second_payment_amount numeric,
  second_payment_paid boolean,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  product_name text NOT NULL,
  product_price numeric NOT NULL,
  quantity int NOT NULL DEFAULT 1,
  size text,
  is_custom_order boolean,
  measurements jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5) Helper: has_role used by Edge Functions + RLS
CREATE OR REPLACE FUNCTION public.has_role(_role public.app_role, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role = _role
  );
$$;

-- 6) Default role + profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'buyer')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7) Auto assignment: artisan with least active orders
CREATE OR REPLACE FUNCTION public.assign_artisan_to_order(_order_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chosen uuid;
BEGIN
  SELECT ur.user_id
  INTO chosen
  FROM public.user_roles ur
  LEFT JOIN public.orders o
    ON o.artisan_id = ur.user_id
   AND o.status NOT IN ('done', 'cancelled')
  WHERE ur.role = 'artisan'
  GROUP BY ur.user_id
  ORDER BY COUNT(o.id) ASC, ur.user_id ASC
  LIMIT 1;

  IF chosen IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE public.orders
     SET artisan_id = chosen,
         updated_at = now()
   WHERE id = _order_id
     AND artisan_id IS NULL;

  RETURN chosen;
END;
$$;

CREATE OR REPLACE FUNCTION public.auto_assign_artisan_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.assign_artisan_to_order(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_auto_assign_artisan ON public.orders;
CREATE TRIGGER orders_auto_assign_artisan
AFTER INSERT ON public.orders
FOR EACH ROW
WHEN (NEW.artisan_id IS NULL)
EXECUTE FUNCTION public.auto_assign_artisan_trigger();

-- 8) RLS (minimal, adjust as needed)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- profiles: user can read/write their own
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "profiles_upsert_own" ON public.profiles;
CREATE POLICY "profiles_upsert_own" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- user_roles: user can read their own roles; admin can read all
DROP POLICY IF EXISTS "roles_select" ON public.user_roles;
CREATE POLICY "roles_select" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id OR public.has_role('admin', auth.uid()));

-- orders: buyers see their own; artisans see assigned; admin sees all
DROP POLICY IF EXISTS "orders_select" ON public.orders;
CREATE POLICY "orders_select" ON public.orders
FOR SELECT USING (
  auth.uid() = user_id
  OR auth.uid() = artisan_id
  OR public.has_role('admin', auth.uid())
);

DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
CREATE POLICY "orders_insert_own" ON public.orders
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "orders_update_buyer_or_artisan" ON public.orders;
CREATE POLICY "orders_update_buyer_or_artisan" ON public.orders
FOR UPDATE USING (
  auth.uid() = user_id
  OR auth.uid() = artisan_id
  OR public.has_role('admin', auth.uid())
);

-- order_items: buyers can insert/select for own orders; artisans for assigned
DROP POLICY IF EXISTS "order_items_select" ON public.order_items;
CREATE POLICY "order_items_select" ON public.order_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
      AND (o.user_id = auth.uid() OR o.artisan_id = auth.uid() OR public.has_role('admin', auth.uid()))
  )
);

DROP POLICY IF EXISTS "order_items_insert" ON public.order_items;
CREATE POLICY "order_items_insert" ON public.order_items
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
      AND o.user_id = auth.uid()
  )
);


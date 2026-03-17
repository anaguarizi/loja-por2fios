-- =========================
-- 1) ENUMS
-- =========================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE app_role AS ENUM ('admin', 'artisan', 'buyer');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS ENUM ('pending', 'paid', 'in_progress', 'shipped', 'done', 'cancelled');
  END IF;
END$$;


-- =========================
-- 2) USERS
-- =========================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role,
  UNIQUE(user_id, role)
);


-- =========================
-- 3) PRODUCTS
-- =========================

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL
);

CREATE TABLE IF NOT EXISTS yarn_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL
);

CREATE TABLE IF NOT EXISTS yarn_colors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  yarn_type_id uuid REFERENCES yarn_types(id),
  name text NOT NULL,
  hex text
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  base_price numeric NOT NULL,
  category_id uuid REFERENCES categories(id),
  yarn_type_id uuid REFERENCES yarn_types(id),
  is_customizable boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  size text, -- PP, P, M...
  additional_price numeric DEFAULT 0
);

CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL
);


-- =========================
-- 4) CART
-- =========================

CREATE TABLE IF NOT EXISTS carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid REFERENCES carts(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  variant_id uuid REFERENCES product_variants(id),
  quantity int DEFAULT 1,
  selected_color_id uuid REFERENCES yarn_colors(id),
  custom_measurements jsonb
);


-- =========================
-- 5) ORDERS
-- =========================

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  artisan_id uuid REFERENCES auth.users(id),
  status order_status DEFAULT 'pending',
  total numeric,
  production_days int DEFAULT 0,
  estimated_shipping_date date,
  estimated_delivery_date date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid,
  product_name text,
  price numeric,
  quantity int,
  size text,
  color text,
  custom_measurements jsonb
);


-- =========================
-- 6) SHIPPING
-- =========================

CREATE TABLE IF NOT EXISTS shipping_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  service_name text,
  price numeric,
  estimated_days int
);


-- =========================
-- 7) UPDATES (mensagens da artesã)
-- =========================

CREATE TABLE IF NOT EXISTS order_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  artisan_id uuid,
  message text,
  allow_cancel boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);


-- =========================
-- 8) PAYMENTS
-- =========================

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id),
  amount numeric,
  status text,
  method text,
  created_at timestamptz DEFAULT now()
);


-- =========================
-- 9) AUTO ROLE + PROFILE
-- =========================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (user_id, full_name)
  VALUES (NEW.id, NEW.email);

  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'buyer');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- =========================
-- 10) AUTO ASSIGN ARTISAN
-- =========================

CREATE OR REPLACE FUNCTION assign_artisan(order_id uuid)
RETURNS void AS $$
DECLARE chosen uuid;
BEGIN
  SELECT user_id INTO chosen
  FROM user_roles
  WHERE role = 'artisan'
  LIMIT 1;

  UPDATE orders SET artisan_id = chosen WHERE id = order_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trigger_assign_artisan()
RETURNS trigger AS $$
BEGIN
  PERFORM assign_artisan(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_assign
AFTER INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION trigger_assign_artisan();
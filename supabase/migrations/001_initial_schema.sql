-- ============================================================
-- N.K Ornaments – Full Database Schema
-- Run this in your Supabase SQL Editor (one-time setup)
-- ============================================================

-- ===================== 1. EXTENSIONS =====================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- for gen_random_uuid()

-- ===================== 2. TABLES & INDEXES =====================

-- 1. categories
CREATE TABLE IF NOT EXISTS public.categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories (slug);

-- 2. anklets
CREATE TABLE IF NOT EXISTS public.anklets (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id          uuid NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  name                 text NOT NULL,
  sku                  text NOT NULL UNIQUE,
  description          text,
  material             text,
  weight               text,          -- e.g. "12g"
  length               text,          -- e.g. "25cm"
  colour               text,
  wholesale_price      numeric(10,2) NOT NULL DEFAULT 0,
  min_order_qty        integer NOT NULL DEFAULT 1,
  stock_quantity        integer NOT NULL DEFAULT 0,
  low_stock_threshold  integer NOT NULL DEFAULT 5,
  manual_out_of_stock  boolean NOT NULL DEFAULT false,
  is_active            boolean NOT NULL DEFAULT true,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_anklets_category_id ON public.anklets (category_id);
CREATE INDEX IF NOT EXISTS idx_anklets_sku ON public.anklets (sku);
CREATE INDEX IF NOT EXISTS idx_anklets_is_active ON public.anklets (is_active);

-- 3. anklet_images
CREATE TABLE IF NOT EXISTS public.anklet_images (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anklet_id     uuid NOT NULL REFERENCES public.anklets(id) ON DELETE CASCADE,
  storage_path  text NOT NULL,
  public_url    text NOT NULL,
  size_bytes    bigint NOT NULL DEFAULT 0,
  is_primary    boolean NOT NULL DEFAULT false,
  sort_order    integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_anklet_images_anklet_id ON public.anklet_images (anklet_id);

-- 4. customers
CREATE TABLE IF NOT EXISTS public.customers (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name   text NOT NULL,
  contact_person  text NOT NULL,
  email           text NOT NULL UNIQUE,
  phone           text NOT NULL,
  whatsapp        text,
  gst_number      text,
  address_line    text NOT NULL,
  city            text NOT NULL,
  state           text NOT NULL,
  pincode         text NOT NULL,
  is_disabled     boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- 5. orders
CREATE TABLE IF NOT EXISTS public.orders (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  customer_id  uuid NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  status       text NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','confirmed','dispatched','completed','cancelled')),
  note         text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);

-- 6. order_items
CREATE TABLE IF NOT EXISTS public.order_items (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id             uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  anklet_id            uuid NOT NULL REFERENCES public.anklets(id) ON DELETE RESTRICT,
  anklet_name_snapshot text NOT NULL,
  price_snapshot       numeric(10,2) NOT NULL,
  quantity             integer NOT NULL CHECK (quantity > 0)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);

-- 7. admins (must exist before is_admin() function)
CREATE TABLE IF NOT EXISTS public.admins (
  user_id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8. enquiries
CREATE TABLE IF NOT EXISTS public.enquiries (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  phone      text,
  email      text,
  message    text NOT NULL,
  is_read    boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 9. site_settings (key-value store)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key   text PRIMARY KEY,
  value text NOT NULL DEFAULT ''
);

-- Pre-populate setting KEYS with empty values so the admin panel can display them
INSERT INTO public.site_settings (key, value) VALUES
  ('business_name', ''),
  ('tagline', ''),
  ('banner_text', ''),
  ('about_text', ''),
  ('contact_phone', ''),
  ('contact_email', ''),
  ('contact_whatsapp', ''),
  ('contact_address', ''),
  ('social_instagram', ''),
  ('social_facebook', ''),
  ('social_youtube', ''),
  ('price_visibility', 'customers_only')
ON CONFLICT (key) DO NOTHING;

-- ===================== 3. HELPER FUNCTIONS =====================

-- Checks whether the current authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  );
$$;

-- Automatically set updated_at on anklets row changes
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_anklets_updated_at ON public.anklets;
CREATE TRIGGER trg_anklets_updated_at
  BEFORE UPDATE ON public.anklets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===================== 4. ROW LEVEL SECURITY (RLS) =====================

ALTER TABLE public.categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anklets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anklet_images  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings  ENABLE ROW LEVEL SECURITY;

-- ---- categories ----
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories"
  ON public.categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin manage categories" ON public.categories;
CREATE POLICY "Admin manage categories"
  ON public.categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---- anklets ----
DROP POLICY IF EXISTS "Public read active anklets" ON public.anklets;
CREATE POLICY "Public read active anklets"
  ON public.anklets FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admin manage anklets" ON public.anklets;
CREATE POLICY "Admin manage anklets"
  ON public.anklets FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---- anklet_images ----
DROP POLICY IF EXISTS "Public read images of active anklets" ON public.anklet_images;
CREATE POLICY "Public read images of active anklets"
  ON public.anklet_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.anklets a
      WHERE a.id = anklet_id AND a.is_active = true
    )
  );

DROP POLICY IF EXISTS "Admin manage anklet_images" ON public.anklet_images;
CREATE POLICY "Admin manage anklet_images"
  ON public.anklet_images FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---- customers ----
DROP POLICY IF EXISTS "Customers read own data" ON public.customers;
CREATE POLICY "Customers read own data"
  ON public.customers FOR SELECT
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Customers insert own data" ON public.customers;
CREATE POLICY "Customers insert own data"
  ON public.customers FOR INSERT
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Customers update own data" ON public.customers;
CREATE POLICY "Customers update own data"
  ON public.customers FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Admin manage customers" ON public.customers;
CREATE POLICY "Admin manage customers"
  ON public.customers FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---- orders ----
DROP POLICY IF EXISTS "Customers read own orders" ON public.orders;
CREATE POLICY "Customers read own orders"
  ON public.orders FOR SELECT
  USING (customer_id = auth.uid());

DROP POLICY IF EXISTS "Customers insert own orders" ON public.orders;
CREATE POLICY "Customers insert own orders"
  ON public.orders FOR INSERT
  WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "Admin manage orders" ON public.orders;
CREATE POLICY "Admin manage orders"
  ON public.orders FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---- order_items ----
DROP POLICY IF EXISTS "Customers read own order items" ON public.order_items;
CREATE POLICY "Customers read own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.customer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Customers insert own order items" ON public.order_items;
CREATE POLICY "Customers insert own order items"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.customer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admin manage order_items" ON public.order_items;
CREATE POLICY "Admin manage order_items"
  ON public.order_items FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---- admins ----
DROP POLICY IF EXISTS "Admin read admins" ON public.admins;
CREATE POLICY "Admin read admins"
  ON public.admins FOR SELECT
  USING (public.is_admin());

-- ---- enquiries ----
DROP POLICY IF EXISTS "Anyone can insert enquiries" ON public.enquiries;
CREATE POLICY "Anyone can insert enquiries"
  ON public.enquiries FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin manage enquiries" ON public.enquiries;
CREATE POLICY "Admin manage enquiries"
  ON public.enquiries FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---- site_settings ----
DROP POLICY IF EXISTS "Public read site_settings" ON public.site_settings;
CREATE POLICY "Public read site_settings"
  ON public.site_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin manage site_settings" ON public.site_settings;
CREATE POLICY "Admin manage site_settings"
  ON public.site_settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ===================== 5. STORAGE POLICIES =====================
-- Run AFTER creating the public bucket "anklet-photos" in Supabase Storage

DROP POLICY IF EXISTS "Public read anklet-photos" ON storage.objects;
CREATE POLICY "Public read anklet-photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'anklet-photos');

DROP POLICY IF EXISTS "Admin upload anklet-photos" ON storage.objects;
CREATE POLICY "Admin upload anklet-photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'anklet-photos' AND public.is_admin());

DROP POLICY IF EXISTS "Admin update anklet-photos" ON storage.objects;
CREATE POLICY "Admin update anklet-photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'anklet-photos' AND public.is_admin())
  WITH CHECK (bucket_id = 'anklet-photos' AND public.is_admin());

DROP POLICY IF EXISTS "Admin delete anklet-photos" ON storage.objects;
CREATE POLICY "Admin delete anklet-photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'anklet-photos' AND public.is_admin());

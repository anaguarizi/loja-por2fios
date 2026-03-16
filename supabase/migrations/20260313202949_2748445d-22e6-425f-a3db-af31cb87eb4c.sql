
-- Add artisan_id to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS artisan_id uuid;

-- Add RLS policy for artisans to view their assigned orders
CREATE POLICY "Artisans can view assigned orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  artisan_id = auth.uid() AND public.has_role(auth.uid(), 'artisan')
);

-- Allow artisans to claim unassigned orders (update artisan_id only when null)
CREATE POLICY "Artisans can claim unassigned orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  artisan_id IS NULL AND public.has_role(auth.uid(), 'artisan')
)
WITH CHECK (
  artisan_id = auth.uid()
);

-- Allow artisans to update status of their assigned orders
CREATE POLICY "Artisans can update own assigned orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  artisan_id = auth.uid() AND public.has_role(auth.uid(), 'artisan')
);

-- Allow artisans to view order items for their assigned orders
CREATE POLICY "Artisans can view assigned order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.artisan_id = auth.uid()
    AND public.has_role(auth.uid(), 'artisan')
  )
);

-- Allow admins to read all profiles (needed to list artisans)
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

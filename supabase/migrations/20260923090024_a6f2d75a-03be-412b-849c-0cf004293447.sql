
-- Helper: is a restaurant publicly visible to diners?
CREATE OR REPLACE FUNCTION public.is_published_restaurant(_restaurant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = _restaurant_id
      AND r.is_suspended = false
      AND r.onboarding_complete = true
  );
$$;

-- Helper: does the current auth user own this customer record?
CREATE OR REPLACE FUNCTION public.owns_customer(_customer_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.customers c
    WHERE c.id = _customer_id AND c.user_id = auth.uid()
  );
$$;

-- Helper: does the current auth user own this order (as the diner)?
CREATE OR REPLACE FUNCTION public.owns_order(_order_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.customers c ON c.id = o.customer_id
    WHERE o.id = _order_id AND c.user_id = auth.uid()
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_published_restaurant(uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.owns_customer(uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.owns_order(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.is_published_restaurant(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.owns_customer(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.owns_order(uuid) TO authenticated, service_role;

-- ---------- Public catalogue reads (diner app) ----------
GRANT SELECT ON public.restaurants, public.branches, public.menu_categories,
  public.menu_items, public.modifier_groups, public.modifiers, public.promotions TO anon;

CREATE POLICY "public restaurants read" ON public.restaurants
  FOR SELECT TO anon, authenticated
  USING (is_suspended = false AND onboarding_complete = true);

CREATE POLICY "public branches read" ON public.branches
  FOR SELECT TO anon, authenticated
  USING (is_active = true AND public.is_published_restaurant(restaurant_id));

CREATE POLICY "public categories read" ON public.menu_categories
  FOR SELECT TO anon, authenticated
  USING (is_active = true AND public.is_published_restaurant(restaurant_id));

CREATE POLICY "public items read" ON public.menu_items
  FOR SELECT TO anon, authenticated
  USING (public.is_published_restaurant(restaurant_id));

CREATE POLICY "public modifier groups read" ON public.modifier_groups
  FOR SELECT TO anon, authenticated
  USING (public.is_published_restaurant(restaurant_id));

CREATE POLICY "public modifiers read" ON public.modifiers
  FOR SELECT TO anon, authenticated
  USING (public.is_published_restaurant(restaurant_id));

CREATE POLICY "public promotions read" ON public.promotions
  FOR SELECT TO anon, authenticated
  USING (
    is_active = true
    AND public.is_published_restaurant(restaurant_id)
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at IS NULL OR ends_at >= now())
  );

-- ---------- Diner-owned records ----------
CREATE POLICY "customer owns record read" ON public.customers
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "customer creates own record" ON public.customers
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.is_published_restaurant(restaurant_id));

CREATE POLICY "customer updates own record" ON public.customers
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "customer reads own orders" ON public.orders
  FOR SELECT TO authenticated USING (public.owns_customer(customer_id));

CREATE POLICY "customer places order" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (
    public.owns_customer(customer_id)
    AND public.is_published_restaurant(restaurant_id)
    AND status = 'new'::order_status
  );

CREATE POLICY "customer cancels own order" ON public.orders
  FOR UPDATE TO authenticated
  USING (public.owns_customer(customer_id) AND status IN ('new'::order_status, 'accepted'::order_status))
  WITH CHECK (public.owns_customer(customer_id) AND status = 'cancelled'::order_status);

CREATE POLICY "customer reads own order items" ON public.order_items
  FOR SELECT TO authenticated USING (public.owns_order(order_id));

CREATE POLICY "customer adds own order items" ON public.order_items
  FOR INSERT TO authenticated WITH CHECK (public.owns_order(order_id));

CREATE POLICY "customer reads own order item modifiers" ON public.order_item_modifiers
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.order_items oi WHERE oi.id = order_item_id AND public.owns_order(oi.order_id)));

CREATE POLICY "customer adds own order item modifiers" ON public.order_item_modifiers
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.order_items oi WHERE oi.id = order_item_id AND public.owns_order(oi.order_id)));

-- ---------- Realtime for order contents ----------
ALTER TABLE public.order_items REPLICA IDENTITY FULL;
ALTER TABLE public.order_item_modifiers REPLICA IDENTITY FULL;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.order_item_modifiers;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- Indexes for the diner + Hub read paths ----------
CREATE INDEX IF NOT EXISTS idx_customers_user ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_status ON public.orders(restaurant_id, status);
CREATE INDEX IF NOT EXISTS idx_items_restaurant_category ON public.menu_items(restaurant_id, category_id);
CREATE INDEX IF NOT EXISTS idx_branches_restaurant ON public.branches(restaurant_id);

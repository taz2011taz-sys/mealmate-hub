
CREATE OR REPLACE FUNCTION public.notify_order_events()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  diner uuid;
  label text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (restaurant_id, type, title, body)
    VALUES (NEW.restaurant_id, 'new_order', 'New order ' || NEW.order_number,
            COALESCE(NEW.customer_name, 'A customer') || ' placed an order.');
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'completed' AND NEW.completed_at IS NULL THEN
      NEW.completed_at := now();
    END IF;

    SELECT c.user_id INTO diner FROM public.customers c WHERE c.id = NEW.customer_id;
    IF diner IS NOT NULL THEN
      label := CASE NEW.status
        WHEN 'accepted' THEN 'Your order was accepted'
        WHEN 'rejected' THEN 'Your order was declined'
        WHEN 'preparing' THEN 'Your order is being prepared'
        WHEN 'ready' THEN 'Your order is ready'
        WHEN 'out_for_delivery' THEN 'Your order is on the way'
        WHEN 'completed' THEN 'Your order is complete'
        WHEN 'cancelled' THEN 'Your order was cancelled'
        ELSE 'Order updated' END;
      INSERT INTO public.notifications (user_id, restaurant_id, type, title, body)
      VALUES (diner, NEW.restaurant_id, 'order_status', label, 'Order ' || NEW.order_number);
    END IF;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS t_orders_notify_insert ON public.orders;
CREATE TRIGGER t_orders_notify_insert
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_order_events();

DROP TRIGGER IF EXISTS t_orders_notify_status ON public.orders;
CREATE TRIGGER t_orders_notify_status
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_order_events();

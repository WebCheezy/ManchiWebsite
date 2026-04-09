-- Add delivery_method to orders. Run this against your database.
-- Options: 'delivery' | 'pickup'. Default 'delivery' for existing rows.

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS delivery_method text NOT NULL DEFAULT 'delivery'
CHECK (delivery_method IN ('delivery', 'pickup'));

COMMENT ON COLUMN public.orders.delivery_method IS 'Order fulfillment: delivery or pickup';

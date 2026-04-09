-- Run on your database if not already present.
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS paystack_reference text;

CREATE INDEX IF NOT EXISTS orders_paystack_reference_idx ON public.orders (paystack_reference);

COMMENT ON COLUMN public.orders.paystack_reference IS 'Optional legacy: website uses metadata.order_id on Paystack verify instead';

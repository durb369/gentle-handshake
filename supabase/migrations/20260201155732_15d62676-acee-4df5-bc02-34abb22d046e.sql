-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create user subscriptions table to track boosted tier
CREATE TABLE public.user_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id text NOT NULL UNIQUE,
  stripe_customer_id text,
  stripe_subscription_id text,
  product_id text,
  is_active boolean NOT NULL DEFAULT false,
  subscription_end timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Anyone can view subscriptions
CREATE POLICY "Anyone can view subscriptions"
ON public.user_subscriptions
FOR SELECT
USING (true);

-- Anyone can insert subscriptions
CREATE POLICY "Anyone can insert subscriptions"
ON public.user_subscriptions
FOR INSERT
WITH CHECK (true);

-- Anyone can update subscriptions
CREATE POLICY "Anyone can update subscriptions"
ON public.user_subscriptions
FOR UPDATE
USING (true);

-- Create entity sketches table for the gallery
CREATE TABLE public.entity_sketches (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id text NOT NULL,
  scan_id uuid REFERENCES public.spirit_scans(id) ON DELETE CASCADE,
  finding_index integer NOT NULL,
  entity_type text NOT NULL,
  entity_description text,
  sketch_url text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.entity_sketches ENABLE ROW LEVEL SECURITY;

-- Anyone can view sketches
CREATE POLICY "Anyone can view sketches"
ON public.entity_sketches
FOR SELECT
USING (true);

-- Anyone can insert sketches
CREATE POLICY "Anyone can insert sketches"
ON public.entity_sketches
FOR INSERT
WITH CHECK (true);

-- Trigger for updated_at on user_subscriptions
CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for entity sketches
INSERT INTO storage.buckets (id, name, public) VALUES ('entity-sketches', 'entity-sketches', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for entity-sketches bucket
CREATE POLICY "Entity sketches are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'entity-sketches');

CREATE POLICY "Anyone can upload entity sketches"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'entity-sketches');
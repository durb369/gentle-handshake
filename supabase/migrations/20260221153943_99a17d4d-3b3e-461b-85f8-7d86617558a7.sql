
-- Block direct anon/public SELECT on entity_sketches
CREATE POLICY "Block direct public read on entity_sketches"
ON public.entity_sketches
FOR SELECT
USING (false);

-- Block direct anon/public SELECT on user_subscriptions  
CREATE POLICY "Block direct public read on user_subscriptions"
ON public.user_subscriptions
FOR SELECT
USING (false);

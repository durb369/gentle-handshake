
-- Block direct public read on device_rate_limits
CREATE POLICY "Block direct public read on device_rate_limits"
ON public.device_rate_limits
FOR SELECT
USING (false);

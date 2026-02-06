-- 1) Rate limiting table
CREATE TABLE IF NOT EXISTS public.device_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  action text NOT NULL,
  window_start timestamptz NOT NULL,
  count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (device_id, action, window_start)
);

ALTER TABLE public.device_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role may read/write rate limit counters
DROP POLICY IF EXISTS "Service role can read rate limits" ON public.device_rate_limits;
CREATE POLICY "Service role can read rate limits"
ON public.device_rate_limits
FOR SELECT
TO service_role
USING (true);

DROP POLICY IF EXISTS "Service role can write rate limits" ON public.device_rate_limits;
CREATE POLICY "Service role can write rate limits"
ON public.device_rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_device_rate_limits_device_action_window
ON public.device_rate_limits (device_id, action, window_start);

-- Atomic increment helper (used only from backend functions)
CREATE OR REPLACE FUNCTION public.rate_limit_allow(
  _device_id text,
  _action text,
  _window_seconds integer,
  _max_count integer
)
RETURNS TABLE(
  allowed boolean,
  remaining integer,
  reset_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _window_start timestamptz;
  _new_count integer;
BEGIN
  IF _device_id IS NULL OR length(_device_id) > 200 THEN
    RAISE EXCEPTION 'Invalid device_id';
  END IF;
  IF _action IS NULL OR length(_action) > 100 THEN
    RAISE EXCEPTION 'Invalid action';
  END IF;
  IF _window_seconds IS NULL OR _window_seconds < 1 OR _window_seconds > 86400 THEN
    RAISE EXCEPTION 'Invalid window';
  END IF;
  IF _max_count IS NULL OR _max_count < 1 OR _max_count > 10000 THEN
    RAISE EXCEPTION 'Invalid max_count';
  END IF;

  _window_start := to_timestamp(floor(extract(epoch from now()) / _window_seconds) * _window_seconds);

  INSERT INTO public.device_rate_limits(device_id, action, window_start, count)
  VALUES (_device_id, _action, _window_start, 1)
  ON CONFLICT (device_id, action, window_start)
  DO UPDATE SET count = public.device_rate_limits.count + 1
  RETURNING count INTO _new_count;

  allowed := _new_count <= _max_count;
  remaining := GREATEST(_max_count - _new_count, 0);
  reset_at := _window_start + make_interval(secs => _window_seconds);
  RETURN NEXT;
END;
$$;

-- 2) Add private storage path columns (keep old URL columns for backward compatibility)
ALTER TABLE public.spirit_scans
  ADD COLUMN IF NOT EXISTS image_path text;

ALTER TABLE public.entity_sketches
  ADD COLUMN IF NOT EXISTS sketch_path text;

-- Best-effort backfill from existing public URLs
UPDATE public.spirit_scans
SET image_path = COALESCE(image_path, substring(image_url from '/spirit-scans/(.*)$'))
WHERE image_path IS NULL AND image_url LIKE '%/spirit-scans/%';

UPDATE public.entity_sketches
SET sketch_path = COALESCE(sketch_path, substring(sketch_url from '/entity-sketches/(.*)$'))
WHERE sketch_path IS NULL AND sketch_url LIKE '%/entity-sketches/%';

-- 3) Tighten table RLS: remove anonymous SELECT
DO $$
BEGIN
  -- spirit_scans
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='spirit_scans' AND policyname='Anon can view scans') THEN
    EXECUTE 'DROP POLICY "Anon can view scans" ON public.spirit_scans';
  END IF;

  -- entity_findings
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='entity_findings' AND policyname='Anon can view findings') THEN
    EXECUTE 'DROP POLICY "Anon can view findings" ON public.entity_findings';
  END IF;

  -- entity_sketches
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='entity_sketches' AND policyname='Anon can view sketches') THEN
    EXECUTE 'DROP POLICY "Anon can view sketches" ON public.entity_sketches';
  END IF;

  -- user_subscriptions
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_subscriptions' AND policyname='Anon can view subscriptions') THEN
    EXECUTE 'DROP POLICY "Anon can view subscriptions" ON public.user_subscriptions';
  END IF;
END $$;

-- 4) Make buckets private + lock storage.objects down to service_role only
UPDATE storage.buckets
SET public = false
WHERE id IN ('spirit-scans', 'entity-sketches');

DO $$
BEGIN
  -- Drop common public policies if they exist
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Public read access for spirit scans') THEN
    EXECUTE 'DROP POLICY "Public read access for spirit scans" ON storage.objects';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Entity sketches are publicly accessible') THEN
    EXECUTE 'DROP POLICY "Entity sketches are publicly accessible" ON storage.objects';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Users can upload spirit scans') THEN
    EXECUTE 'DROP POLICY "Users can upload spirit scans" ON storage.objects';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Users can upload entity sketches') THEN
    EXECUTE 'DROP POLICY "Users can upload entity sketches" ON storage.objects';
  END IF;
END $$;

-- Create service-role-only policies for both buckets
DROP POLICY IF EXISTS "Service role can read spirit-scans" ON storage.objects;
CREATE POLICY "Service role can read spirit-scans"
ON storage.objects
FOR SELECT
TO service_role
USING (bucket_id = 'spirit-scans');

DROP POLICY IF EXISTS "Service role can write spirit-scans" ON storage.objects;
CREATE POLICY "Service role can write spirit-scans"
ON storage.objects
FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'spirit-scans');

DROP POLICY IF EXISTS "Service role can update spirit-scans" ON storage.objects;
CREATE POLICY "Service role can update spirit-scans"
ON storage.objects
FOR UPDATE
TO service_role
USING (bucket_id = 'spirit-scans');

DROP POLICY IF EXISTS "Service role can delete spirit-scans" ON storage.objects;
CREATE POLICY "Service role can delete spirit-scans"
ON storage.objects
FOR DELETE
TO service_role
USING (bucket_id = 'spirit-scans');

DROP POLICY IF EXISTS "Service role can read entity-sketches" ON storage.objects;
CREATE POLICY "Service role can read entity-sketches"
ON storage.objects
FOR SELECT
TO service_role
USING (bucket_id = 'entity-sketches');

DROP POLICY IF EXISTS "Service role can write entity-sketches" ON storage.objects;
CREATE POLICY "Service role can write entity-sketches"
ON storage.objects
FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'entity-sketches');

DROP POLICY IF EXISTS "Service role can update entity-sketches" ON storage.objects;
CREATE POLICY "Service role can update entity-sketches"
ON storage.objects
FOR UPDATE
TO service_role
USING (bucket_id = 'entity-sketches');

DROP POLICY IF EXISTS "Service role can delete entity-sketches" ON storage.objects;
CREATE POLICY "Service role can delete entity-sketches"
ON storage.objects
FOR DELETE
TO service_role
USING (bucket_id = 'entity-sketches');

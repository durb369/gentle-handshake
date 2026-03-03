
-- Table for spirit box scan sessions
CREATE TABLE public.spirit_box_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  word_count INTEGER NOT NULL DEFAULT 0,
  words JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.spirit_box_sessions ENABLE ROW LEVEL SECURITY;

-- Block direct public access
CREATE POLICY "Block direct public read on spirit_box_sessions"
ON public.spirit_box_sessions
FOR SELECT
TO anon, authenticated
USING (false);

-- Service role full access
CREATE POLICY "Service role can insert sessions"
ON public.spirit_box_sessions
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can view all sessions"
ON public.spirit_box_sessions
FOR SELECT
TO service_role
USING (true);

CREATE POLICY "Service role can delete sessions"
ON public.spirit_box_sessions
FOR DELETE
TO service_role
USING (true);

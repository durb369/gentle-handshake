-- Create storage bucket for spirit scan images
INSERT INTO storage.buckets (id, name, public)
VALUES ('spirit-scans', 'spirit-scans', true);

-- Allow public read access to spirit scan images
CREATE POLICY "Public read access for spirit scans"
ON storage.objects FOR SELECT
USING (bucket_id = 'spirit-scans');

-- Allow authenticated users to upload
CREATE POLICY "Users can upload spirit scans"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'spirit-scans');

-- Create spirit scans table
CREATE TABLE public.spirit_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  overall_energy TEXT,
  synthesis TEXT,
  interpretation TEXT,
  dominant_energy TEXT,
  spiritual_activity TEXT,
  dimensional_thinning TEXT,
  primary_message TEXT,
  protection_needed BOOLEAN DEFAULT false,
  protection_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create entity findings table
CREATE TABLE public.entity_findings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id UUID NOT NULL REFERENCES public.spirit_scans(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  description TEXT,
  location TEXT,
  intent TEXT,
  power_level TEXT,
  confidence TEXT,
  is_attached BOOLEAN DEFAULT false,
  message TEXT,
  -- Bounding box coordinates (percentage of image dimensions)
  x_percent NUMERIC,
  y_percent NUMERIC,
  width_percent NUMERIC,
  height_percent NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX idx_spirit_scans_device_id ON public.spirit_scans(device_id);
CREATE INDEX idx_spirit_scans_created_at ON public.spirit_scans(created_at DESC);
CREATE INDEX idx_entity_findings_scan_id ON public.entity_findings(scan_id);
CREATE INDEX idx_entity_findings_entity_type ON public.entity_findings(entity_type);

-- Enable RLS
ALTER TABLE public.spirit_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_findings ENABLE ROW LEVEL SECURITY;

-- RLS policies - allow all operations based on device_id (no auth required)
CREATE POLICY "Anyone can view scans"
ON public.spirit_scans FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert scans"
ON public.spirit_scans FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view findings"
ON public.entity_findings FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert findings"
ON public.entity_findings FOR INSERT
WITH CHECK (true);

-- Quotes table for approved quotes
CREATE TABLE public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  raw_text TEXT NOT NULL,
  formatted_quote JSONB NOT NULL DEFAULT '[]'::jsonb,
  speaker_count INTEGER NOT NULL DEFAULT 1,
  character_names_array TEXT[] NOT NULL DEFAULT '{}',
  content_tag TEXT NOT NULL DEFAULT 'Both',
  relationship_tag TEXT NOT NULL DEFAULT 'Both',
  date_added TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Suggestions table for pending submissions
CREATE TABLE public.suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  raw_text TEXT NOT NULL,
  parsed_speakers TEXT[] NOT NULL DEFAULT '{}',
  speaker_count INTEGER NOT NULL DEFAULT 1,
  content_tag TEXT,
  relationship_tag TEXT,
  date_submitted TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Public read access for quotes (anyone can view approved quotes)
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read quotes" ON public.quotes FOR SELECT USING (true);

-- Public insert access for suggestions (anyone can submit)
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit suggestions" ON public.suggestions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read suggestions" ON public.suggestions FOR SELECT USING (true);
CREATE POLICY "Anyone can delete suggestions" ON public.suggestions FOR DELETE USING (true);
CREATE POLICY "Anyone can update suggestions" ON public.suggestions FOR UPDATE USING (true);

-- Admin operations on quotes (public for now, admin password is client-side)
CREATE POLICY "Anyone can insert quotes" ON public.quotes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update quotes" ON public.quotes FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete quotes" ON public.quotes FOR DELETE USING (true);

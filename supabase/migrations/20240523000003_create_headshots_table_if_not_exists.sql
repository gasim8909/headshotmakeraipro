-- Create headshots table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS headshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  image_url TEXT NOT NULL,
  style TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE headshots ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own headshots" ON headshots;
CREATE POLICY "Users can view their own headshots"
ON headshots FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own headshots" ON headshots;
CREATE POLICY "Users can insert their own headshots"
ON headshots FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own headshots" ON headshots;
CREATE POLICY "Users can update their own headshots"
ON headshots FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own headshots" ON headshots;
CREATE POLICY "Users can delete their own headshots"
ON headshots FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for headshots table
alter publication supabase_realtime add table headshots;

-- Create headshots table to store user generated headshots
CREATE TABLE IF NOT EXISTS headshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  original_image_url TEXT,
  style TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- Enable realtime
alter publication supabase_realtime add table headshots;
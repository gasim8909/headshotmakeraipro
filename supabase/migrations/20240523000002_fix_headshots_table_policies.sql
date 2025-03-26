-- Fix the syntax in the DROP POLICY statements by adding the table name

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

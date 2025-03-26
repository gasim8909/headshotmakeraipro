-- Drop any existing policies on the users table
DROP POLICY IF EXISTS "Allow public insert" ON public.users;

-- Create a new policy that allows insertion with proper WITH CHECK clause
CREATE POLICY "Allow public insert"
  ON public.users
  FOR INSERT
  WITH CHECK (true);

-- Enable RLS on the users table if not already enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

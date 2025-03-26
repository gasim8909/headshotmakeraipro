-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."users";

-- Create a policy that allows insertion for all users (including during signup)
CREATE POLICY "Allow insert for all users"
ON "public"."users"
FOR INSERT
TO public
USING (true);

-- Ensure RLS is enabled on the users table
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

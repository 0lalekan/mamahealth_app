-- supabase/migrations/20250901180000_add_update_profile_policy.sql

-- First, ensure that RLS is enabled on the profiles table.
-- This is idempotent, so it's safe to run even if it's already enabled.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing update policy that might be incorrect.
-- Using "IF EXISTS" makes it safe to run even if the policy doesn't exist.
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create the new update policy.
-- This policy allows a user to update a row in the 'profiles' table
-- if the 'id' of that row matches their own authenticated user ID.
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Also, let's ensure users can view their own profile.
-- This might already be in place, but it's good to be explicit.
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- And let's ensure authenticated users can insert their own profile.
-- This is usually handled by a trigger, but an explicit policy is good practice.
DROP POLICY IF EXISTS "Authenticated users can insert their own profile" ON public.profiles;
CREATE POLICY "Authenticated users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

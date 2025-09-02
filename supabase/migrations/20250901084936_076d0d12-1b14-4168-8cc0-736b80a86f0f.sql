-- Fix RLS policy for profile creation during signup
-- Drop the existing insert policy that's causing issues
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create a new policy that allows profile creation after signup
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  auth.uid() = id OR 
  auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
);
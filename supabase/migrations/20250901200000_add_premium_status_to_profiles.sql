-- supabase/migrations/20250901200000_add_premium_status_to_profiles.sql

-- Add the 'is_premium' column to the 'profiles' table
-- This column will be used to track whether a user has a premium subscription.
-- It is a boolean type, cannot be null, and defaults to 'false' for all new users.
ALTER TABLE public.profiles
ADD COLUMN is_premium BOOLEAN NOT NULL DEFAULT FALSE;

-- Backfill existing users to have a default value.
-- This ensures that no existing rows have a null value for 'is_premium'.
UPDATE public.profiles
SET is_premium = FALSE
WHERE is_premium IS NULL;

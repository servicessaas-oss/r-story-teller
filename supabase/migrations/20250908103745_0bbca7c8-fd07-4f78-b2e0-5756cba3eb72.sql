-- Allow users to view basic profile information of other users for chat functionality
-- This replaces the restrictive policy that only allowed users to see their own profile

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create a new policy that allows users to view basic profile information of all users
-- This is necessary for chat functionality where users need to see who they can message
CREATE POLICY "Users can view basic profile information"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Keep the existing policies for INSERT and UPDATE (users can only modify their own profile)
-- These policies remain secure and unchanged
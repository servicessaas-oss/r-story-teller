import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  legal_entity_id?: string;
  created_at: string;
  updated_at: string;
}

export const useProfiles = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  // Get current user's profile
  const getCurrentUserProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setCurrentUserProfile(data);

    } catch (error) {
      console.error('Error fetching current user profile:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get all users for potential conversations (this would need updated RLS policies)
  const getAllUsers = async (): Promise<UserProfile[]> => {
    try {
      // Note: This will only work if RLS policies allow viewing other users
      // Currently, users can only see their own profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id || '');

      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  };

  useEffect(() => {
    if (user) {
      getCurrentUserProfile();
    }
  }, [user]);

  return {
    currentUserProfile,
    loading,
    getCurrentUserProfile,
    getAllUsers
  };
};
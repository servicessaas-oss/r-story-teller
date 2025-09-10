import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface UserEnvelope {
  id: string;
  acid_number: string;
  status: string;
  workflow_status: string;
  files: any[];
  legal_entity_id: string;
  current_stage: number;
  workflow_stages: any[];
  created_at: string;
  updated_at: string;
  total_amount?: number;
  procedure_id?: string;
}

export const useOptimizedUserEnvelopes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [envelopes, setEnvelopes] = useState<UserEnvelope[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  // Debounced fetch function to prevent excessive API calls
  const fetchEnvelopes = useCallback(async () => {
    if (!user) return;

    const now = Date.now();
    if (now - lastFetch < 1000) return; // Prevent calls within 1 second

    setLoading(true);
    setError(null);
    setLastFetch(now);

    try {
      const { data, error: fetchError } = await supabase
        .from('envelopes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      // Transform the data to match our interface
      const transformedData: UserEnvelope[] = (data || []).map(envelope => ({
        id: envelope.id,
        acid_number: envelope.acid_number,
        status: envelope.status,
        workflow_status: envelope.workflow_status,
        files: Array.isArray(envelope.files) ? envelope.files : [],
        legal_entity_id: envelope.legal_entity_id,
        current_stage: envelope.current_stage || 1,
        workflow_stages: Array.isArray(envelope.workflow_stages) ? envelope.workflow_stages : [],
        created_at: envelope.created_at,
        updated_at: envelope.updated_at,
        total_amount: envelope.total_amount,
        procedure_id: envelope.procedure_id
      }));
      
      setEnvelopes(transformedData);
    } catch (err) {
      console.error('Error fetching envelopes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch envelopes');
    } finally {
      setLoading(false);
    }
  }, [user, lastFetch]);

  // Memoized computed values to avoid recalculation on every render
  const { activeEnvelopes, completedEnvelopes } = useMemo(() => {
    const active = envelopes.filter(envelope => 
      envelope.workflow_status !== 'completed' && 
      envelope.workflow_status !== 'rejected' &&
      envelope.status !== 'draft'
    );

    const completed = envelopes.filter(envelope => 
      envelope.workflow_status === 'completed' || 
      envelope.status === 'approved'
    );

    return { activeEnvelopes: active, completedEnvelopes: completed };
  }, [envelopes]);

  // Set up real-time subscription for envelope updates
  useEffect(() => {
    if (!user) return;

    // Initial fetch
    fetchEnvelopes();

    // Set up subscription with debouncing
    let timeoutId: NodeJS.Timeout;
    
    const channel = supabase
      .channel(`user-envelopes-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'envelopes',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('📨 Envelope change detected:', payload.eventType);
          
          // Clear existing timeout
          if (timeoutId) clearTimeout(timeoutId);
          
          // Debounce the fetch to avoid multiple rapid calls
          timeoutId = setTimeout(() => {
            fetchEnvelopes();
          }, 500);
        }
      )
      .subscribe();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const getActiveWorkflows = useCallback(() => activeEnvelopes, [activeEnvelopes]);
  const getCompletedWorkflows = useCallback(() => completedEnvelopes, [completedEnvelopes]);

  return {
    envelopes,
    loading,
    error,
    fetchEnvelopes,
    getActiveWorkflows,
    getCompletedWorkflows
  };
};
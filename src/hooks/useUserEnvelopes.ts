import { useState, useEffect, useCallback } from "react";
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
  workflow_stages: any[];
  created_at: string;
  updated_at: string;
  total_amount?: number;
  procedure_id?: string;
}

export const useUserEnvelopes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [envelopes, setEnvelopes] = useState<UserEnvelope[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previousEnvelopes, setPreviousEnvelopes] = useState<UserEnvelope[]>([]);

  const fetchEnvelopes = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

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
        workflow_stages: Array.isArray(envelope.workflow_stages) ? envelope.workflow_stages : [],
        created_at: envelope.created_at,
        updated_at: envelope.updated_at,
        total_amount: envelope.total_amount,
        procedure_id: envelope.procedure_id
      }));
      
      // Check for status changes and show notifications
      if (previousEnvelopes.length > 0) {
        transformedData.forEach(envelope => {
          const previousEnvelope = previousEnvelopes.find(prev => prev.id === envelope.id);
          
          if (previousEnvelope && previousEnvelope.status !== envelope.status) {
            // Status changed - show notification
            const getProgressText = (stages: any[]) => {
              const completedStages = stages.filter(stage => stage.status === 'completed').length;
              return stages.length > 0 ? `${completedStages}/${stages.length}` : '0/0';
            };

            switch (envelope.status) {
              case 'approved':
                toast({
                  title: "Document Approved! ✅",
                  description: `ACID ${envelope.acid_number} has been signed and approved. Progress: ${getProgressText(envelope.workflow_stages)}`,
                  duration: 5000,
                });
                break;
              case 'rejected':
                toast({
                  title: "Document Rejected ❌",
                  description: `ACID ${envelope.acid_number} was rejected by the legal entity.`,
                  variant: "destructive",
                  duration: 5000,
                });
                break;
              case 'under_review':
                toast({
                  title: "Document Under Review 🔍",
                  description: `ACID ${envelope.acid_number} is now being reviewed by the legal entity.`,
                  duration: 3000,
                });
                break;
            }
          }

          // Check for workflow stage changes
          if (previousEnvelope && envelope.workflow_stages && previousEnvelope.workflow_stages) {
            const prevCompleted = previousEnvelope.workflow_stages.filter(s => s.status === 'completed').length;
            const newCompleted = envelope.workflow_stages.filter(s => s.status === 'completed').length;
            
            if (newCompleted > prevCompleted) {
              const completedStage = envelope.workflow_stages.find(s => 
                s.status === 'completed' && 
                !previousEnvelope.workflow_stages.some(ps => ps.stage_number === s.stage_number && ps.status === 'completed')
              );
              
              if (completedStage) {
                toast({
                  title: "Stage Complete! 🎉",
                  description: `${completedStage.legal_entity_name} completed their review. Progress: ${newCompleted}/${envelope.workflow_stages.length} stages done.`,
                  duration: 4000,
                });
              }
            }
          }
        });
      }

      setPreviousEnvelopes(transformedData);
      setEnvelopes(transformedData);
    } catch (err) {
      console.error('Error fetching envelopes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch envelopes');
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Set up real-time subscription for envelope updates
  useEffect(() => {
    if (!user) return;

    // Initial fetch
    fetchEnvelopes();

    const channel = supabase
      .channel('user-envelopes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'envelopes',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('📨 Envelope change detected:', payload);
          // Debounce the refetch to avoid multiple calls
          setTimeout(() => {
            fetchEnvelopes();
          }, 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchEnvelopes]);

  const getActiveWorkflows = () => {
    return envelopes.filter(envelope => 
      envelope.workflow_stages && 
      envelope.workflow_stages.length > 0 &&
      envelope.workflow_status !== 'completed' &&
      envelope.workflow_status !== 'rejected'
    );
  };

  const getCompletedWorkflows = () => {
    return envelopes.filter(envelope => 
      envelope.workflow_status === 'completed' ||
      envelope.workflow_status === 'rejected'
    );
  };

  return {
    envelopes,
    loading,
    error,
    fetchEnvelopes,
    getActiveWorkflows,
    getCompletedWorkflows
  };
};
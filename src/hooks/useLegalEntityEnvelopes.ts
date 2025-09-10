import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useLegalEntityEnvelopes = () => {
  const { user, profile } = useAuth();

  const getAssignedEnvelopes = async () => {
    console.log('🔍 getAssignedEnvelopes called with:', { user: user?.email, profile: profile?.role, legal_entity_id: profile?.legal_entity_id });
    
    if (!user || !profile || profile.role !== 'legal_entity') {
      console.error('❌ Not authorized:', { user: !!user, profile: !!profile, role: profile?.role });
      throw new Error("Not authorized to access legal entity envelopes");
    }

    // Get envelopes assigned to this legal entity through envelope_assignments
    const { data: assignments, error: assignmentsError } = await supabase
      .from('envelope_assignments')
      .select(`
        *,
        envelope:envelopes(
          id,
          acid_number,
          files,
          status,
          payment_status,
          created_at,
          total_amount,
          user_id,
          legal_entity_id,
          workflow_status
        )
      `)
      .eq('legal_entity_id', profile.legal_entity_id)
      .order('assigned_at', { ascending: false });

    if (assignmentsError) throw assignmentsError;
    
    // Get user details for sender information
    const userIds = assignments?.map(assignment => assignment.envelope?.user_id).filter(Boolean) || [];
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', userIds);

    if (usersError) throw usersError;
    
    // Transform data to match the component's expected format
    return assignments?.map(assignment => {
      const envelope = assignment.envelope;
      if (!envelope) return null;
      
      const sender = users?.find(user => user.id === envelope.user_id);
      const files = Array.isArray(envelope.files) ? envelope.files : [];
      
      return {
        id: envelope.id,
        acid_number: envelope.acid_number,
        files: envelope.files,
        status: envelope.status,
        payment_status: envelope.payment_status,
        workflow_status: envelope.workflow_status,
        created_at: envelope.created_at,
        assignment_id: assignment.id,
        assignment_status: assignment.status,
        assigned_at: assignment.assigned_at,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        sender_name: sender?.full_name || sender?.email || 'Unknown Sender',
        priority: (envelope.total_amount || 0) > 10000 ? 'high' as const : (envelope.total_amount || 0) > 5000 ? 'medium' as const : 'low' as const,
        document_types: files.map((file: any) => file.type).filter(Boolean) || []
      };
    }).filter(Boolean) || [];
  };

  const updateEnvelopeVerification = async (envelopeId: string, status: string, notes?: string) => {
    const { data, error } = await supabase
      .from('envelopes')
      .update({ 
        status,
        workflow_status: status === 'approved' ? 'completed' : status === 'rejected' ? 'rejected' : 'in_progress',
        signed_at: status === 'approved' ? new Date().toISOString() : null,
        signed_by_legal_entity_id: status === 'approved' ? profile?.legal_entity_id : null
      })
      .eq('id', envelopeId)
      .select()
      .single();

    if (error) throw error;
    
    // Also update the assignment status - this will be handled by the trigger but we can do it explicitly too
    const { error: assignmentError } = await supabase
      .from('envelope_assignments')
      .update({
        status: status === 'approved' ? 'completed' : status === 'rejected' ? 'rejected' : 'in_review',
        processed_at: new Date().toISOString(),
        notes: notes
      })
      .eq('envelope_id', envelopeId)
      .eq('legal_entity_id', profile?.legal_entity_id);

    if (assignmentError) {
      console.warn('Could not update assignment status:', assignmentError);
    }

    return data;
  };

  const getWorkloadStats = async () => {
    if (!user || !profile || profile.role !== 'legal_entity') {
      throw new Error("Not authorized to access legal entity stats");
    }

    const { data, error } = await supabase
      .rpc('get_legal_entity_workload', { entity_id: profile.legal_entity_id });

    if (error) throw error;
    return data?.[0] || { total_pending: 0, total_in_review: 0, total_completed: 0, total_overdue: 0 };
  };

  return {
    getAssignedEnvelopes,
    updateEnvelopeVerification,
    getWorkloadStats
  };
};
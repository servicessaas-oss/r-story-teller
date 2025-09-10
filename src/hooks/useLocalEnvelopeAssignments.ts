import { useCallback, useState } from 'react';
import { useLocalAuth } from '@/contexts/LocalAuthContext';
import { localDb, type LocalEnvelopeAssignment } from '@/lib/localDb';
import { useToast } from '@/hooks/use-toast';

export const useLocalEnvelopeAssignments = () => {
  const { user, profile } = useLocalAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const getLegalEntityAssignments = useCallback(async () => {
    if (!user || !profile?.legal_entity_id) {
      throw new Error("User not authenticated or not a legal entity");
    }

    setLoading(true);
    try {
      const assignments = await localDb.envelope_assignments.select({ 
        legal_entity_id: profile.legal_entity_id 
      });
      
      // Get related envelopes
      const enrichedAssignments = [];
      for (const assignment of assignments) {
        const envelope = await localDb.envelopes.selectSingle({ id: assignment.envelope_id });
        if (envelope) {
          enrichedAssignments.push({
            ...assignment,
            envelope
          });
        }
      }

      return enrichedAssignments.sort((a, b) => 
        new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime()
      );
    } catch (error) {
      console.error('Error fetching assignments:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  const getUserAssignments = useCallback(async () => {
    if (!user) throw new Error("User not authenticated");

    setLoading(true);
    try {
      // Get envelopes created by user
      const userEnvelopes = await localDb.envelopes.select({ user_id: user.id });
      
      // Get all assignments for these envelopes
      const allAssignments = [];
      for (const envelope of userEnvelopes) {
        const assignments = await localDb.envelope_assignments.select({ envelope_id: envelope.id });
        for (const assignment of assignments) {
          allAssignments.push({
            ...assignment,
            envelope
          });
        }
      }

      return allAssignments.sort((a, b) => 
        new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime()
      );
    } catch (error) {
      console.error('Error fetching user assignments:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateAssignmentStatus = useCallback(async (
    assignmentId: string,
    status: string,
    notes?: string
  ) => {
    setLoading(true);
    try {
      const updatedAssignment = await localDb.envelope_assignments.update(assignmentId, {
        status,
        notes,
        processed_at: new Date().toISOString(),
        processed_by: user?.id
      });

      if (!updatedAssignment) {
        throw new Error("Assignment not found");
      }

      // Update related envelope status if needed
      if (status === 'completed') {
        await localDb.envelopes.update(updatedAssignment.envelope_id, {
          status: 'approved',
          signed_by_legal_entity_id: profile?.legal_entity_id,
          signed_at: new Date().toISOString()
        });
      } else if (status === 'rejected') {
        await localDb.envelopes.update(updatedAssignment.envelope_id, {
          status: 'rejected'
        });
      }

      toast({
        title: "Assignment Updated",
        description: `Assignment ${status} successfully`,
      });

      return updatedAssignment;
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to update assignment",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, profile, toast]);

  const approveAssignment = useCallback(async (assignmentId: string, notes?: string) => {
    return updateAssignmentStatus(assignmentId, 'completed', notes);
  }, [updateAssignmentStatus]);

  const rejectAssignment = useCallback(async (assignmentId: string, notes: string) => {
    return updateAssignmentStatus(assignmentId, 'rejected', notes);
  }, [updateAssignmentStatus]);

  const createAssignment = useCallback(async (
    envelopeId: string,
    legalEntityId: string
  ) => {
    if (!user) throw new Error("User not authenticated");

    setLoading(true);
    try {
      const assignment = await localDb.envelope_assignments.insert({
        envelope_id: envelopeId,
        legal_entity_id: legalEntityId,
        assigned_by: user.id,
        assigned_at: new Date().toISOString(),
        status: 'pending'
      });

      toast({
        title: "Assignment Created",
        description: "Envelope assigned to legal entity",
      });

      return assignment;
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to create assignment",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const getAssignmentWorkload = useCallback(async (legalEntityId: string) => {
    try {
      const assignments = await localDb.envelope_assignments.select({ legal_entity_id: legalEntityId });
      
      const workload = {
        total_pending: assignments.filter(a => a.status === 'pending').length,
        total_in_review: assignments.filter(a => a.status === 'in_review').length,
        total_completed: assignments.filter(a => a.status === 'completed').length,
        total_overdue: assignments.filter(a => 
          a.status === 'pending' && 
          new Date(a.assigned_at).getTime() < Date.now() - 24 * 60 * 60 * 1000
        ).length
      };

      return workload;
    } catch (error) {
      console.error('Error getting workload:', error);
      return {
        total_pending: 0,
        total_in_review: 0,
        total_completed: 0,
        total_overdue: 0
      };
    }
  }, []);

  return {
    getLegalEntityAssignments,
    getUserAssignments,
    updateAssignmentStatus,
    approveAssignment,
    rejectAssignment,
    createAssignment,
    getAssignmentWorkload,
    loading
  };
};
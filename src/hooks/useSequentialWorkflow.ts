import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { type RequiredDocument, mapLegalEntityIdToUUID } from "@/data/procedureData";

export interface WorkflowStage {
  stage_number: number;
  document_id: string;
  legal_entity_id: string;
  legal_entity_name: string;
  status: 'pending' | 'in_progress' | 'payment_required' | 'payment_completed' | 'completed' | 'rejected' | 'blocked';
  assigned_at?: string;
  completed_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  is_current: boolean;
  can_start: boolean; // Based on previous stage completion
  payment_required: boolean;
  payment_amount?: number; // In cents
  payment_status?: 'pending' | 'completed' | 'failed';
  payment_completed_at?: string;
}

export interface SequentialWorkflowData {
  envelope_id: string;
  acid_number: string;
  current_stage: number;
  total_stages: number;
  workflow_status: string;
  stages: WorkflowStage[];
  can_proceed: boolean;
}

export const useSequentialWorkflow = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Create sequential workflow from required documents
  const createSequentialWorkflow = useCallback((
    requiredDocuments: RequiredDocument[], 
    envelopeId: string,
    acidNumber: string
  ): SequentialWorkflowData => {
    // Sort documents by legal entity dependencies (this could be enhanced with explicit ordering)
    const sortedDocs = [...requiredDocuments].sort((a, b) => {
      // Customs Authority usually comes last
      if (a.legalEntityName.includes('Customs')) return 1;
      if (b.legalEntityName.includes('Customs')) return -1;
      // Central Bank usually comes early for FX allocations
      if (a.legalEntityName.includes('Central Bank')) return -1;
      if (b.legalEntityName.includes('Central Bank')) return 1;
      return 0;
    });

    const stages: WorkflowStage[] = sortedDocs.map((doc, index) => ({
      stage_number: index + 1,
      document_id: doc.id,
      legal_entity_id: mapLegalEntityIdToUUID(doc.legalEntityId),
      legal_entity_name: doc.legalEntityName,
      status: index === 0 ? (doc.fee && doc.fee > 0 ? 'payment_required' : 'pending') : 'blocked',
      is_current: index === 0,
      can_start: index === 0,
      payment_required: doc.fee ? doc.fee > 0 : false,
      payment_amount: doc.fee || 0,
      payment_status: doc.fee && doc.fee > 0 ? 'pending' : undefined
    }));

    return {
      envelope_id: envelopeId,
      acid_number: acidNumber,
      current_stage: 1,
      total_stages: stages.length,
      workflow_status: 'draft',
      stages,
      can_proceed: false
    };
  }, []);

  // Start the workflow by sending to first legal entity
  const startWorkflow = useCallback(async (workflowData: SequentialWorkflowData) => {
    if (!user) throw new Error("User not authenticated");
    
    setLoading(true);
    try {
      const firstStage = workflowData.stages[0];
      if (!firstStage) throw new Error("No stages defined");

      // Update envelope with workflow stages and send to first legal entity
      const { data, error } = await supabase
        .from('envelopes')
        .update({
          workflow_stages: workflowData.stages as any,
          current_stage: 1,
          legal_entity_id: firstStage.legal_entity_id,
          workflow_status: 'in_progress',
          status: 'sent'
        })
        .eq('id', workflowData.envelope_id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Workflow Started",
        description: `Envelope sent to ${firstStage.legal_entity_name} for processing`,
      });

      return data;
    } catch (error) {
      console.error('Error starting workflow:', error);
      toast({
        title: "Error",
        description: "Failed to start workflow",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Process payment for current stage
  const processStagePayment = useCallback(async (
    envelopeId: string,
    stageNumber: number,
    paymentData: any
  ) => {
    setLoading(true);
    try {
      const { data: envelope, error: fetchError } = await supabase
        .from('envelopes')
        .select('*')
        .eq('id', envelopeId)
        .single();

      if (fetchError) throw fetchError;

      const currentStages = envelope.workflow_stages as any as WorkflowStage[];
      if (!currentStages) throw new Error("No workflow stages found");

      // Update current stage payment status
      const updatedStages = currentStages.map(stage => {
        if (stage.stage_number === stageNumber) {
          return {
            ...stage,
            status: 'payment_completed' as const,
            payment_status: 'completed' as const,
            payment_completed_at: new Date().toISOString()
          };
        }
        return stage;
      });

      const { data, error } = await supabase
        .from('envelopes')
        .update({
          workflow_stages: updatedStages as any
        })
        .eq('id', envelopeId)
        .select()
        .single();

      if (error) throw error;

      const currentStageName = currentStages.find(s => s.stage_number === stageNumber)?.legal_entity_name;
      toast({
        title: "Payment Completed",
        description: `Payment for ${currentStageName} completed. Document can now be processed.`,
      });

      return data;
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Error",
        description: "Failed to process payment",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Complete current stage and move to next
  const completeCurrentStage = useCallback(async (
    envelopeId: string, 
    stageNumber: number, 
    completedBy: string,
    notes?: string
  ) => {
    setLoading(true);
    try {
      // Get current envelope data
      const { data: envelope, error: fetchError } = await supabase
        .from('envelopes')
        .select('*')
        .eq('id', envelopeId)
        .single();

      if (fetchError) throw fetchError;

      const currentStages = envelope.workflow_stages as any as WorkflowStage[];
      if (!currentStages) throw new Error("No workflow stages found");

      // Update current stage to completed
      const updatedStages = currentStages.map(stage => {
        if (stage.stage_number === stageNumber) {
          return {
            ...stage,
            status: 'completed' as const,
            completed_at: new Date().toISOString(),
            is_current: false
          };
        }
        return stage;
      });

      // Check if there's a next stage
      const nextStage = updatedStages.find(stage => stage.stage_number === stageNumber + 1);
      let envelopeUpdates: any = {
        workflow_stages: updatedStages,
        current_stage: stageNumber + 1
      };

      if (nextStage) {
        // Enable next stage - check if payment is required
        updatedStages.forEach(stage => {
          if (stage.stage_number === stageNumber + 1) {
            stage.status = stage.payment_required ? 'payment_required' : 'pending';
            stage.can_start = true;
            stage.is_current = true;
            stage.assigned_at = new Date().toISOString();
          }
        });

        envelopeUpdates = {
          ...envelopeUpdates,
          workflow_stages: updatedStages as any,
          current_stage: stageNumber + 1,
          legal_entity_id: nextStage.legal_entity_id,
          status: 'pending_review'
        };
      } else {
        // Workflow completed
        envelopeUpdates = {
          ...envelopeUpdates,
          workflow_stages: updatedStages as any,
          workflow_status: 'completed',
          status: 'approved'
        };
      }

      const { data, error } = await supabase
        .from('envelopes')
        .update(envelopeUpdates)
        .eq('id', envelopeId)
        .select()
        .single();

      if (error) throw error;

      const currentStageName = currentStages.find(s => s.stage_number === stageNumber)?.legal_entity_name;
      const nextStageName = nextStage?.legal_entity_name;

      toast({
        title: "Stage Completed",
        description: nextStageName 
          ? `${currentStageName} completed. Now sending to ${nextStageName}`
          : `All stages completed! Workflow finished.`,
      });

      return data;
    } catch (error) {
      console.error('Error completing stage:', error);
      toast({
        title: "Error",
        description: "Failed to complete current stage",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Reject current stage and block workflow
  const rejectCurrentStage = useCallback(async (
    envelopeId: string, 
    stageNumber: number, 
    rejectionReason: string,
    rejectedBy: string
  ) => {
    setLoading(true);
    try {
      const { data: envelope, error: fetchError } = await supabase
        .from('envelopes')
        .select('workflow_stages')
        .eq('id', envelopeId)
        .single();

      if (fetchError) throw fetchError;

      const currentStages = envelope.workflow_stages as any as WorkflowStage[];
      const updatedStages = currentStages.map(stage => {
        if (stage.stage_number === stageNumber) {
          return {
            ...stage,
            status: 'rejected' as const,
            rejected_at: new Date().toISOString(),
            rejection_reason: rejectionReason,
            is_current: false
          };
        }
        // Block all subsequent stages
        if (stage.stage_number > stageNumber) {
          return {
            ...stage,
            status: 'blocked' as const,
            can_start: false
          };
        }
        return stage;
      });

      const { data, error } = await supabase
        .from('envelopes')
        .update({
          workflow_stages: updatedStages as any,
          workflow_status: 'rejected',
          status: 'rejected'
        })
        .eq('id', envelopeId)
        .select()
        .single();

      if (error) throw error;

      const stageName = currentStages.find(s => s.stage_number === stageNumber)?.legal_entity_name;
      toast({
        title: "Stage Rejected",
        description: `${stageName} rejected the documents. Workflow stopped.`,
        variant: "destructive",
      });

      return data;
    } catch (error) {
      console.error('Error rejecting stage:', error);
      toast({
        title: "Error",
        description: "Failed to reject current stage",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Get workflow status for an envelope
  const getWorkflowStatus = useCallback(async (envelopeId: string): Promise<SequentialWorkflowData | null> => {
    try {
      const { data: envelope, error } = await supabase
        .from('envelopes')
        .select('*')
        .eq('id', envelopeId)
        .single();

      if (error) throw error;

      const stages = (envelope.workflow_stages as any as WorkflowStage[]) || [];
      
      return {
        envelope_id: envelopeId,
        acid_number: envelope.acid_number,
        current_stage: envelope.current_stage || 1,
        total_stages: stages.length,
        workflow_status: envelope.workflow_status as string || 'not_started',
        stages,
        can_proceed: stages.some(stage => stage.is_current && stage.can_start)
      };
    } catch (error) {
      console.error('Error getting workflow status:', error);
      return null;
    }
  }, []);

  return {
    createSequentialWorkflow,
    startWorkflow,
    processStagePayment,
    completeCurrentStage,
    rejectCurrentStage,
    getWorkflowStatus,
    loading
  };
};
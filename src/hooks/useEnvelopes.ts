import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCallback } from "react";

export interface EnvelopeData {
  acid_number: string;
  files: any[];
  legal_entity_id: string;
  procedure_id?: string;
  payment_method?: string;
  total_amount?: number;
  workflow_stages?: any[];
  current_stage?: number;
}

export const useEnvelopes = () => {
  const { user } = useAuth();

  const createEnvelope = useCallback(async (envelopeData: EnvelopeData) => {
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('envelopes')
      .insert({
        user_id: user.id,
        acid_number: envelopeData.acid_number,
        files: envelopeData.files,
        legal_entity_id: envelopeData.legal_entity_id,
        procedure_id: envelopeData.procedure_id,
        payment_method: envelopeData.payment_method,
        total_amount: envelopeData.total_amount,
        workflow_stages: envelopeData.workflow_stages || [],
        current_stage: envelopeData.current_stage || 1,
        status: 'pending',
        payment_status: 'pending',
        workflow_status: 'in_progress',
        is_draft: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }, [user]);

  const getUserEnvelopes = useCallback(async () => {
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('envelopes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }, [user]);

  const updateEnvelopeStatus = useCallback(async (envelopeId: string, status: string, updates: any = {}) => {
    const { data, error } = await supabase
      .from('envelopes')
      .update({ status, ...updates })
      .eq('id', envelopeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }, []);

  const sendEnvelope = useCallback(async (envelopeId: string, additionalUpdates: any = {}) => {
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('envelopes')
      .update({
        status: 'sent',
        is_draft: false,
        workflow_status: 'in_progress',
        ...additionalUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', envelopeId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }, [user]);

  return {
    createEnvelope,
    getUserEnvelopes,
    updateEnvelopeStatus,
    sendEnvelope
  };
};
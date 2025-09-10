import { useCallback } from "react";
import { useLocalAuth } from "@/contexts/LocalAuthContext";
import { localDb, type LocalEnvelope } from "@/lib/localDb";

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

export const useLocalEnvelopes = () => {
  const { user } = useLocalAuth();

  const createEnvelope = useCallback(async (envelopeData: EnvelopeData) => {
    if (!user) throw new Error("User not authenticated");

    const envelope = await localDb.envelopes.insert({
      user_id: user.id,
      acid_number: envelopeData.acid_number,
      files: envelopeData.files,
      legal_entity_id: envelopeData.legal_entity_id,
      procedure_id: envelopeData.procedure_id,
      payment_method: envelopeData.payment_method,
      total_amount: envelopeData.total_amount || 0,
      workflow_stages: envelopeData.workflow_stages || [],
      workflow_history: [],
      current_stage: envelopeData.current_stage || 1,
      status: 'pending',
      payment_status: 'pending',
      workflow_status: 'in_progress',
      is_draft: false
    });

    return envelope;
  }, [user]);

  const getUserEnvelopes = useCallback(async () => {
    if (!user) throw new Error("User not authenticated");

    const envelopes = await localDb.envelopes.select({ user_id: user.id });
    return envelopes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [user]);

  const updateEnvelopeStatus = useCallback(async (envelopeId: string, status: string, updates: any = {}) => {
    const envelope = await localDb.envelopes.update(envelopeId, { status, ...updates });
    if (!envelope) throw new Error("Envelope not found");
    return envelope;
  }, []);

  const sendEnvelope = useCallback(async (envelopeId: string, additionalUpdates: any = {}) => {
    if (!user) throw new Error("User not authenticated");

    const envelope = await localDb.envelopes.update(envelopeId, {
      status: 'sent',
      is_draft: false,
      workflow_status: 'in_progress',
      ...additionalUpdates,
    });

    if (!envelope) throw new Error("Envelope not found");
    return envelope;
  }, [user]);

  return {
    createEnvelope,
    getUserEnvelopes,
    updateEnvelopeStatus,
    sendEnvelope
  };
};
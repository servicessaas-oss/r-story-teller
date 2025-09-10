import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EnvelopeAssignment {
  id: string;
  envelope_id: string;
  legal_entity_id: string;
  assigned_at: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'completed';
  assigned_by: string;
  notes?: string;
  processed_at?: string;
  processed_by?: string;
  // Relations
  envelope?: {
    id: string;
    acid_number: string;
    status: string;
    files: any[];
    user_id: string;
  };
  legal_entity?: {
    id: string;
    name: string;
    entity_type: string;
  };
  assignedByUser?: {
    id: string;
    full_name?: string;
    email: string;
  };
}

export interface LegalEntityInteraction {
  id: string;
  envelope_assignment_id: string;
  interaction_type: 'received' | 'reviewed' | 'approved' | 'rejected' | 'requested_info';
  message?: string;
  attachments: any[];
  created_at: string;
  created_by: string;
  // Relations
  createdByUser?: {
    id: string;
    full_name?: string;
    email: string;
  };
}

// Hook pour récupérer les assignations pour les utilisateurs
export function useUserEnvelopeAssignments(userId?: string) {
  return useQuery({
    queryKey: ['envelope-assignments', 'user', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('envelope_assignments')
        .select(`
          *,
          envelope:envelopes(id, acid_number, status, files, user_id),
          legal_entity:legal_entities(id, name, entity_type)
        `)
        .eq('envelope.user_id', userId)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!userId
  });
}

// Hook pour récupérer les assignations pour les entités légales
export function useLegalEntityAssignments(legalEntityId?: string) {
  return useQuery({
    queryKey: ['envelope-assignments', 'legal-entity', legalEntityId],
    queryFn: async () => {
      if (!legalEntityId) return [];

      const { data, error } = await supabase
        .from('envelope_assignments')
        .select(`
          *,
          envelope:envelopes(id, acid_number, status, files, user_id),
          legal_entity:legal_entities(id, name, entity_type)
        `)
        .eq('legal_entity_id', legalEntityId)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!legalEntityId
  });
}

// Hook pour créer une assignation d'enveloppe
export function useCreateEnvelopeAssignment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      envelope_id: string;
      legal_entity_id: string;
      notes?: string;
    }) => {
      const { data: result, error } = await supabase
        .from('envelope_assignments')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['envelope-assignments'] });
      toast({
        title: "Assignation créée",
        description: "L'enveloppe a été assignée à l'entité légale",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'assignation",
        variant: "destructive"
      });
    }
  });
}

// Hook pour mettre à jour le statut d'une assignation
export function useUpdateAssignmentStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      assignmentId: string;
      status: EnvelopeAssignment['status'];
      notes?: string;
    }) => {
      const { data: result, error } = await supabase
        .from('envelope_assignments')
        .update({
          status: data.status,
          notes: data.notes,
          processed_at: new Date().toISOString(),
        })
        .eq('id', data.assignmentId)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['envelope-assignments'] });
      toast({
        title: "Statut mis à jour",
        description: `L'assignation est maintenant : ${variables.status}`,
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
    }
  });
}

// Hook pour récupérer les interactions d'une assignation
export function useAssignmentInteractions(assignmentId?: string) {
  return useQuery({
    queryKey: ['assignment-interactions', assignmentId],
    queryFn: async () => {
      if (!assignmentId) return [];

      const { data, error } = await supabase
        .from('legal_entity_interactions')
        .select(`
          *
        `)
        .eq('envelope_assignment_id', assignmentId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!assignmentId
  });
}

// Hook pour créer une interaction
export function useCreateInteraction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      envelope_assignment_id: string;
      interaction_type: LegalEntityInteraction['interaction_type'];
      message?: string;
      attachments?: any[];
    }) => {
      // Obtenir l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: result, error } = await supabase
        .from('legal_entity_interactions')
        .insert({
          envelope_assignment_id: data.envelope_assignment_id,
          interaction_type: data.interaction_type,
          message: data.message,
          attachments: data.attachments || [],
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['assignment-interactions', variables.envelope_assignment_id] 
      });
      toast({
        title: "Interaction créée",
        description: "Votre message a été envoyé",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
    }
  });
}
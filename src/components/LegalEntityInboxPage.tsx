import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  MessageSquare,
  Eye,
  Download,
  Send
} from "lucide-react";
import { useLegalEntityAssignments, useUpdateAssignmentStatus, useCreateInteraction, useAssignmentInteractions } from "@/hooks/useEnvelopeAssignments";
import { useAuth } from "@/contexts/AuthContext";

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'in_review':
      return <AlertCircle className="h-4 w-4 text-blue-500" />;
    case 'approved':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'pending':
      return 'secondary' as const;
    case 'in_review':
      return 'default' as const;
    case 'approved':
      return 'default' as const;
    case 'rejected':
      return 'destructive' as const;
    case 'completed':
      return 'default' as const;
    default:
      return 'outline' as const;
  }
};

interface AssignmentDetailsProps {
  assignmentId: string;
  onClose: () => void;
}

function AssignmentDetails({ assignmentId, onClose }: AssignmentDetailsProps) {
  const [message, setMessage] = useState("");
  const [interactionType, setInteractionType] = useState<'reviewed' | 'approved' | 'rejected' | 'requested_info'>('reviewed');
  
  const { data: interactions, isLoading: interactionsLoading } = useAssignmentInteractions(assignmentId);
  const updateStatusMutation = useUpdateAssignmentStatus();
  const createInteractionMutation = useCreateInteraction();

  const handleSendInteraction = async () => {
    if (!message.trim()) return;

    try {
      await createInteractionMutation.mutateAsync({
        envelope_assignment_id: assignmentId,
        interaction_type: interactionType,
        message: message.trim()
      });

      // Mettre à jour le statut de l'assignation selon le type d'interaction
      const statusMap = {
        'reviewed': 'in_review',
        'approved': 'approved',
        'rejected': 'rejected',
        'requested_info': 'in_review'
      } as const;

      await updateStatusMutation.mutateAsync({
        assignmentId,
        status: statusMap[interactionType]
      });

      setMessage("");
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'interaction:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Historique des interactions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Historique des interactions</h3>
        
        {interactionsLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : interactions && interactions.length > 0 ? (
          <div className="space-y-3">
            {interactions.map((interaction) => (
              <Card key={interaction.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {interaction.interaction_type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(interaction.created_at).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      {interaction.message && (
                        <p className="text-sm">{interaction.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Par: {interaction.created_by}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            Aucune interaction pour le moment
          </p>
        )}
      </div>

      {/* Nouvelle interaction */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Nouvelle interaction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={interactionType === 'reviewed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setInteractionType('reviewed')}
            >
              Examiner
            </Button>
            <Button
              variant={interactionType === 'approved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setInteractionType('approved')}
              className="text-green-700 border-green-200 hover:bg-green-50"
            >
              Approuver
            </Button>
            <Button
              variant={interactionType === 'rejected' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setInteractionType('rejected')}
              className="text-red-700 border-red-200 hover:bg-red-50"
            >
              Rejeter
            </Button>
            <Button
              variant={interactionType === 'requested_info' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setInteractionType('requested_info')}
            >
              Demander des infos
            </Button>
          </div>
          
          <Textarea
            placeholder="Votre message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
          
          <Button 
            onClick={handleSendInteraction}
            disabled={!message.trim() || createInteractionMutation.isPending}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {createInteractionMutation.isPending ? 'Envoi...' : 'Envoyer la réponse'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

interface LegalEntityInboxPageProps {
  legalEntityId: string;
}

export function LegalEntityInboxPage({ legalEntityId }: LegalEntityInboxPageProps) {
  const [selectedTab, setSelectedTab] = useState('pending');
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  
  const { data: assignments, isLoading } = useLegalEntityAssignments(legalEntityId);

  const filteredAssignments = assignments?.filter(assignment => {
    switch (selectedTab) {
      case 'pending':
        return assignment.status === 'pending';
      case 'in_review':
        return assignment.status === 'in_review';
      case 'completed':
        return ['approved', 'completed'].includes(assignment.status);
      case 'rejected':
        return assignment.status === 'rejected';
      default:
        return true;
    }
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Enveloppes assignées</h2>
        <Badge variant="secondary">
          {assignments?.length || 0} enveloppe(s) au total
        </Badge>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="pending">
            En attente ({assignments?.filter(a => a.status === 'pending').length || 0})
          </TabsTrigger>
          <TabsTrigger value="in_review">
            En cours ({assignments?.filter(a => a.status === 'in_review').length || 0})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Terminées ({assignments?.filter(a => ['approved', 'completed'].includes(a.status)).length || 0})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejetées ({assignments?.filter(a => a.status === 'rejected').length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {filteredAssignments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Aucune enveloppe</h3>
                <p className="text-muted-foreground">
                  Aucune enveloppe dans cette catégorie pour le moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredAssignments.map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">
                            ACID: {assignment.envelope?.acid_number}
                          </h4>
                          <Badge variant={getStatusBadgeVariant(assignment.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(assignment.status)}
                              {assignment.status}
                            </div>
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          <p>Assigné le: {new Date(assignment.assigned_at).toLocaleDateString('fr-FR')}</p>
                          <p>Par: {assignment.assigned_by}</p>
                          {assignment.envelope?.files && (
                            <p>{assignment.envelope.files.length} document(s) attaché(s)</p>
                          )}
                        </div>

                        {assignment.notes && (
                          <p className="text-sm bg-muted/50 p-2 rounded">
                            <strong>Notes:</strong> {assignment.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Dialog 
                          open={selectedAssignment === assignment.id}
                          onOpenChange={(open) => setSelectedAssignment(open ? assignment.id : null)}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Détails
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                            <DialogHeader>
                              <DialogTitle>
                                Enveloppe {assignment.envelope?.acid_number}
                              </DialogTitle>
                            </DialogHeader>
                            <AssignmentDetails 
                              assignmentId={assignment.id}
                              onClose={() => setSelectedAssignment(null)}
                            />
                          </DialogContent>
                        </Dialog>

                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  FileText,
  MessageSquare,
  Eye
} from "lucide-react";
import { useUserEnvelopeAssignments, useAssignmentInteractions } from "@/hooks/useEnvelopeAssignments";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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

interface AssignmentProgressProps {
  assignmentId: string;
}

function AssignmentProgress({ assignmentId }: AssignmentProgressProps) {
  const { data: interactions, isLoading } = useAssignmentInteractions(assignmentId);

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Progression de l'assignation</h3>
      
      {interactions && interactions.length > 0 ? (
        <div className="space-y-3">
          {interactions.map((interaction, index) => (
            <div key={interaction.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                {getStatusIcon(interaction.interaction_type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {interaction.interaction_type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
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
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          Aucune interaction pour le moment. L'entité légale n'a pas encore traité cette assignation.
        </p>
      )}
    </div>
  );
}

interface UserEnvelopeTrackerProps {
  userId: string;
}

export function UserEnvelopeTracker({ userId }: UserEnvelopeTrackerProps) {
  const { data: assignments, isLoading } = useUserEnvelopeAssignments(userId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!assignments || assignments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Aucune assignation</h3>
          <p className="text-muted-foreground">
            Vos enveloppes n'ont pas encore été assignées aux entités légales.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Suivi des enveloppes</h2>
      
      <div className="grid gap-4">
        {assignments.map((assignment) => (
          <Card key={assignment.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">
                      ACID: {assignment.envelope?.acid_number}
                    </h4>
                    <Badge variant="outline">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(assignment.status)}
                        {assignment.status}
                      </div>
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p><strong>Entité légale:</strong> {assignment.legal_entity?.name}</p>
                    <p><strong>Type:</strong> {assignment.legal_entity?.entity_type}</p>
                    <p><strong>Assigné le:</strong> {new Date(assignment.assigned_at).toLocaleDateString('fr-FR')}</p>
                    {assignment.processed_at && (
                      <p><strong>Traité le:</strong> {new Date(assignment.processed_at).toLocaleDateString('fr-FR')}</p>
                    )}
                  </div>

                  {assignment.notes && (
                    <div className="text-sm bg-muted/50 p-2 rounded">
                      <strong>Notes de l'entité légale:</strong> {assignment.notes}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Progression
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          Progression - {assignment.envelope?.acid_number}
                        </DialogTitle>
                      </DialogHeader>
                      <AssignmentProgress assignmentId={assignment.id} />
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
    </div>
  );
}
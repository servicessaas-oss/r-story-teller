import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  ArrowRight,
  Building2,
  AlertTriangle
} from "lucide-react";
import { UserEnvelope } from "@/hooks/useUserEnvelopes";

interface EnhancedWorkflowProgressCardProps {
  envelope: UserEnvelope;
  onClick?: () => void;
}

export function EnhancedWorkflowProgressCard({ envelope, onClick }: EnhancedWorkflowProgressCardProps) {
  const stages = envelope.workflow_stages || [];
  const completedStages = stages.filter(stage => stage.status === 'completed').length;
  const totalStages = stages.length;
  const progress = totalStages > 0 ? (completedStages / totalStages) * 100 : 0;

  const getStageIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'approved': 'default',
      'rejected': 'destructive', 
      'under_review': 'secondary',
      'sent': 'outline',
      'draft': 'outline'
    } as const;

    const labels = {
      'approved': 'Approved ✅',
      'rejected': 'Rejected ❌',
      'under_review': 'Under Review 🔍',
      'sent': 'Sent 📤',
      'draft': 'Draft 📝'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getCurrentStageInfo = () => {
    const currentStage = stages.find(stage => stage.is_current || stage.status === 'in_progress' || stage.status === 'pending');
    return currentStage ? `Processing at ${currentStage.legal_entity_name}` : 'Processing complete';
  };

  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-all ${
        envelope.status === 'approved' ? 'border-green-200 bg-green-50/50' :
        envelope.status === 'rejected' ? 'border-red-200 bg-red-50/50' :
        envelope.status === 'under_review' ? 'border-blue-200 bg-blue-50/50' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-semibold text-primary">ACID: {envelope.acid_number}</h4>
              <p className="text-sm text-muted-foreground">
                {totalStages > 0 ? getCurrentStageInfo() : 'No workflow stages'}
              </p>
            </div>
            {getStatusBadge(envelope.status)}
          </div>

          {/* Progress Section */}
          {totalStages > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Workflow Progress</span>
                <span className="font-medium text-primary">
                  {completedStages}/{totalStages} stages complete
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Workflow Stages */}
          {stages.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-muted-foreground">Current Stages:</h5>
              <div className="flex flex-wrap gap-2">
                {stages.slice(0, 3).map((stage, index) => (
                  <div key={stage.stage_number} className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      stage.status === 'completed' ? 'bg-green-100 text-green-700' :
                      stage.is_current ? 'bg-blue-100 text-blue-700' :
                      stage.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {getStageIcon(stage.status)}
                      <span className="truncate max-w-24">{stage.legal_entity_name}</span>
                    </div>
                    {index < Math.min(stages.length - 1, 2) && (
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                ))}
                {stages.length > 3 && (
                  <span className="text-xs text-muted-foreground">+{stages.length - 3} more</span>
                )}
              </div>
            </div>
          )}

          {/* File Count and Date */}
          <div className="flex justify-between items-center text-xs text-muted-foreground border-t pt-2">
            <span>{envelope.files.length} document{envelope.files.length !== 1 ? 's' : ''}</span>
            <span>{new Date(envelope.created_at).toLocaleDateString()}</span>
          </div>

          {/* Special Status Messages */}
          {envelope.status === 'approved' && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded">
              <CheckCircle className="h-4 w-4" />
              <span>All stages completed successfully!</span>
            </div>
          )}
          
          {envelope.status === 'rejected' && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 p-2 rounded">
              <AlertTriangle className="h-4 w-4" />
              <span>Workflow was rejected and stopped.</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
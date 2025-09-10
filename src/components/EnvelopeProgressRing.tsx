import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle, XCircle } from "lucide-react";

interface EntityProgress {
  entityName: string;
  status: 'pending' | 'approved' | 'waiting' | 'rejected';
  documents: Array<{
    name: string;
    status: 'pending' | 'approved' | 'waiting' | 'rejected';
  }>;
}

interface EnvelopeProgressRingProps {
  envelopeId: string;
  acidNumber: string;
  overallStatus: string;
  entities: EntityProgress[];
  completedCount: number;
  totalCount: number;
  onOpen: () => void;
  onAddDocument: () => void;
  onResubmit: () => void;
  onContactEntity: (entityName: string) => void;
  onRefundRequest: () => void;
}

export function EnvelopeProgressRing({
  envelopeId,
  acidNumber,
  overallStatus,
  entities,
  completedCount,
  totalCount,
  onOpen,
  onAddDocument,
  onResubmit,
  onContactEntity,
  onRefundRequest
}: EnvelopeProgressRingProps) {
  const progressPercentage = (completedCount / totalCount) * 100;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'waiting': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'waiting': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">{acidNumber}</h3>
            <p className="text-sm text-muted-foreground">Envelope {envelopeId}</p>
            <Badge variant="outline" className="mt-2">
              {overallStatus}
            </Badge>
          </div>
          
          {/* Progress Ring */}
          <div className="relative">
            <svg width="100" height="100" className="transform -rotate-90">
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-muted stroke-current"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="text-primary stroke-current transition-all duration-500"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-primary">{completedCount}</span>
              <span className="text-xs text-muted-foreground">of {totalCount}</span>
            </div>
          </div>
        </div>

        {/* Entity Checklist */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Entity Progress</h4>
          {entities.map((entity) => (
            <div key={entity.entityName} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{entity.entityName}</span>
                  {getStatusIcon(entity.status)}
                </div>
                <Badge variant={getStatusVariant(entity.status) as any} className="text-xs">
                  {entity.status.charAt(0).toUpperCase() + entity.status.slice(1)}
                </Badge>
              </div>
              
              {/* Documents under this entity */}
              <div className="ml-4 space-y-1">
                {entity.documents.map((doc) => (
                  <div key={doc.name} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{doc.name}</span>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(doc.status)}
                      <span className="text-muted-foreground capitalize">{doc.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
          <button
            onClick={onOpen}
            className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Open
          </button>
          <button
            onClick={onAddDocument}
            className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
          >
            Add Document
          </button>
          <button
            onClick={onResubmit}
            className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
          >
            Resubmit
          </button>
          <button
            onClick={() => onContactEntity(entities[0]?.entityName)}
            className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
          >
            Contact Entity
          </button>
          <button
            onClick={onRefundRequest}
            className="text-xs px-2 py-1 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
          >
            Request Refund
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
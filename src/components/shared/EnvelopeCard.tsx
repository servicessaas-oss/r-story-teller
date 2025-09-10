import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, DollarSign, User, Building2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface EnvelopeCardProps {
  envelope: {
    id: string;
    acid_number: string;
    status: string;
    payment_status: string;
    workflow_status: string;
    legal_entity_id: string;
    user_id: string;
    created_at: string;
    total_amount?: number;
    files: any;
  };
  viewMode: 'user' | 'legal_entity';
  onClick?: () => void;
}

export function EnvelopeCard({ envelope, viewMode, onClick }: EnvelopeCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'in_review': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const fileCount = Array.isArray(envelope.files) ? envelope.files.length : 0;

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all duration-200 border-border/50 hover:border-border" 
      onClick={onClick}
    >
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-foreground">
            {envelope.acid_number}
          </CardTitle>
          <Badge className={getStatusColor(envelope.status)}>
            {envelope.status}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Created {formatDistanceToNow(new Date(envelope.created_at))} ago</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{fileCount} documents</span>
          </div>
          
          {envelope.total_amount && (
            <div className="flex items-center gap-1 text-sm font-medium text-foreground">
              <DollarSign className="h-4 w-4" />
              <span>${(envelope.total_amount / 100).toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Badge className={getPaymentStatusColor(envelope.payment_status)}>
            {envelope.payment_status}
          </Badge>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {viewMode === 'user' ? (
              <>
                <Building2 className="h-3 w-3" />
                <span>To: Legal Entity</span>
              </>
            ) : (
              <>
                <User className="h-3 w-3" />
                <span>From: User</span>
              </>
            )}
          </div>
        </div>

        <Badge variant="outline" className="text-xs">
          {envelope.workflow_status}
        </Badge>
      </CardContent>
    </Card>
  );
}
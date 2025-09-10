import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Clock, AlertCircle, X, ChevronRight } from "lucide-react";
import { useEnvelopes } from "@/hooks/useEnvelopes";
import { useAuth } from "@/contexts/AuthContext";

interface EnvelopeReminderProps {
  onCompose: () => void;
}

export function EnvelopeReminder({ onCompose }: EnvelopeReminderProps) {
  const { user } = useAuth();
  const { getUserEnvelopes } = useEnvelopes();
  const [uncompletedEnvelopes, setUncompletedEnvelopes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchEnvelopes = async () => {
      if (!user) return;
      
      try {
        const envelopes = await getUserEnvelopes();
        // Filter for uncompleted envelopes (drafts, pending, or processing)
        const uncompleted = envelopes?.filter(env => 
           env.status === 'draft' || 
           env.status === 'sent' || 
           env.workflow_status === 'in_progress' ||
           env.payment_status === 'pending'
        ) || [];
        
        setUncompletedEnvelopes(uncompleted);
      } catch (error) {
        console.error('Error fetching envelopes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnvelopes();
  }, [user, getUserEnvelopes]);

  if (loading || dismissed || uncompletedEnvelopes.length === 0) {
    return null;
  }

  const draftCount = uncompletedEnvelopes.filter(env => env.status === 'draft').length;
  const sentCount = uncompletedEnvelopes.filter(env => env.status === 'sent').length;
  const processingCount = uncompletedEnvelopes.filter(env => env.workflow_status === 'in_progress').length;

  return (
    <Alert className="mb-6 border-warning bg-warning/10">
      <AlertCircle className="h-4 w-4 text-warning" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4" />
              <span className="font-medium">Uncompleted Envelopes</span>
              <Badge variant="secondary" className="text-xs">
                {uncompletedEnvelopes.length}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {draftCount > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{draftCount} draft{draftCount !== 1 ? 's' : ''}</span>
                </div>
              )}
              {sentCount > 0 && (
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{sentCount} sent</span>
                </div>
              )}
              {processingCount > 0 && (
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  <span>{processingCount} processing</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={onCompose}
              size="sm"
              className="text-xs"
            >
              Continue Working
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
            <Button
              onClick={() => setDismissed(true)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
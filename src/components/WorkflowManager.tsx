import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Building2, CheckCircle, Clock, XCircle, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSequentialWorkflow } from "@/hooks/useSequentialWorkflow";
import { SequentialWorkflowTracker } from "./SequentialWorkflowTracker";

interface WorkflowEnvelope {
  id: string;
  acid_number: string;
  status: string;
  workflow_status: string;
  current_stage: number;
  workflow_stages: any;
  next_legal_entity_id: string | null;
  created_at: string;
  legal_entity_id: string;
}

interface LegalEntity {
  id: string;
  name: string;
  type: string;
  entityNumber: string;
}

const legalEntities: LegalEntity[] = [
  { id: "sca", name: "Sudan Customs Authority (SCA)", type: "Customs Authority", entityNumber: "SCA-001" },
  { id: "spc", name: "Sea Ports Corporation (SPC)", type: "Port Authority", entityNumber: "SPC-002" },
  { id: "mti", name: "Ministry of Trade and Industry", type: "Government Ministry", entityNumber: "MTI-003" },
  { id: "cbs", name: "Central Bank of Sudan", type: "Financial Institution", entityNumber: "CBS-004" },
];

interface WorkflowManagerProps {
  envelopeId?: string;
  onWorkflowUpdate?: () => void;
}

export function WorkflowManager({ envelopeId, onWorkflowUpdate }: WorkflowManagerProps) {
  const [envelopes, setEnvelopes] = useState<WorkflowEnvelope[]>([]);
  const [selectedEnvelope, setSelectedEnvelope] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { getWorkflowStatus } = useSequentialWorkflow();

  useEffect(() => {
    fetchWorkflowEnvelopes();
  }, []);

  const fetchWorkflowEnvelopes = async () => {
    try {
      const { data, error } = await supabase
        .from('envelopes')
        .select('*')
        .eq('workflow_status', 'in_progress')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEnvelopes(data || []);
    } catch (error) {
      console.error('Error fetching envelopes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch workflow envelopes",
        variant: "destructive",
      });
    }
  };

  const getLegalEntityName = (entityId: string) => {
    const entity = legalEntities.find(e => e.id === entityId);
    return entity ? entity.name : 'Unknown Entity';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress':
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Sequential Workflow Management
          </CardTitle>
          <CardDescription>
            Monitor and manage sequential document processing through legal entities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Envelope for Workflow Tracking</label>
            <Select value={selectedEnvelope} onValueChange={setSelectedEnvelope}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an envelope to track" />
              </SelectTrigger>
              <SelectContent>
                {envelopes.map((envelope) => (
                  <SelectItem key={envelope.id} value={envelope.id}>
                    ACID: {envelope.acid_number} - Current: {getLegalEntityName(envelope.legal_entity_id)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sequential Workflow Tracker */}
      {selectedEnvelope && (
        <SequentialWorkflowTracker
          envelopeId={selectedEnvelope}
          onStageComplete={() => {
            fetchWorkflowEnvelopes();
            onWorkflowUpdate?.();
          }}
        />
      )}

      {/* Active Workflows List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sequential Workflows</CardTitle>
          <CardDescription>Current status of envelopes in sequential processing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {envelopes.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No active workflows found
              </p>
            ) : (
              envelopes.map((envelope) => (
                <div 
                  key={envelope.id} 
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedEnvelope === envelope.id 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedEnvelope(envelope.id)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(envelope.workflow_status)}
                      <span className="font-medium">ACID: {envelope.acid_number}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Stage {envelope.current_stage} - Current: {getLegalEntityName(envelope.legal_entity_id)}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        Sequential Processing
                      </Badge>
                      {envelope.workflow_status === 'rejected' && (
                        <Badge variant="destructive" className="text-xs">
                          Workflow Blocked
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={envelope.workflow_status === 'completed' ? 'default' : 'secondary'}>
                      {envelope.workflow_status.replace('_', ' ')}
                    </Badge>
                    {selectedEnvelope === envelope.id && (
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <FileText className="h-3 w-3" />
                        View Details
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
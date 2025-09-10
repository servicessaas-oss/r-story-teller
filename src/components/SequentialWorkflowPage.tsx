import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Package } from "lucide-react";
import { SequentialWorkflowTracker } from "./SequentialWorkflowTracker";
import { useEnvelopes } from "@/hooks/useEnvelopes";
import { Badge } from "@/components/ui/badge";

export function SequentialWorkflowPage() {
  const { envelopeId } = useParams<{ envelopeId: string }>();
  const navigate = useNavigate();
  const [envelope, setEnvelope] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { getUserEnvelopes } = useEnvelopes();

  useEffect(() => {
    if (envelopeId) {
      loadEnvelopeDetails();
    }
  }, [envelopeId]);

  const loadEnvelopeDetails = async () => {
    try {
      setLoading(true);
      const envelopes = await getUserEnvelopes();
      const foundEnvelope = envelopes.find(env => env.id === envelopeId);
      setEnvelope(foundEnvelope);
    } catch (error) {
      console.error('Error loading envelope:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkflowUpdate = () => {
    // Refresh envelope details when workflow updates
    loadEnvelopeDetails();
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading Workflow...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!envelope) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Envelope Not Found</CardTitle>
            <CardDescription>
              The requested envelope could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const files = Array.isArray(envelope.files) ? envelope.files : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Envelope Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-primary">Sequential Workflow</CardTitle>
              <CardDescription>
                Tracking import/export document processing through legal entities
              </CardDescription>
            </div>
            <Badge variant={envelope.workflow_status === 'completed' ? 'default' : 'secondary'}>
              {envelope.workflow_status?.replace('_', ' ') || 'Not Started'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Package className="h-4 w-4 text-primary" />
                ACID Number
              </div>
              <p className="text-lg font-mono">{envelope.acid_number}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4 text-primary" />
                Documents
              </div>
              <p className="text-lg">{files.length} files uploaded</p>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Status</div>
              <Badge variant={envelope.status === 'approved' ? 'default' : envelope.status === 'rejected' ? 'destructive' : 'secondary'}>
                {envelope.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sequential Workflow Tracker */}
      {envelopeId && (
        <SequentialWorkflowTracker
          envelopeId={envelopeId}
          onStageComplete={handleWorkflowUpdate}
        />
      )}

      {/* Document Files */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Documents</CardTitle>
            <CardDescription>
              Files submitted for this envelope
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file: any, index: number) => (
                <div key={index} className="border border-border rounded-lg p-3">
                  <div className="space-y-2">
                    <div className="font-medium text-sm truncate">{file.name}</div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{Math.round(file.size / 1024)} KB</span>
                      <Badge variant="outline" className="text-xs">
                        {file.status || 'uploaded'}
                      </Badge>
                    </div>
                    {file.documentId && (
                      <div className="text-xs text-muted-foreground">
                        Document: {file.documentId}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
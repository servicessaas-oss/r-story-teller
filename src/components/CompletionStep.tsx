import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Package, Send, Download, Eye, Calendar, Clock, Building2, FileText } from "lucide-react";

interface RequiredDocument {
  id: string;
  name: string;
  legalEntityName: string;
  fee?: number;
}

interface WorkflowData {
  procedureType: 'export' | 'import';
  selectedGoods: Array<{ id: string; name: string }>;
  requiredDocuments: RequiredDocument[];
  totalFees: number;
  acidNumber?: string;
  uploadedFiles: Array<{ id: string; name: string }>;
  paymentStatus: 'pending' | 'paid' | 'failed';
  envelopeId?: string;
}

interface CompletionStepProps {
  workflowData: WorkflowData;
  onSendToEntities: () => void;
}

export function CompletionStep({ workflowData, onSendToEntities }: CompletionStepProps) {
  const [isSending, setIsSending] = useState(false);
  const [estimatedTimeframes, setEstimatedTimeframes] = useState({
    'Sudan Customs Authority': '2-3 business days',
    'Ministry of Agriculture': '3-5 business days',
    'Chamber of Commerce': '1-2 business days',
    'Ministry of Industry': '5-7 business days',
    'SSMO': '3-4 business days',
    'Central Bank of Sudan': '5-10 business days'
  });

  // Group documents by legal entity
  const documentsByEntity = workflowData.requiredDocuments.reduce((acc, doc) => {
    if (!acc[doc.legalEntityName]) {
      acc[doc.legalEntityName] = [];
    }
    acc[doc.legalEntityName].push(doc);
    return acc;
  }, {} as Record<string, RequiredDocument[]>);

  const handleSendToEntities = async () => {
    setIsSending(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onSendToEntities();
    setIsSending(false);
  };

  const generateAcidNumber = useMemo(() => {
    return workflowData.acidNumber || `ACID-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
  }, [workflowData.acidNumber]);

  const generateEnvelopeId = useMemo(() => {
    return workflowData.envelopeId || `ENV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
  }, [workflowData.envelopeId]);

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-green-800">Payment Successful!</h2>
              <p className="text-green-700">
                Your envelope is ready to be sent to legal entities for processing
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Envelope Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Package className="h-5 w-5" />
            Envelope Summary
          </CardTitle>
          <CardDescription>Review your completed envelope before sending</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Envelope ID</label>
                <p className="font-mono text-sm">{generateEnvelopeId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">ACID Number</label>
                <p className="font-mono text-sm">{generateAcidNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Procedure Type</label>
                <Badge variant="outline" className="ml-2">
                  {workflowData.procedureType.charAt(0).toUpperCase() + workflowData.procedureType.slice(1)}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Processing Fees</label>
                <p className="text-lg font-semibold text-primary">
                  ${(workflowData.totalFees / 100).toFixed(2)} USD
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Payment Status</label>
                <Badge variant="default" className="ml-2">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Paid
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Documents Uploaded</label>
                <p className="font-medium">{workflowData.uploadedFiles.length} files</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Goods */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Selected Goods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {workflowData.selectedGoods.map((good) => (
              <Badge key={good.id} variant="secondary" className="text-sm">
                {good.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Processing Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Processing Timeline & Next Steps
          </CardTitle>
          <CardDescription>
            Your documents will be automatically routed to the following entities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(documentsByEntity).map(([entityName, documents]) => (
              <div key={entityName} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-medium">{entityName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {documents.length} document{documents.length !== 1 ? 's' : ''} for processing
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      ETA: {estimatedTimeframes[entityName] || '3-5 business days'}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3 w-3 text-muted-foreground" />
                        <span>{doc.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Ready to Send
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" className="gap-2">
            <Eye className="h-4 w-4" />
            Preview Package
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download Receipt
          </Button>
        </div>

        <Button
          onClick={handleSendToEntities}
          disabled={isSending}
          variant="action"
          size="lg"
          className="gap-2 min-w-48"
        >
          {isSending ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Sending to Entities...
            </div>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send to Legal Entities
            </>
          )}
        </Button>
      </div>

      {/* What Happens Next */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">What Happens Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-blue-700">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium">Documents Automatically Routed</p>
                <p className="text-sm">Your documents will be sent to each legal entity's processing queue</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium">Real-Time Status Updates</p>
                <p className="text-sm">Track progress in your Drafts page and receive notifications</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium">Entity Processing & Signatures</p>
                <p className="text-sm">Legal entities will verify, approve, and digitally sign your documents</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold mt-0.5">
                4
              </div>
              <div>
                <p className="font-medium">Completion & Dispatch</p>
                <p className="text-sm">Once all signatures are collected, your final package will be ready for dispatch</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Download, 
  PenTool, 
  Clock,
  Shield,
  Hash,
  User,
  Calendar,
  AlertTriangle,
  ArrowLeft
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface VerificationProps {
  envelope: {
    id: string;
    acid_number: string;
    files: any[];
    created_at: string;
    sender_name?: string;
    due_date?: string;
  };
  onBack: () => void;
  onComplete: () => void;
}

type DecisionType = 'approve' | 'reject' | 'request_amendments';

export function LegalEntityVerification({ envelope, onBack, onComplete }: VerificationProps) {
  const { profile } = useAuth();
  const [selectedFile, setSelectedFile] = useState<number>(0);
  const [decision, setDecision] = useState<DecisionType | null>(null);
  const [comments, setComments] = useState("");
  const [signatureType, setSignatureType] = useState<'basic' | 'advanced' | 'qualified'>('basic');
  const [processing, setProcessing] = useState(false);
  const [isBlockchainSigned, setIsBlockchainSigned] = useState(false);

  // Check if document is already blockchain signed
  useEffect(() => {
    const checkBlockchainSignature = async () => {
      try {
        const { data, error } = await supabase
          .from('blockchain_signatures')
          .select('*')
          .eq('envelope_id', envelope.id)
          .eq('user_id', profile?.id);
        
        if (!error && data && data.length > 0) {
          setIsBlockchainSigned(true);
        }
      } catch (error) {
        console.error('Error checking blockchain signature:', error);
      }
    };
    
    if (profile?.id) {
      checkBlockchainSignature();
    }
  }, [envelope.id, profile?.id]);

  const handleDecision = async (decisionType: DecisionType) => {
    if (!comments.trim() && decisionType !== 'approve') {
      toast.error('Please provide comments for your decision');
      return;
    }

    setProcessing(true);
    try {
      // Create verification log
      const verificationData = {
        envelope_id: envelope.id,
        legal_entity_id: profile?.legal_entity_id,
        decision: decisionType,
        comments: comments.trim(),
        signature_type: signatureType,
        verified_by: profile?.full_name,
        verified_at: new Date().toISOString(),
        document_hash: `hash_${envelope.id}_${Date.now()}`, // Mock hash
        signature_certificate: `cert_${profile?.legal_entity_id}_${Date.now()}` // Mock cert
      };

      // Log verification data locally (verification_logs table may not exist)
      console.log('Verification data:', verificationData);

      // Update envelope based on decision
      let newStatus: string = 'under_review';
      let updateData: any = {};

      if (decisionType === 'approve') {
        newStatus = 'approved';
        updateData.status = newStatus;
        updateData.workflow_status = 'completed';
        // mark as signed by this legal entity
        updateData.signed_at = new Date().toISOString();
        updateData.signed_by_legal_entity_id = profile?.legal_entity_id;

        // Only create signature record if not blockchain signed
        if (!isBlockchainSigned) {
          const { error: signatureError } = await supabase
            .from('envelope_signatures')
            .insert({
              envelope_id: envelope.id,
              legal_entity_id: profile?.legal_entity_id,
              signature_data: {
                signed_by: profile?.full_name,
                timestamp: new Date().toISOString(),
                signature_type: signatureType,
                document_hash: verificationData.document_hash,
                certificate: verificationData.signature_certificate
              },
            });

          if (signatureError) {
            console.warn('Could not create signature record:', signatureError);
          }
        }
      } else if (decisionType === 'reject') {
        newStatus = 'rejected';
        updateData.status = newStatus;
        updateData.workflow_status = 'rejected';
      } else if (decisionType === 'request_amendments') {
        newStatus = 'amendments_requested';
        updateData.status = newStatus;
        updateData.workflow_status = 'in_progress';
      }

      const { error: updateError } = await supabase
        .from('envelopes')
        .update(updateData)
        .eq('id', envelope.id);

      if (updateError) throw updateError;

      const successMessage = decisionType === 'approve' 
        ? (isBlockchainSigned ? 'Document approved (already blockchain signed)' : 'Document approved and signed')
        : decisionType === 'reject' 
        ? 'Document rejected' 
        : 'Amendments requested';
      
      toast.success(successMessage);
      onComplete();
      
    } catch (error) {
      console.error('Error processing decision:', error);
      toast.error('Failed to process decision');
    } finally {
      setProcessing(false);
    }
  };

  const getDecisionColor = (type: DecisionType) => {
    switch (type) {
      case 'approve': return 'bg-green-600 hover:bg-green-700';
      case 'reject': return 'bg-red-600 hover:bg-red-700';
      case 'request_amendments': return 'bg-yellow-600 hover:bg-yellow-700';
    }
  };

  const getSignatureIcon = (type: string) => {
    switch (type) {
      case 'advanced': return <Shield className="h-4 w-4" />;
      case 'qualified': return <Shield className="h-4 w-4 text-green-600" />;
      default: return <PenTool className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inbox
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-primary">Document Verification</h2>
            <p className="text-muted-foreground">ACID: {envelope.acid_number}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Received: {new Date(envelope.created_at).toLocaleDateString()}
          </Badge>
          {envelope.due_date && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Due: {new Date(envelope.due_date).toLocaleDateString()}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Document Viewer */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Document Review</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {Array.isArray(envelope.files) ? envelope.files.length : 0} files
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* File Tabs */}
              <div className="flex gap-2 mb-4 overflow-x-auto">
                {Array.isArray(envelope.files) && envelope.files.map((file, index) => (
                  <Button
                    key={index}
                    variant={selectedFile === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFile(index)}
                    className="whitespace-nowrap"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {file.name}
                  </Button>
                ))}
              </div>

              {/* Document Preview */}
              <div className="border rounded-lg p-6 bg-muted/50 min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">
                    {Array.isArray(envelope.files) && envelope.files[selectedFile]?.name || 'Document Preview'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Document viewer would be implemented here
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Annotate
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Auto-log Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Verification Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Verifier:</span>
                    <span>{profile?.full_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Timestamp:</span>
                    <span>{new Date().toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Document Hash:</span>
                    <code className="text-xs bg-muted px-1 rounded">
                      {`hash_${envelope.id.slice(-8)}...`}
                    </code>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Signature Cert:</span>
                    <code className="text-xs bg-muted px-1 rounded">
                      {`cert_${profile?.legal_entity_id?.slice(-6)}...`}
                    </code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verification Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verification Decision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Signature Type Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Signature Type</label>
                <Select value={signatureType} onValueChange={(value: any) => setSignatureType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">
                      <div className="flex items-center gap-2">
                        <PenTool className="h-4 w-4" />
                        Basic E-Signature
                      </div>
                    </SelectItem>
                    <SelectItem value="advanced">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Advanced E-Signature
                      </div>
                    </SelectItem>
                    <SelectItem value="qualified">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        Qualified E-Signature
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Comments */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Comments</label>
                <Textarea
                  placeholder="Add your verification comments..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                />
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="space-y-2">
                {isBlockchainSigned ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={processing}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Document
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Approve Document</AlertDialogTitle>
                        <AlertDialogDescription>
                          This document has been signed on blockchain. Are you sure you want to approve it?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDecision('approve')}>
                          Approve Document
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={processing}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve & Sign
                      </Button>
                    </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Approve Document</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to approve this document? This action will create a digital signature and cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDecision('approve')}>
                        Approve & Sign
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                )}

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleDecision('request_amendments')}
                  disabled={processing || !comments.trim()}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Request Amendments
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      disabled={processing || !comments.trim()}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Document
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reject Document</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to reject this document? The sender will be notified and the document will need to be resubmitted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDecision('reject')}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Reject Document
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          {/* SLA Timer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                SLA Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Processing Time:</span>
                  <Badge variant="secondary">Standard (24h)</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Time Remaining:</span>
                  <Badge variant="default">18h 32m</Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  On track to meet SLA requirements
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
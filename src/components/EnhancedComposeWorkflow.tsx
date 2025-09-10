import { useState, useMemo } from "react";
import { ProcedureSelector } from "./ProcedureSelector";
import { EnhancedDragDropDocuments } from "./EnhancedDragDropDocuments";
import { PaymentStep } from "./PaymentStep";
import { CompletionStep } from "./CompletionStep";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Package, Upload, CreditCard, Send } from "lucide-react";
import { type Good, type RequiredDocument, mapLegalEntityIdToUUID } from "@/data/procedureData";
import { useToast } from "@/hooks/use-toast";
import { useEnvelopes } from "@/hooks/useEnvelopes";
import { useSequentialWorkflow } from "@/hooks/useSequentialWorkflow";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  documentId?: string;
  status: 'missing' | 'uploaded' | 'needs_payment' | 'sent_to_entity' | 'verified' | 'rejected';
  notes?: string;
  uploadedAt?: Date;
  rejectionReason?: string;
}

interface WorkflowData {
  procedureType: 'export' | 'import';
  selectedGoods: Good[];
  requiredDocuments: RequiredDocument[];
  totalFees: number;
  acidNumber?: string;
  uploadedFiles: UploadedFile[];
  paymentStatus: 'pending' | 'paid' | 'failed';
  envelopeId?: string;
}

type WorkflowStep = 'procedure' | 'documents' | 'payment' | 'completion';

interface EnhancedComposeWorkflowProps {
  onSave: (workflowData: WorkflowData) => void;
  onComplete: (workflowData: WorkflowData) => void;
  onCancel: () => void;
}

export function EnhancedComposeWorkflow({ onSave, onComplete, onCancel }: EnhancedComposeWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('procedure');
  const [workflowData, setWorkflowData] = useState<WorkflowData>({
    procedureType: 'export',
    selectedGoods: [],
    requiredDocuments: [],
    totalFees: 0,
    uploadedFiles: [],
    paymentStatus: 'pending'
  });

  const { toast } = useToast();
  const { createEnvelope } = useEnvelopes();
  const { createSequentialWorkflow, startWorkflow } = useSequentialWorkflow();

  const steps: Array<{ key: WorkflowStep; title: string; icon: any; description: string }> = [
    { key: 'procedure', title: 'Choose Procedure', icon: Package, description: 'Select export or import' },
    { key: 'documents', title: 'Upload Documents', icon: Upload, description: 'Matrix view and file uploads' },
    { key: 'payment', title: 'Payment', icon: CreditCard, description: 'Pay processing fees' },
    { key: 'completion', title: 'Complete', icon: Send, description: 'Send to entities' }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleProcedureComplete = (
    procedureType: 'export' | 'import',
    selectedGoods: Good[],
    requiredDocuments: RequiredDocument[],
    totalFees: number
  ) => {
    setWorkflowData({
      ...workflowData,
      procedureType,
      selectedGoods,
      requiredDocuments,
      totalFees
    });
    setCurrentStep('documents');
  };

  const handleFileUpload = (files: File[], documentId: string) => {
    const newFiles: UploadedFile[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      documentId,
      status: 'uploaded',
      uploadedAt: new Date()
    }));

    setWorkflowData(prev => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, ...newFiles]
    }));
  };

  const handleFileRemove = (fileId: string) => {
    setWorkflowData(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter(file => file.id !== fileId)
    }));
  };

  const handleFileUpdate = (fileId: string, updates: Partial<UploadedFile>) => {
    setWorkflowData(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.map(file =>
        file.id === fileId ? { ...file, ...updates } : file
      )
    }));
  };

  const handleNotesUpdate = (fileId: string, notes: string) => {
    handleFileUpdate(fileId, { notes });
  };

  const handlePaymentComplete = (paymentData: any) => {
    setWorkflowData(prev => ({
      ...prev,
      paymentStatus: 'paid',
      envelopeId: 'ENV-' + Date.now()
    }));
    setCurrentStep('completion');
    
    toast({
      title: "Payment successful",
      description: "Documents are being routed to legal entities",
    });
  };

  const handleSaveDraft = () => {
    onSave(workflowData);
    toast({
      title: "Draft saved",
      description: "Your envelope has been saved as a draft",
    });
  };

  // Generate stable ACID number once
  const acidNumber = useMemo(() => 'AC' + Date.now().toString().slice(-6), []);

  const handleSendToEntities = async () => {
    console.log('🚀 Starting handleSendToEntities...');
    try {
      // Create the envelope in the database first
      const envelopeData = {
        acid_number: acidNumber,
        files: workflowData.uploadedFiles,
        legal_entity_id: mapLegalEntityIdToUUID(workflowData.requiredDocuments[0]?.legalEntityId) || 'sca', // Start with first legal entity
        procedure_id: undefined, // procedure_id expects UUID, but we have string IDs - leaving null for now
        payment_method: 'credit_card',
        total_amount: workflowData.totalFees,
        workflow_stages: [],
        status: 'draft' // Keep as draft until workflow is started
      };

      console.log('📋 Creating envelope with data:', envelopeData);
      const envelope = await createEnvelope(envelopeData);
      console.log('✅ Envelope created:', envelope);

      // Create sequential workflow
      const sequentialWorkflow = createSequentialWorkflow(
        workflowData.requiredDocuments,
        envelope.id,
        acidNumber
      );
      console.log('🔄 Created sequential workflow:', sequentialWorkflow);

      // Start the sequential workflow
      console.log('🚀 Starting workflow...');
      await startWorkflow(sequentialWorkflow);
      console.log('✅ Workflow started successfully');

      onComplete({
        ...workflowData,
        envelopeId: envelope.id
      });

      toast({
        title: "Sequential Workflow Started",
        description: `Envelope ${acidNumber} sent to ${workflowData.requiredDocuments[0]?.legalEntityName} for processing`,
      });
    } catch (error) {
      console.error('❌ Error in handleSendToEntities:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      toast({
        title: "Error Starting Workflow",
        description: error instanceof Error ? error.message : "Failed to create sequential workflow. Please try again.",
        variant: "destructive"
      });
    }
  };

  const canProceedToPayment = () => {
    const requiredDocs = workflowData.requiredDocuments.filter(doc => doc.isRequired);
    const uploadedRequiredDocs = workflowData.uploadedFiles.filter(file => 
      requiredDocs.some(doc => doc.id === file.documentId)
    );
    return uploadedRequiredDocs.length >= requiredDocs.length;
  };

  const renderStepIndicator = () => (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-primary">Envelope Creation Workflow</CardTitle>
            <CardDescription>Step {currentStepIndex + 1} of {steps.length}</CardDescription>
          </div>
          <Badge variant="outline" className="text-sm">
            {Math.round(progress)}% Complete
          </Badge>
        </div>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = step.key === currentStep;
            const isCompleted = index < currentStepIndex;
            const StepIcon = step.icon;

            return (
              <div key={step.key} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isCompleted 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : isActive 
                    ? 'border-primary text-primary' 
                    : 'border-border text-muted-foreground'
                }`}>
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <h3 className={`text-sm font-medium ${
                    isActive ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    index < currentStepIndex ? 'bg-primary' : 'bg-border'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'procedure':
        return <ProcedureSelector onProceed={handleProcedureComplete} />;
      
      case 'documents':
        return (
          <EnhancedDragDropDocuments
            selectedGoods={workflowData.selectedGoods}
            requiredDocuments={workflowData.requiredDocuments}
            uploadedFiles={workflowData.uploadedFiles}
            onFileUpload={handleFileUpload}
            onFileRemove={handleFileRemove}
            onFileUpdate={handleFileUpdate}
            onNotesUpdate={handleNotesUpdate}
          />
        );
      
      case 'payment':
        return (
          <PaymentStep
            totalFees={workflowData.totalFees}
            requiredDocuments={workflowData.requiredDocuments}
            uploadedFiles={workflowData.uploadedFiles}
            onPaymentComplete={handlePaymentComplete}
          />
        );
      
      case 'completion':
        return (
          <CompletionStep
            workflowData={workflowData}
            onSendToEntities={handleSendToEntities}
          />
        );
      
      default:
        return null;
    }
  };

  const renderNavigationButtons = () => (
    <div className="flex items-center justify-between mt-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        {currentStep !== 'procedure' && (
          <Button
            variant="outline"
            onClick={() => {
              const prevStepIndex = Math.max(0, currentStepIndex - 1);
              setCurrentStep(steps[prevStepIndex].key);
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={handleSaveDraft}>
          Save Draft
        </Button>
        
        {currentStep === 'documents' && (
          <Button
            onClick={() => setCurrentStep('payment')}
            disabled={!canProceedToPayment()}
            variant="action"
          >
            Continue to Payment
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {renderStepIndicator()}
      {renderStepContent()}
      {currentStep !== 'procedure' && currentStep !== 'completion' && renderNavigationButtons()}
    </div>
  );
}
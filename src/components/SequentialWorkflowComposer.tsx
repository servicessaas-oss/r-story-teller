import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Upload, FileText, Settings, Send, ArrowRight, Building2, CreditCard, CheckCircle, AlertTriangle } from "lucide-react";
import { DocumentPropertiesModal } from "./DocumentPropertiesModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSequentialWorkflow } from "@/hooks/useSequentialWorkflow";
import { getGoodsByProcedure, getDocumentsByGoods, mapLegalEntityIdToUUID, type RequiredDocument, type Good } from "@/data/procedureData";

interface UploadedFile {
  id: string;
  name: string;
  type?: string;
  certificateNumber?: string;
  documentId?: string;
}


export function SequentialWorkflowComposer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { createSequentialWorkflow, startWorkflow, loading } = useSequentialWorkflow();
  
  const [step, setStep] = useState(1);
  const [procedureType, setProcedureType] = useState<'export' | 'import' | ''>('');
  const [selectedGoods, setSelectedGoods] = useState<string[]>([]);
  const [acidNumber, setAcidNumber] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [showPropertiesModal, setShowPropertiesModal] = useState(false);
  const [goods, setGoods] = useState<Good[]>([]);
  const [requiredDocuments, setRequiredDocuments] = useState<RequiredDocument[]>([]);
  const [workflowPreview, setWorkflowPreview] = useState<any>(null);

  // Load goods from procedureData when procedure type changes
  useEffect(() => {
    if (procedureType) {
      const procedureGoods = getGoodsByProcedure(procedureType);
      setGoods(procedureGoods);
    } else {
      setGoods([]);
    }
  }, [procedureType]);

  // Update required documents when goods selection changes
  useEffect(() => {
    if (selectedGoods.length > 0) {
      const docs = getDocumentsByGoods(selectedGoods);
      setRequiredDocuments(docs);
    } else {
      setRequiredDocuments([]);
    }
  }, [selectedGoods]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles: UploadedFile[] = Array.from(files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
    e.target.value = '';
  };

  const handlePropertiesClick = (file: UploadedFile) => {
    setSelectedFile(file);
    setShowPropertiesModal(true);
  };

  const handleSaveProperties = (file: UploadedFile, type: string, certificateNumber?: string) => {
    // Find matching document from required documents
    const matchingDoc = requiredDocuments.find(doc => 
      doc.name.toLowerCase().includes(type.toLowerCase()) ||
      type.toLowerCase().includes(doc.name.toLowerCase())
    );

    setUploadedFiles(prev => prev.map(f => 
      f.id === file.id 
        ? { ...f, type, certificateNumber, documentId: matchingDoc?.id }
        : f
    ));
    setShowPropertiesModal(false);
    setSelectedFile(null);
  };

  const handleNext = () => {
    if (step === 1 && procedureType && selectedGoods.length > 0) {
      setStep(2);
    } else if (step === 2 && acidNumber && uploadedFiles.length > 0) {
      // Create workflow preview
      if (requiredDocuments.length > 0) {
        const workflowData = createSequentialWorkflow(requiredDocuments, 'preview', acidNumber);
        setWorkflowPreview(workflowData);
        setStep(3);
      }
    }
  };

  const handleStartWorkflow = async () => {
    if (!user || !workflowPreview) {
      toast({
        title: "Error", 
        description: 'Please complete all steps before starting the workflow',
        variant: "destructive"
      });
      return;
    }

    try {
      // Create envelope first
      const { data: envelope, error: envelopeError } = await supabase
        .from('envelopes')
        .insert({
          user_id: user.id,
          acid_number: acidNumber,
          procedure_id: null, // procedure_id expects UUID but we have string, setting to null
          legal_entity_id: mapLegalEntityIdToUUID(workflowPreview.stages[0]?.legal_entity_id) || '',
          files: uploadedFiles.map(f => ({ name: f.name, type: f.type })),
          workflow_stages: workflowPreview.stages,
          workflow_status: 'draft',
          status: 'draft'
        })
        .select()
        .single();

      if (envelopeError) throw envelopeError;

      // Update workflow with real envelope ID
      const updatedWorkflow = {
        ...workflowPreview,
        envelope_id: envelope.id
      };

      // Start the workflow
      await startWorkflow(updatedWorkflow);
      
      toast({
        title: "Workflow Started",
        description: 'Sequential workflow started successfully!',
      });
      
      // Reset form
      setStep(1);
      setProcedureType('');
      setSelectedGoods([]);
      setAcidNumber('');
      setUploadedFiles([]);
      setWorkflowPreview(null);

    } catch (error) {
      console.error('Error starting workflow:', error);
      toast({
        title: "Error",
        description: 'Failed to start workflow. Please try again.',
        variant: "destructive"
      });
    }
  };

  const canProceedStep1 = procedureType && selectedGoods.length > 0;
  const canProceedStep2 = acidNumber && uploadedFiles.length > 0;
  const totalFees = requiredDocuments.reduce((sum, doc) => sum + (doc.fee || 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNum ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {stepNum}
              </div>
              {stepNum < 3 && (
                <ArrowRight className={`h-4 w-4 mx-2 ${
                  step > stepNum ? 'text-primary' : 'text-muted-foreground'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-sm text-muted-foreground">
          Step {step} of 3
        </div>
      </div>

      {/* Step 1: Procedure and Goods Selection */}
      {step === 1 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Select Procedure Type</CardTitle>
              <CardDescription>Choose between export or import procedure for sequential processing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={procedureType === 'export' ? 'default' : 'outline'}
                  className="h-20 flex-col"
                  onClick={() => {
                    setProcedureType('export');
                    setSelectedGoods([]);
                  }}
                >
                  <Send className="h-6 w-6 mb-2" />
                  Export
                </Button>
                <Button
                  variant={procedureType === 'import' ? 'default' : 'outline'}
                  className="h-20 flex-col"
                  onClick={() => {
                    setProcedureType('import');
                    setSelectedGoods([]);
                  }}
                >
                  <Upload className="h-6 w-6 mb-2" />
                  Import
                </Button>
              </div>
            </CardContent>
          </Card>

          {procedureType && (
            <Card>
              <CardHeader>
                <CardTitle className="text-primary">Select Goods/Merchandise</CardTitle>
                <CardDescription>Choose the goods for sequential workflow processing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                  {goods.map((good) => (
                    <div
                      key={good.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedGoods.includes(good.id) 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => {
                        setSelectedGoods(prev => 
                          prev.includes(good.id) 
                            ? prev.filter(g => g !== good.id)
                            : [...prev, good.id]
                        );
                      }}
                    >
                      <div className="text-sm font-medium">{good.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{good.category}</div>
                    </div>
                  ))}
                </div>
                
                {selectedGoods.length > 0 && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <h5 className="text-sm font-medium mb-2">Selected Goods ({selectedGoods.length}):</h5>
                    <div className="flex flex-wrap gap-1">
                      {selectedGoods.map((goodId) => {
                        const good = goods.find(g => g.id === goodId);
                        return (
                          <Badge key={goodId} variant="secondary" className="text-xs">
                            {good?.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                {requiredDocuments.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="text-sm font-medium mb-2 text-blue-800">
                      Sequential Workflow Preview ({requiredDocuments.length} stages)
                    </h5>
                    <div className="space-y-2">
                      {requiredDocuments.map((doc, index) => (
                        <div key={doc.id} className="flex items-center justify-between text-xs text-blue-700">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </span>
                            <span>{doc.name}</span>
                            <span className="text-blue-500">({doc.legalEntityName})</span>
                          </div>
                          {doc.fee && doc.fee > 0 && (
                            <span className="text-blue-600 font-medium">
                              ${(doc.fee / 100).toFixed(2)}
                            </span>
                          )}
                        </div>
                      ))}
                      {totalFees > 0 && (
                        <div className="pt-2 border-t border-blue-300 flex justify-between font-medium text-blue-800">
                          <span>Total Fees:</span>
                          <span>${(totalFees / 100).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Step 2: ACID Number and Document Upload */}
      {step === 2 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Shipment Information</CardTitle>
              <CardDescription>Enter the ACID number for this shipment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <label htmlFor="acid" className="block text-sm font-medium">
                  ACID Number *
                </label>
                <Input
                  id="acid"
                  type="text"
                  placeholder="Enter ACID number"
                  value={acidNumber}
                  onChange={(e) => setAcidNumber(e.target.value)}
                  className="max-w-md"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Upload Documents</CardTitle>
              <CardDescription>Upload documents for the sequential workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop files here, or click to browse
                </p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <Button asChild variant="outline">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </label>
                </Button>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Uploaded Files</h4>
                  <div className="space-y-2">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{file.name}</p>
                            {file.type && (
                              <p className="text-xs text-muted-foreground">
                                {file.type}
                                {file.certificateNumber && ` - ${file.certificateNumber}`}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePropertiesClick(file)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Properties
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Step 3: Workflow Preview and Start */}
      {step === 3 && workflowPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Sequential Workflow Ready
            </CardTitle>
            <CardDescription>
              Review the workflow sequence and start the payment-enabled sequential processing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{workflowPreview.total_stages}</div>
                <div className="text-sm text-muted-foreground">Sequential Stages</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{selectedGoods.length}</div>
                <div className="text-sm text-muted-foreground">Selected Goods</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">${(totalFees / 100).toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Total Fees</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Sequential Processing Order:</h4>
              {workflowPreview.stages.map((stage: any, index: number) => (
                <div key={stage.stage_number} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary">
                      {stage.stage_number}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{stage.legal_entity_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Document: {requiredDocuments.find(d => d.id === stage.document_id)?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {stage.payment_required && (
                      <Badge variant="destructive" className="text-xs">
                        Payment: ${(stage.payment_amount / 100).toFixed(2)}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {stage.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t">
              <Button 
                onClick={handleStartWorkflow}
                disabled={loading}
                variant="action"
                size="lg"
                className="w-full"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Starting Workflow...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Start Sequential Workflow
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
        >
          Previous
        </Button>

        {step < 3 && (
          <Button
            onClick={handleNext}
            disabled={
              (step === 1 && !canProceedStep1) ||
              (step === 2 && !canProceedStep2)
            }
            variant="action"
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>

      {selectedFile && (
        <DocumentPropertiesModal
          isOpen={showPropertiesModal}
          onClose={() => {
            setShowPropertiesModal(false);
            setSelectedFile(null);
          }}
          file={selectedFile}
          requiredDocuments={requiredDocuments}
          onSave={handleSaveProperties}
        />
      )}
    </div>
  );
}
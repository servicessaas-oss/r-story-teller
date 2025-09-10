import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Settings, Send, ArrowRight, Building2, CreditCard } from "lucide-react";
import { DocumentPropertiesModal } from "./DocumentPropertiesModal";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface UploadedFile {
  id: string;
  name: string;
  type?: string;
  certificateNumber?: string;
}

interface LegalEntity {
  id: string;
  name: string;
  type: string;
  entityNumber: string;
}

interface EnhancedComposeEnvelopeProps {
  onSendAndSign: (files: UploadedFile[], acidNumber: string, procedureType: string, legalEntityId: string, selectedGoods: string[]) => void;
  onPaymentRequired: (envelopeData: any) => void;
}

interface Good {
  id: string;
  name: string;
  procedure_type: string;
}

const legalEntities: LegalEntity[] = [
  { id: "sca", name: "Sudan Customs Authority (SCA)", type: "Customs Authority", entityNumber: "SCA-001" },
  { id: "spc", name: "Sea Ports Corporation (SPC)", type: "Port Authority", entityNumber: "SPC-002" },
  { id: "mti", name: "Ministry of Trade and Industry", type: "Government Ministry", entityNumber: "MTI-003" },
  { id: "cbs", name: "Central Bank of Sudan", type: "Financial Institution", entityNumber: "CBS-004" },
];

export function EnhancedComposeEnvelope({ onSendAndSign, onPaymentRequired }: EnhancedComposeEnvelopeProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [procedureType, setProcedureType] = useState<'export' | 'import' | ''>('');
  const [selectedGoods, setSelectedGoods] = useState<string[]>([]);
  const [selectedLegalEntity, setSelectedLegalEntity] = useState<string>('');
  const [acidNumber, setAcidNumber] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [showPropertiesModal, setShowPropertiesModal] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [goods, setGoods] = useState<Good[]>([]);

  useEffect(() => {
    const fetchGoods = async () => {
      const { data, error } = await supabase
        .from('goods')
        .select('*')
        .order('name');
      
      if (data && !error) {
        setGoods(data);
      }
    };
    
    fetchGoods();
  }, []);

  const selectedLegalEntityData = legalEntities.find(e => e.id === selectedLegalEntity);

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
    setUploadedFiles(prev => prev.map(f => 
      f.id === file.id 
        ? { ...f, type, certificateNumber }
        : f
    ));
    setShowPropertiesModal(false);
    setSelectedFile(null);
  };

  const handleNext = () => {
    if (step === 1 && procedureType && selectedGoods.length > 0) {
      setStep(2);
    } else if (step === 2 && selectedLegalEntity) {
      setStep(3);
    } else if (step === 3 && acidNumber && uploadedFiles.length > 0) {
      // Calculate fees based on procedure and files
      const baseFee = procedureType === 'export' ? 5000 : 4500; // cents
      const documentFee = uploadedFiles.length * 500; // 5$ per document
      const totalAmount = baseFee + documentFee;
      
      setShowPayment(true);
    }
  };

  const handlePayment = async (method: string) => {
    if (!user) {
      toast.error('You must be logged in to proceed with payment');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          amount: calculateTotalAmount(),
          payment_method: method,
          envelope_data: {
            acidNumber,
            files: uploadedFiles,
            procedureId: procedureType,
            legalEntityId: selectedLegalEntity,
          },
        },
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
      toast.success('Payment window opened. Complete payment to finalize envelope.');
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    }
  };

  const calculateTotalAmount = () => {
    const baseFee = procedureType === 'export' ? 5000 : 4500; // cents
    const documentFee = uploadedFiles.length * 500; // 5$ per document
    return baseFee + documentFee;
  };

  const canProceedStep1 = procedureType && selectedGoods.length > 0;
  const canProceedStep2 = selectedLegalEntity;
  const canProceedStep3 = acidNumber && uploadedFiles.length > 0;

  if (showPayment) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Required
            </CardTitle>
            <CardDescription>Complete payment to process your envelope</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Order Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Procedure: {procedureType?.charAt(0).toUpperCase() + procedureType?.slice(1)}</span>
                  <span>${procedureType === 'export' ? '50.00' : '45.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Documents ({uploadedFiles.length})</span>
                  <span>${(uploadedFiles.length * 5).toFixed(2)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${(calculateTotalAmount() / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <PaymentMethodSelector
              onPaymentMethodSelect={handlePayment}
              amount={calculateTotalAmount()}
              envelopeData={{
                acidNumber,
                files: uploadedFiles,
                procedureId: procedureType,
                legalEntityId: selectedLegalEntity,
              }}
            />

            <Button 
              variant="outline" 
              onClick={() => setShowPayment(false)}
              className="w-full"
            >
              Back to Envelope
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <CardDescription>Choose between export or import procedure</CardDescription>
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
                <CardDescription>Choose the goods that will be affected by this {procedureType} procedure</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                  {goods.filter(good => good.procedure_type === procedureType).map((good) => (
                    <div
                      key={good.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedGoods.includes(good.name) 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => {
                        setSelectedGoods(prev => 
                          prev.includes(good.name) 
                            ? prev.filter(g => g !== good.name)
                            : [...prev, good.name]
                        );
                      }}
                    >
                      <div className="text-sm font-medium">{good.name}</div>
                    </div>
                  ))}
                </div>
                {selectedGoods.length > 0 && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <h5 className="text-sm font-medium mb-2">Selected Goods ({selectedGoods.length}):</h5>
                    <div className="flex flex-wrap gap-1">
                      {selectedGoods.map((good) => (
                        <Badge key={good} variant="secondary" className="text-xs">
                          {good}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Step 2: Legal Entity Selection */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Select Legal Entity
            </CardTitle>
            <CardDescription>Choose the entity that will verify or complete this envelope</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {legalEntities.map((entity) => (
                <Card 
                  key={entity.id} 
                  className={`cursor-pointer transition-all ${
                    selectedLegalEntity === entity.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedLegalEntity(entity.id)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{entity.name}</CardTitle>
                    <CardDescription className="text-xs">{entity.type}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-sm text-muted-foreground">
                      ID: {entity.entityNumber}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Document Upload */}
      {step === 3 && (
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
              <CardDescription>Upload the required documents for your {procedureType} procedure</CardDescription>
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

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
        >
          Previous
        </Button>

        <Button
          onClick={handleNext}
          disabled={
            (step === 1 && !canProceedStep1) ||
            (step === 2 && !canProceedStep2) ||
            (step === 3 && !canProceedStep3)
          }
          variant="action"
        >
          {step === 3 ? 'Proceed to Payment' : 'Next'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {selectedFile && (
        <DocumentPropertiesModal
          isOpen={showPropertiesModal}
          onClose={() => {
            setShowPropertiesModal(false);
            setSelectedFile(null);
          }}
          file={selectedFile}
          onSave={handleSaveProperties}
        />
      )}
    </div>
  );
}
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, DollarSign, FileText, Building2, CheckCircle, AlertTriangle } from "lucide-react";
import { type RequiredDocument } from "@/data/procedureData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  id: string;
  name: string;
  documentId?: string;
  status: 'missing' | 'uploaded' | 'needs_payment' | 'sent_to_entity' | 'verified' | 'rejected';
}

interface PaymentStepProps {
  totalFees: number;
  requiredDocuments: RequiredDocument[];
  uploadedFiles: UploadedFile[];
  onPaymentComplete: (paymentData: any) => void;
}

export function PaymentStep({
  totalFees,
  requiredDocuments,
  uploadedFiles,
  onPaymentComplete
}: PaymentStepProps) {
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Calculate fees by entity
  const feesByEntity = requiredDocuments.reduce((acc, doc) => {
    if (!acc[doc.legalEntityName]) {
      acc[doc.legalEntityName] = [];
    }
    if (doc.fee && doc.fee > 0) {
      acc[doc.legalEntityName].push(doc);
    }
    return acc;
  }, {} as Record<string, RequiredDocument[]>);

  // Pre-flight check
  const requiredDocs = requiredDocuments.filter(doc => doc.isRequired);
  const uploadedRequiredDocs = uploadedFiles.filter(file => 
    requiredDocs.some(doc => doc.id === file.documentId) && file.status === 'uploaded'
  );
  const missingDocs = requiredDocs.filter(doc => 
    !uploadedFiles.some(file => file.documentId === doc.id && file.status === 'uploaded')
  );

  const canProceedWithPayment = missingDocs.length === 0;

  const handlePayNow = async () => {
    if (!canProceedWithPayment) {
      toast({
        title: "Missing required documents",
        description: "Please upload all required documents before proceeding with payment",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Bypass payment - simulate successful payment immediately
    try {
      toast({
        title: "Payment processing...",
        description: "Simulating payment completion for demo purposes",
      });

      // Simulate payment completion after a short delay
      setTimeout(() => {
        onPaymentComplete({
          paymentIntentId: 'demo_pi_' + Date.now(),
          amount: totalFees,
          status: 'succeeded'
        });
        setIsProcessing(false);
        
        toast({
          title: "Payment completed",
          description: "Demo payment completed successfully. Proceeding to next step.",
        });
      }, 1500);

    } catch (error) {
      console.error('Payment simulation error:', error);
      toast({
        title: "Payment simulation failed",
        description: "Failed to simulate payment. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Summary
          </CardTitle>
          <CardDescription>
            Review fees and complete payment to proceed with document processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Pre-flight Check */}
          {!canProceedWithPayment && (
            <div className="mb-6 p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Missing Required Documents</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    You must upload the following documents before proceeding with payment:
                  </p>
                  <ul className="list-disc list-inside text-sm text-yellow-700 mt-2">
                    {missingDocs.map(doc => (
                      <li key={doc.id}>{doc.name} ({doc.legalEntityName})</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Fee Breakdown by Entity */}
          <div className="space-y-4">
            <h4 className="font-medium">Processing Fees by Legal Entity</h4>
            {Object.entries(feesByEntity).map(([entityName, docs]) => {
              const entityTotal = docs.reduce((sum, doc) => sum + (doc.fee || 0), 0);
              
              return (
                <Card key={entityName} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        <h5 className="font-medium">{entityName}</h5>
                      </div>
                      <div className="flex items-center gap-1 font-medium text-primary">
                        <DollarSign className="h-4 w-4" />
                        ${(entityTotal / 100).toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {docs.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <FileText className="h-3 w-3 text-muted-foreground" />
                            <span>{doc.name}</span>
                            {uploadedFiles.some(file => file.documentId === doc.id) && (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            )}
                          </div>
                          <span className="text-muted-foreground">
                            ${(doc.fee! / 100).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Total */}
          <Separator className="my-6" />
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-lg">Total Amount</h4>
              <p className="text-sm text-muted-foreground">All processing fees included</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-2xl font-bold text-primary">
                <DollarSign className="h-6 w-6" />
                ${(totalFees / 100).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">USD</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Payment Method</CardTitle>
          <CardDescription>Choose your preferred payment method</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className={`cursor-pointer transition-all ${
                paymentMethod === 'stripe' 
                  ? 'ring-2 ring-primary border-primary bg-primary/5' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => setPaymentMethod('stripe')}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Credit/Debit Card</h4>
                    <p className="text-xs text-muted-foreground">Secure payment via Stripe</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${
                paymentMethod === 'paypal' 
                  ? 'ring-2 ring-primary border-primary bg-primary/5' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => setPaymentMethod('paypal')}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-xs">PP</span>
                  </div>
                  <div>
                    <h4 className="font-medium">PayPal</h4>
                    <p className="text-xs text-muted-foreground">Pay with PayPal account</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Payment Action */}
      <div className="flex justify-center">
        <Button
          onClick={handlePayNow}
          disabled={!canProceedWithPayment || isProcessing || totalFees === 0}
          variant="action"
          size="lg"
          className="min-w-48"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Pay ${(totalFees / 100).toFixed(2)} Now
            </div>
          )}
        </Button>
      </div>

      {totalFees === 0 && (
        <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h4 className="font-medium text-green-800">No Payment Required</h4>
          <p className="text-sm text-green-700">All selected documents are free of charge</p>
        </div>
      )}
    </div>
  );
}
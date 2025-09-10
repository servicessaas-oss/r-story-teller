import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, FileText, Building2, Clock, ArrowRight, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const sessionId = searchParams.get('session_id');
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError('No payment session found');
        setIsVerifying(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { session_id: sessionId }
        });

        if (error) throw error;

        if (data.success) {
          setVerificationResult(data);
          toast({
            title: "Payment Verified!",
            description: `Payment completed successfully for stage ${data.stage_number}`,
          });
        } else {
          setError('Payment verification failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setError('Failed to verify payment');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, toast]);

  const handleReturnToWorkflow = () => {
    // Check if there's a stored return URL
    const pendingPayment = sessionStorage.getItem('pendingPayment');
    if (pendingPayment) {
      const paymentData = JSON.parse(pendingPayment);
      sessionStorage.removeItem('pendingPayment');
      navigate(paymentData.returnUrl || '/');
    } else {
      navigate('/');
    }
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-medium mb-2 text-red-700">No Payment Session</h2>
            <p className="text-sm text-muted-foreground mb-4">No payment session found in URL</p>
            <Button onClick={() => navigate('/')} variant="outline">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-lg font-medium mb-2">Verifying Payment...</h2>
            <p className="text-sm text-muted-foreground">Please wait while we confirm your payment.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-medium mb-2 text-red-700">Payment Verification Failed</h2>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate('/')} variant="outline">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50">
      <Card className="max-w-lg w-full">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-green-700 mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground">
              Your payment has been processed and verified successfully.
            </p>
          </div>

          {verificationResult && (
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-700">Envelope ID:</span>
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    {verificationResult.envelope_id}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-green-700">Stage:</span>
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    Stage {verificationResult.stage_number}
                  </Badge>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                The sequential workflow will now continue to the next stage automatically.
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleReturnToWorkflow}
              className="w-full"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Return to Workflow
            </Button>
            <Button 
              onClick={() => navigate('/')} 
              variant="outline" 
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
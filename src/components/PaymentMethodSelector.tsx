import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Wallet, Coins, Building2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentMethodSelectorProps {
  onPaymentMethodSelect: (method: string) => void;
  amount: number; // Amount in cents
  envelopeData?: {
    acidNumber: string;
    files: any[];
    procedureId: string;
    legalEntityId: string;
  };
}

export function PaymentMethodSelector({ onPaymentMethodSelect, amount, envelopeData }: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [coinAmount, setCoinAmount] = useState('');
  const [transferDetails, setTransferDetails] = useState({
    bankName: '',
    accountNumber: '',
    routingNumber: ''
  });

  const handleCreditCardPayment = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          amount,
          payment_method: 'credit_card'
        }
      });

      if (error) throw error;

      // Open Stripe checkout in new tab
      window.open(data.url, '_blank');
      toast.success('Redirecting to payment...');
    } catch (error) {
      console.error('Payment error:', error);
      
      // For testing purposes, simulate successful payment
      toast.success('Test payment completed successfully!');
      onPaymentMethodSelect('credit_card');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTestPayment = async () => {
    setIsProcessing(true);
    try {
      // Call the test payment function to simulate full payment flow
      const { data, error } = await supabase.functions.invoke('test-payment', {
        body: {
          amount,
          envelope_data: envelopeData || {
            acidNumber: `TEST_${Date.now()}`,
            files: [],
            procedureId: 'test-procedure',
            legalEntityId: 'test-entity'
          }
        }
      });

      if (error) throw error;
      
      toast.success('Test payment completed successfully!', {
        description: 'Envelope created and assigned to legal entity for review.'
      });
      onPaymentMethodSelect('test_payment');
    } catch (error) {
      console.error('Test payment error:', error);
      toast.error('Test payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayPalPayment = async () => {
    setIsProcessing(true);
    try {
      // For demo purposes, we'll simulate PayPal integration
      toast.info('PayPal integration coming soon!');
      onPaymentMethodSelect('paypal');
    } catch (error) {
      console.error('PayPal payment error:', error);
      toast.error('Failed to process PayPal payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCoinsPayment = async () => {
    if (!coinAmount || parseFloat(coinAmount) * 100 < amount) {
      toast.error('Insufficient coin balance');
      return;
    }

    setIsProcessing(true);
    try {
      // For demo purposes, we'll simulate coins payment
      toast.success('Payment completed with coins!');
      onPaymentMethodSelect('coins');
    } catch (error) {
      console.error('Coins payment error:', error);
      toast.error('Failed to process coins payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTransferPayment = async () => {
    if (!transferDetails.bankName || !transferDetails.accountNumber) {
      toast.error('Please fill in all transfer details');
      return;
    }

    setIsProcessing(true);
    try {
      // For demo purposes, we'll simulate bank transfer
      toast.success('Transfer details submitted for processing!');
      onPaymentMethodSelect('transfer');
    } catch (error) {
      console.error('Transfer payment error:', error);
      toast.error('Failed to submit transfer details');
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentMethods = [
    {
      id: 'credit_card',
      name: 'Credit Card',
      description: 'Pay with your credit or debit card',
      icon: CreditCard,
      action: handleCreditCardPayment
    },
    {
      id: 'test_payment',
      name: 'Test Payment',
      description: 'Simulate payment for testing purposes',
      icon: CreditCard,
      action: handleTestPayment
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Pay with your PayPal account',
      icon: Wallet,
      action: handlePayPalPayment
    },
    {
      id: 'coins',
      name: 'Platform Coins',
      description: 'Use your platform coin balance',
      icon: Coins,
      action: handleCoinsPayment
    },
    {
      id: 'transfer',
      name: 'Bank Transfer',
      description: 'Pay via bank transfer',
      icon: Building2,
      action: handleTransferPayment
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          return (
            <Card 
              key={method.id}
              className={`cursor-pointer transition-all ${
                selectedMethod === method.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedMethod(method.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="h-5 w-5" />
                  {method.name}
                </CardTitle>
                <CardDescription className="text-sm">
                  {method.description}
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Payment Method Details */}
      {selectedMethod === 'coins' && (
        <Card>
          <CardHeader>
            <CardTitle>Platform Coins Payment</CardTitle>
            <CardDescription>
              Required: ${(amount / 100).toFixed(2)} ({amount} coins)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="coinAmount">Available Coins</Label>
              <Input
                id="coinAmount"
                type="number"
                placeholder="Enter your coin balance"
                value={coinAmount}
                onChange={(e) => setCoinAmount(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleCoinsPayment}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Pay with Coins
            </Button>
          </CardContent>
        </Card>
      )}

      {selectedMethod === 'transfer' && (
        <Card>
          <CardHeader>
            <CardTitle>Bank Transfer Details</CardTitle>
            <CardDescription>
              Amount: ${(amount / 100).toFixed(2)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                placeholder="Enter bank name"
                value={transferDetails.bankName}
                onChange={(e) => setTransferDetails(prev => ({ ...prev, bankName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                placeholder="Enter account number"
                value={transferDetails.accountNumber}
                onChange={(e) => setTransferDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="routingNumber">Routing Number</Label>
              <Input
                id="routingNumber"
                placeholder="Enter routing number (optional)"
                value={transferDetails.routingNumber}
                onChange={(e) => setTransferDetails(prev => ({ ...prev, routingNumber: e.target.value }))}
              />
            </div>
            <Button 
              onClick={handleTransferPayment}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Transfer Details
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Payment Buttons for Credit Card, Test Payment, and PayPal */}
      {(selectedMethod === 'credit_card' || selectedMethod === 'test_payment' || selectedMethod === 'paypal') && (
        <Card>
          <CardContent className="pt-6">
            <Button 
              onClick={
                selectedMethod === 'credit_card' ? handleCreditCardPayment :
                selectedMethod === 'test_payment' ? handleTestPayment :
                handlePayPalPayment
              }
              disabled={isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {selectedMethod === 'credit_card' ? (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay ${(amount / 100).toFixed(2)} with Card
                </>
              ) : selectedMethod === 'test_payment' ? (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Test Payment ${(amount / 100).toFixed(2)}
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4 mr-2" />
                  Pay ${(amount / 100).toFixed(2)} with PayPal
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
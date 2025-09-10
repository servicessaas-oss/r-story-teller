import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, Key, Check, Clock, AlertCircle } from 'lucide-react';
import { useBlockchainSigning } from '@/hooks/useBlockchainSigning';
import { toast } from 'sonner';

interface BlockchainSigningButtonProps {
  envelopeId: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function BlockchainSigningButton({ 
  envelopeId, 
  variant = 'default', 
  size = 'default',
  className = ''
}: BlockchainSigningButtonProps) {
  const { 
    wallet, 
    loading, 
    generateWallet, 
    signDocument, 
    getEnvelopeSignatures,
    isDocumentSigned,
    getStoredPrivateKey 
  } = useBlockchainSigning();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [signatures, setSignatures] = useState<any[]>([]);
  const [isSigned, setIsSigned] = useState(false);
  const [hasWallet, setHasWallet] = useState(false);

  useEffect(() => {
    checkSignatureStatus();
    checkWalletStatus();
  }, [envelopeId]);

  const checkSignatureStatus = async () => {
    try {
      const signed = await isDocumentSigned(envelopeId);
      setIsSigned(signed);
      
      const sigs = await getEnvelopeSignatures(envelopeId);
      setSignatures(sigs);
    } catch (error) {
      console.error('Error checking signature status:', error);
    }
  };

  const checkWalletStatus = () => {
    const privateKey = getStoredPrivateKey();
    setHasWallet(!!privateKey);
  };

  const handleGenerateWallet = async () => {
    try {
      await generateWallet();
      setHasWallet(true);
      toast.success('Blockchain wallet generated! You can now sign documents.');
    } catch (error) {
      console.error('Error generating wallet:', error);
    }
  };

  const handleSignDocument = async () => {
    try {
      await signDocument(envelopeId);
      await checkSignatureStatus();
      setIsDialogOpen(false);
      toast.success('Document signed successfully on blockchain!');
    } catch (error) {
      console.error('Error signing document:', error);
    }
  };

  const getButtonContent = () => {
    if (isSigned) {
      return (
        <>
          <Check className="h-4 w-4 mr-2" />
          Signed on Blockchain
        </>
      );
    }
    
    return (
      <>
        <Shield className="h-4 w-4 mr-2" />
        Sign with Blockchain
      </>
    );
  };

  const getButtonVariant = () => {
    if (isSigned) return 'outline';
    return variant;
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={getButtonVariant()} 
          size={size}
          className={className}
          disabled={loading}
        >
          {getButtonContent()}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Blockchain Document Signing
          </DialogTitle>
          <DialogDescription>
            Sign this document securely using blockchain technology for immutable proof of authenticity.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Wallet Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Key className="h-4 w-4" />
                Blockchain Wallet Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasWallet ? (
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <Check className="h-3 w-3 mr-1" />
                    Wallet Ready
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    You have a blockchain wallet configured for signing
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      No Wallet
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Generate a blockchain wallet to start signing documents
                    </span>
                  </div>
                  <Button 
                    onClick={handleGenerateWallet}
                    disabled={loading}
                    size="sm"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Generate Blockchain Wallet
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Document Signature Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Document Signature Status</CardTitle>
            </CardHeader>
            <CardContent>
              {isSigned ? (
                <div className="space-y-3">
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <Check className="h-3 w-3 mr-1" />
                    Document Signed
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    You have already signed this document on the blockchain.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending Signature
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    This document is waiting for your blockchain signature.
                  </p>
                  {hasWallet && (
                    <Button 
                      onClick={handleSignDocument}
                      disabled={loading}
                      className="w-full"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Sign Document on Blockchain
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Existing Signatures */}
          {signatures.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">All Blockchain Signatures</CardTitle>
                <CardDescription>
                  {signatures.length} signature{signatures.length !== 1 ? 's' : ''} on this document
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {signatures.map((sig) => (
                    <div key={sig.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">
                          {sig.profiles?.full_name || sig.profiles?.email || 'Unknown User'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Signed: {new Date(sig.created_at).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {sig.signature_data?.signerAddress}
                        </p>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

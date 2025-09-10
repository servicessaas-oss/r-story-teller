import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface BlockchainWallet {
  address: string;
  publicKey: string;
  privateKey?: string;
}

export interface SignatureResult {
  signatureId: string;
  documentHash: string;
  signature: string;
  timestamp: string;
}

export const useBlockchainSigning = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState<BlockchainWallet | null>(null);

  // Generate or retrieve blockchain wallet
  const generateWallet = async (): Promise<BlockchainWallet> => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-blockchain-wallet', {
        body: {},
      });

      if (error) throw error;

      const walletData: BlockchainWallet = {
        address: data.address,
        publicKey: data.publicKey,
        privateKey: data.privateKey
      };

      // Store private key securely in localStorage (in production, consider more secure storage)
      if (data.privateKey) {
        localStorage.setItem(`blockchain_private_key_${user.id}`, data.privateKey);
      }

      setWallet(walletData);
      toast.success('Blockchain wallet generated successfully');
      return walletData;
    } catch (error) {
      console.error('Error generating wallet:', error);
      toast.error('Failed to generate blockchain wallet');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get stored private key from localStorage
  const getStoredPrivateKey = (): string | null => {
    if (!user) return null;
    return localStorage.getItem(`blockchain_private_key_${user.id}`);
  };

  // Sign a document using blockchain
  const signDocument = async (envelopeId: string): Promise<SignatureResult> => {
    if (!user) throw new Error('User not authenticated');

    const privateKey = getStoredPrivateKey();
    if (!privateKey) {
      throw new Error('No blockchain private key found. Please generate a wallet first.');
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('sign-document-blockchain', {
        body: {
          envelopeId,
          privateKey
        },
      });

      if (error) throw error;

      toast.success('Document signed successfully on blockchain');
      return data as SignatureResult;
    } catch (error) {
      console.error('Error signing document:', error);
      toast.error('Failed to sign document on blockchain');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get blockchain signatures for an envelope
  const getEnvelopeSignatures = async (envelopeId: string) => {
    try {
      const { data, error } = await supabase
        .from('blockchain_signatures')
        .select(`
          *,
          profiles!fk_blockchain_signatures_user_id(full_name, email, blockchain_address)
        `)
        .eq('envelope_id', envelopeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching signatures:', error);
      throw error;
    }
  };

  // Check if document is signed by current user
  const isDocumentSigned = async (envelopeId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('blockchain_signatures')
        .select('id')
        .eq('envelope_id', envelopeId)
        .eq('user_id', user.id)
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  };

  return {
    wallet,
    loading,
    generateWallet,
    signDocument,
    getEnvelopeSignatures,
    isDocumentSigned,
    getStoredPrivateKey
  };
};
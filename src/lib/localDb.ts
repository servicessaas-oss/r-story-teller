import { LocalTable } from './localStorage';

// Database schemas matching Supabase structure
export interface LocalEnvelope {
  id: string;
  user_id: string;
  procedure_id?: string;
  total_amount: number;
  files: any[];
  legal_entity_id: string;
  acid_number: string;
  status: string;
  payment_status: string;
  payment_method?: string;
  stripe_payment_intent_id?: string;
  workflow_stages: any[];
  workflow_history: any[];
  assigned_legal_entity_id?: string;
  next_legal_entity_id?: string;
  workflow_status: string;
  current_stage: number;
  signed_at?: string;
  signed_by_legal_entity_id?: string;
  is_draft: boolean;
  created_at: string;
  updated_at: string;
}

export interface LocalPayment {
  id: string;
  envelope_id?: string;
  user_id?: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  stripe_payment_intent_id?: string;
  paypal_order_id?: string;
  transaction_id?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface LocalEnvelopeAssignment {
  id: string;
  envelope_id: string;
  legal_entity_id: string;
  assigned_by?: string;
  assigned_at: string;
  status: string;
  processed_at?: string;
  processed_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface LocalBlockchainSignature {
  id: string;
  envelope_id: string;
  user_id: string;
  blockchain_tx_hash?: string;
  signature_hash: string;
  signature_type: string;
  public_key?: string;
  is_verified: boolean;
  verified_at?: string;
  signature_data: any;
  created_at: string;
}

export interface LocalConversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LocalMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  attachments: any[];
  read_at?: string;
  created_at: string;
}

export interface LocalLegalEntityEmail {
  id: string;
  sender_id: string;
  recipient_legal_entity_id: string;
  cc_legal_entities: string[];
  subject: string;
  content: string;
  attachments: any[];
  status: string;
  sent_at: string;
  created_at: string;
}

// Database tables
export const localDb = {
  envelopes: new LocalTable<LocalEnvelope>('envelopes'),
  payments: new LocalTable<LocalPayment>('payments'),
  envelope_assignments: new LocalTable<LocalEnvelopeAssignment>('envelope_assignments'),
  blockchain_signatures: new LocalTable<LocalBlockchainSignature>('blockchain_signatures'),
  conversations: new LocalTable<LocalConversation>('conversations'),
  messages: new LocalTable<LocalMessage>('messages'),
  legal_entity_emails: new LocalTable<LocalLegalEntityEmail>('legal_entity_emails'),
};

// Initialize with sample data
export async function initializeLocalDb() {
  // Check if already initialized
  const envelopes = await localDb.envelopes.select();
  if (envelopes.length > 0) return;

  // Initialize with sample envelope data if needed
  console.log('Initializing local database with sample data...');
}

// Mock edge functions
export const localFunctions = {
  async invoke(functionName: string, { body }: { body: any }) {
    console.log(`Mock function call: ${functionName}`, body);
    
    switch (functionName) {
      case 'create-payment':
        return {
          data: { 
            checkout_url: `https://mock-stripe.com/checkout/${Date.now()}`,
            session_id: `mock_session_${Date.now()}`
          },
          error: null
        };
        
      case 'test-payment':
        // Simulate payment success
        const envelope = await localDb.envelopes.selectSingle({ id: body.envelope_data.envelope_id });
        if (envelope) {
          // Create payment record
          await localDb.payments.insert({
            envelope_id: envelope.id,
            user_id: envelope.user_id,
            amount: body.amount,
            currency: 'USD',
            payment_method: 'test_payment',
            status: 'completed',
            transaction_id: `test_${Date.now()}`,
            metadata: body,
          });
        }
        return { data: { success: true }, error: null };
        
      case 'verify-payment':
        return { data: { status: 'completed' }, error: null };
        
      case 'create-legal-entity-accounts':
        return { data: { success: true, message: 'Accounts created' }, error: null };
        
      case 'send-legal-entity-email':
        await localDb.legal_entity_emails.insert({
          sender_id: body.sender_id || 'current_user',
          recipient_legal_entity_id: body.recipient_legal_entity_id,
          cc_legal_entities: body.cc_legal_entities || [],
          subject: body.subject,
          content: body.content,
          attachments: body.attachments || [],
          status: 'sent',
          sent_at: new Date().toISOString(),
        });
        return { data: { success: true }, error: null };
        
      case 'generate-blockchain-wallet':
        return {
          data: {
            address: `0x${Date.now().toString(16)}`,
            publicKey: `pub_${Date.now()}`,
            privateKey: `priv_${Date.now()}`
          },
          error: null
        };
        
      case 'sign-document-blockchain':
        await localDb.blockchain_signatures.insert({
          envelope_id: body.envelope_id,
          user_id: body.user_id || 'current_user',
          signature_hash: `sig_${Date.now()}`,
          signature_type: 'ethereum',
          public_key: body.public_key,
          is_verified: true,
          verified_at: new Date().toISOString(),
          signature_data: body,
        });
        return { data: { success: true }, error: null };
        
      default:
        return { data: null, error: new Error(`Unknown function: ${functionName}`) };
    }
  }
};
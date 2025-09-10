import { useState, useEffect } from "react";
import { WorldClock } from "@/components/WorldClock";
import { Dashboard } from "@/components/Dashboard";
import { DashboardAnalytics } from "@/components/DashboardAnalytics";
import { LegalEntities } from "@/components/LegalEntities";
import { EnhancedInbox } from "@/components/EnhancedInbox";
import { SimpleLegalEntityMessaging } from "@/components/SimpleLegalEntityMessaging";
import { ArchiveManager } from "@/components/ArchiveManager";
import { UserProfile } from "@/components/UserProfile";
import { SettingsPage } from "@/components/SettingsPage";
import { SequentialWorkflowComposer } from "@/components/SequentialWorkflowComposer";
import { MessagingCenter } from "@/components/MessagingCenter";
import { type Good, type RequiredDocument } from "@/data/procedureData";
import { PaymentSuccess } from "@/components/PaymentSuccess";
import { SendAndSign } from "@/components/SendAndSign";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { SentConfirmation } from "@/components/SentConfirmation";

import { ActiveWorkflowsDashboard } from "@/components/ActiveWorkflowsDashboard";
import { useUserEnvelopes } from "@/hooks/useUserEnvelopes";
import { NavigationProvider, useNavigation } from "@/contexts/NavigationContext";
import { useKeyboardShortcuts, createAppShortcuts } from "@/hooks/useKeyboardShortcuts";

type AppState = 'dashboard' | 'compose' | 'send-sign' | 'progress' | 'sent' | 'legal-entities' | 'inbox' | 'messages' | 'profile' | 'settings' | 'payment-success';

interface UploadedFile {
  id: string;
  name: string;
  type?: string;
  certificateNumber?: string;
  documentId?: string;
}

interface WorkflowData {
  procedureType: 'export' | 'import';
  selectedGoods: Good[];
  requiredDocuments: RequiredDocument[];
  totalFees: number;
}

interface Envelope {
  id: string;
  recipient: string;
  status: 'draft' | 'pending_payment' | 'sent' | 'under_review' | 'approved' | 'rejected' | 'amendments_requested' | 'completed' | 'signed_and_approved';
  files: UploadedFile[];
  acidNumber: string;
  date: string;
  procedureId?: string;
  legalEntityId?: string;
  paymentMethod?: string;
  totalAmount?: number;
}

const sectionLabels: Record<string, string> = {
  'dashboard': 'Dashboard',
  'compose': 'Compose Envelope',
  'legal-entities': 'Legal Entities',
  'inbox': 'Messages & Documents',
  'messages': 'Chat',
  'profile': 'User Profile',
  'settings': 'Settings'
};

function PrimesayCargoInner({ onSignOut }: { onSignOut?: () => void }) {
  const [appState, setAppState] = useState<AppState>('dashboard');
  const [currentSection, setCurrentSection] = useState('dashboard');
  const { envelopes: dbEnvelopes, loading: envelopesLoading } = useUserEnvelopes();
  const [envelopeData, setEnvelopeData] = useState<{
    files: UploadedFile[];
    acidNumber: string;
    procedureId?: string;
    legalEntityId?: string;
    paymentMethod?: string;
    totalAmount?: number;
  } | null>(null);
  
  // Transform database envelopes to dashboard format
  const envelopes: Envelope[] = dbEnvelopes.map(envelope => ({
    id: envelope.id,
    recipient: envelope.legal_entity_id || 'Processing Entity',
    status: envelope.status as any,
    files: envelope.files || [],
    acidNumber: envelope.acid_number,
    date: new Date(envelope.created_at).toISOString().split('T')[0],
    procedureId: envelope.procedure_id,
    legalEntityId: envelope.legal_entity_id,
    totalAmount: envelope.total_amount
  }));

  const { updateBreadcrumbs, updateScrollPosition, getScrollPosition } = useNavigation();

  // Generate breadcrumbs based on current section
  const generateBreadcrumbs = (section: string) => {
    const breadcrumbs = [
      { label: 'Dashboard', onClick: () => handleNavigate('dashboard') }
    ];

    if (section !== 'dashboard') {
      breadcrumbs.push({ 
        label: sectionLabels[section] || section,
        onClick: undefined // Current page, no click handler
      });
    }

    return breadcrumbs;
  };

  // Set up keyboard shortcuts
  const shortcuts = createAppShortcuts({
    onNewEnvelope: () => handleCompose(),
    onStartChat: () => handleNavigate('inbox'),
    onSearch: () => {}, // Handled in SearchDialog
    onGoToDashboard: () => handleNavigate('dashboard'),
    onGoToInbox: () => handleNavigate('inbox'),
    onGoToDrafts: () => handleNavigate('inbox'), // Drafts now in inbox
    onGoToArchive: () => handleNavigate('inbox') // Archive now in inbox
  });

  useKeyboardShortcuts({ 
    shortcuts, 
    enabled: appState === 'dashboard' || appState === 'compose' || appState === 'inbox' || appState === 'messages' || appState === 'legal-entities' || appState === 'profile' || appState === 'settings'
  });

  // Transform envelopes for Dashboard compatibility
  const getCompatibleEnvelopes = (envelopes: Envelope[]) => {
    return envelopes.map(envelope => ({
      id: envelope.id,
      recipient: envelope.recipient,
      status: envelope.status === 'completed' ? 'sent' as const : envelope.status,
      files: envelope.files,
      acidNumber: envelope.acidNumber,
      date: envelope.date
    }));
  };

  // Update breadcrumbs when section changes
  useEffect(() => {
    const breadcrumbs = generateBreadcrumbs(currentSection);
    updateBreadcrumbs(breadcrumbs);
  }, [currentSection, updateBreadcrumbs]);

  // Context-preserving scroll position restoration
  useEffect(() => {
    if (appState === 'dashboard') {
      const savedScrollPosition = getScrollPosition(currentSection);
      setTimeout(() => {
        window.scrollTo(0, savedScrollPosition);
      }, 100);
    }
  }, [appState, currentSection, getScrollPosition]);

  // Save scroll position before navigation
  const handleNavigateWithScrollSave = (section: string) => {
    if (typeof window !== 'undefined') {
      updateScrollPosition(currentSection, window.scrollY);
    }
    handleNavigate(section);
  };

  const handleLogin = (email: string) => {
    // No longer needed - authentication handled at Index level
  };

  const handleVerification = () => {
    // No longer needed - authentication handled at Index level
  };

  const handleBackToLogin = () => {
    // No longer needed - authentication handled at Index level
  };

  const handleCompose = () => {
    setCurrentSection('compose');
    setAppState('compose');
  };

  const handleNavigate = (section: string) => {
    setCurrentSection(section);
    setAppState(section as AppState);
  };

  const handleSendAndSign = (files: UploadedFile[], acidNumber: string, workflowData: WorkflowData) => {
    setEnvelopeData({ 
      files, 
      acidNumber, 
      procedureId: workflowData.procedureType,
      legalEntityId: workflowData.requiredDocuments[0]?.legalEntityName || '',
      totalAmount: workflowData.totalFees
    });
    setAppState('send-sign');
  };

  const handlePaymentRequired = (envelopeData: any) => {
    // For demo purposes, simulate successful payment flow
    setEnvelopeData(envelopeData);
    
    // Note: In real implementation, this would create an envelope in the database
    // The database envelopes will be automatically updated via real-time subscription
    setAppState('payment-success');
  };

  const handleSign = () => {
    setAppState('progress');
  };

  const handleProgressComplete = () => {
    if (envelopeData) {
      // Note: In real implementation, this would update the envelope in the database
      // The database envelopes will be automatically updated via real-time subscription
    }
    setAppState('sent');
  };

  const handleBackToDashboard = () => {
    setCurrentSection('dashboard');
    setAppState('dashboard');
    setEnvelopeData(null);
  };

  const handleEntitySelect = (entityId: string) => {
    setCurrentSection('compose');
    setAppState('compose');
  };

  const handleReplyToMessage = (messageId: string) => {
    console.log('Reply to message:', messageId);
  };

  const handleEditDraft = (draftId: string) => {
    setCurrentSection('compose');
    setAppState('compose');
  };

  const handleUnarchive = (envelopeId: string) => {
    console.log('Unarchive envelope:', envelopeId);
  };

  const handleDownloadArchive = (envelopeId: string) => {
    console.log('Download archive:', envelopeId);
  };

  const handleSendToEntity = (entityId: string) => {
    setCurrentSection('compose');
    setAppState('compose');
  };

  const handleBackToCompose = () => {
    setAppState('compose');
  };

  const handleProfile = () => {
    setCurrentSection('profile');
    setAppState('profile');
  };

  const handleSettings = () => {
    setCurrentSection('settings');
    setAppState('settings');
  };

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    }
  };

  // Start with dashboard instead of login
  if (appState === 'dashboard') {
    return (
      <>
        <Dashboard
          onCompose={handleCompose}
          onNavigate={handleNavigateWithScrollSave}
          currentSection={currentSection}
          envelopes={getCompatibleEnvelopes(envelopes)}
          onSendToEntity={handleSendToEntity}
          onProfile={handleProfile}
          onSettings={handleSettings}
          onSignOut={handleSignOut}
          breadcrumbs={generateBreadcrumbs(currentSection)}
        >
          <ActiveWorkflowsDashboard onCompose={handleCompose} />
        </Dashboard>
        <WorldClock />
      </>
    );
  }

  if (appState === 'compose') {
    return (
      <>
        <Dashboard
          onCompose={handleCompose}
          onNavigate={handleNavigateWithScrollSave}
          currentSection={currentSection}
          envelopes={getCompatibleEnvelopes(envelopes)}
          onSendToEntity={handleSendToEntity}
          onProfile={handleProfile}
          onSettings={handleSettings}
          onSignOut={handleSignOut}
          breadcrumbs={generateBreadcrumbs(currentSection)}
        >
          <SequentialWorkflowComposer />
        </Dashboard>
        <WorldClock />
      </>
    );
  }

  if (appState === 'legal-entities') {
    return (
      <>
        <Dashboard
          onCompose={handleCompose}
          onNavigate={handleNavigateWithScrollSave}
          currentSection={currentSection}
          envelopes={getCompatibleEnvelopes(envelopes)}
          onSendToEntity={handleSendToEntity}
          onProfile={handleProfile}
          onSettings={handleSettings}
          onSignOut={handleSignOut}
          breadcrumbs={generateBreadcrumbs(currentSection)}
        >
          <LegalEntities onEntitySelect={handleEntitySelect} onBack={() => handleNavigateWithScrollSave('dashboard')} />
        </Dashboard>
        <WorldClock />
      </>
    );
  }

  if (appState === 'inbox') {
    return (
      <>
        <Dashboard
          onCompose={handleCompose}
          onNavigate={handleNavigateWithScrollSave}
          currentSection={currentSection}
          envelopes={getCompatibleEnvelopes(envelopes)}
          onSendToEntity={handleSendToEntity}
          onProfile={handleProfile}
          onSettings={handleSettings}
          onSignOut={handleSignOut}
          breadcrumbs={generateBreadcrumbs(currentSection)}
        >
          <SimpleLegalEntityMessaging />
        </Dashboard>
        <WorldClock />
      </>
    );
  }

  if (appState === 'messages') {
    return (
      <>
        <Dashboard
          onCompose={handleCompose}
          onNavigate={handleNavigateWithScrollSave}
          currentSection={currentSection}
          envelopes={getCompatibleEnvelopes(envelopes)}
          onSendToEntity={handleSendToEntity}
          onProfile={handleProfile}
          onSettings={handleSettings}
          onSignOut={handleSignOut}
          breadcrumbs={generateBreadcrumbs(currentSection)}
        >
          <MessagingCenter />
        </Dashboard>
        <WorldClock />
      </>
    );
  }

  if (appState === 'profile') {
    return (
      <>
        <Dashboard
          onCompose={handleCompose}
          onNavigate={handleNavigateWithScrollSave}
          currentSection={currentSection}
          envelopes={getCompatibleEnvelopes(envelopes)}
          onSendToEntity={handleSendToEntity}
          onProfile={handleProfile}
          onSettings={handleSettings}
          onSignOut={handleSignOut}
          breadcrumbs={generateBreadcrumbs(currentSection)}
        >
          <UserProfile onBack={() => handleNavigateWithScrollSave('dashboard')} />
        </Dashboard>
        <WorldClock />
      </>
    );
  }

  if (appState === 'settings') {
    return (
      <>
        <Dashboard
          onCompose={handleCompose}
          onNavigate={handleNavigateWithScrollSave}
          currentSection={currentSection}
          envelopes={getCompatibleEnvelopes(envelopes)}
          onSendToEntity={handleSendToEntity}
          onProfile={handleProfile}
          onSettings={handleSettings}
          onSignOut={handleSignOut}
          breadcrumbs={generateBreadcrumbs(currentSection)}
        >
          <SettingsPage onBack={() => handleNavigateWithScrollSave('dashboard')} />
        </Dashboard>
        <WorldClock />
      </>
    );
  }

  if (appState === 'send-sign' && envelopeData) {
    return (
      <div className="min-h-screen bg-background py-8">
        <SendAndSign
          files={envelopeData.files}
          acidNumber={envelopeData.acidNumber}
          onSign={handleSign}
          onBack={handleBackToCompose}
        />
      </div>
    );
  }

  if (appState === 'progress' && envelopeData) {
    return (
      <div className="min-h-screen bg-background py-20">
        <ProgressIndicator
          files={envelopeData.files}
          onComplete={handleProgressComplete}
        />
      </div>
    );
  }

  if (appState === 'sent' && envelopeData) {
    return (
      <div className="min-h-screen bg-background py-8">
        <SentConfirmation
          files={envelopeData.files}
          acidNumber={envelopeData.acidNumber}
          onBackToDashboard={handleBackToDashboard}
        />
      </div>
    );
  }

  if (appState === 'payment-success' && envelopeData) {
    return (
      <div className="min-h-screen bg-background py-8">
        <PaymentSuccess />
      </div>
    );
  }

  return null;
}

export default function PrimesayCargo({ onSignOut }: { onSignOut?: () => void } = {}) {
  return (
    <NavigationProvider>
      <PrimesayCargoInner onSignOut={onSignOut} />
    </NavigationProvider>
  );
}
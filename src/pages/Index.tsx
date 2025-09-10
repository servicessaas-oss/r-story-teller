import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthPageWithPlatform } from "@/components/AuthPageWithPlatform";
import { LegalEntityPlatform } from "@/components/LegalEntityPlatform";
import { WorldClock } from "@/components/WorldClock";
import { CreateAllAccountsButton } from "@/components/CreateAllAccountsButton";
import { Button } from "@/components/ui/button";
import PrimesayCargo from "./PrimesayCargo";

function IndexInner() {
  const { user, profile, loading, signOut } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState<'user' | 'legal_entity'>('user');
  const [showAdminSetup, setShowAdminSetup] = useState(false);
  const isLegalEntity = profile?.role === 'legal_entity' || (user?.user_metadata?.role === 'legal_entity');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is authenticated, show appropriate platform based on their role
  if (user) {
    return (
      <div className="h-screen overflow-hidden">
        {isLegalEntity ? (
          <>
            <LegalEntityPlatform />
            <WorldClock />
          </>
        ) : (
          <PrimesayCargo onSignOut={signOut} />
        )}
      </div>
    );
  }

  // If showing admin setup, show the account creation interface
  if (showAdminSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Admin Setup - Legal Entity Accounts</h1>
            <Button 
              variant="outline" 
              onClick={() => setShowAdminSetup(false)}
            >
              Back to Login
            </Button>
          </div>
          <CreateAllAccountsButton />
        </div>
      </div>
    );
  }

  // If not authenticated, show authentication with platform toggle
  return (
    <div className="relative">
      <AuthPageWithPlatform
        platform={selectedPlatform}
        onSuccess={() => {}}
        onBack={() => {}}
        onPlatformChange={setSelectedPlatform}
      />
      
      {/* Admin Setup Button */}
      <div className="absolute top-4 right-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowAdminSetup(true)}
          className="text-xs"
        >
          Admin Setup
        </Button>
      </div>
    </div>
  );
}

const Index = () => {
  return (
    <IndexInner />
  );
};

export default Index;
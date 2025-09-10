import { useState, useEffect } from "react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { PrimesayLogo } from "./PrimesayLogo";
import { AccountDropdown } from "./AccountDropdown";
import { useLocalAuth } from "@/contexts/LocalAuthContext";
import { useLegalEntityEnvelopes } from "@/hooks/useLegalEntityEnvelopes";

import { LegalEntityDashboard } from "./LegalEntityDashboard";
import { LegalEntityInbox } from "./LegalEntityInbox";
import { LegalEntityVerification } from "./LegalEntityVerification";
import { 
  Package, 
  FileText, 
  BarChart3, 
  Settings, 
  Building2,
  Bell
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PendingEnvelope {
  id: string;
  acid_number: string;
  files: any;
  status: string;
  payment_status: string;
  created_at: string;
  due_date?: string;
  sender_name?: string;
  priority: 'high' | 'medium' | 'low';
  document_types: string[];
}

type LegalEntitySection = 'dashboard' | 'inbox' | 'verification' | 'reports' | 'settings' | 'shared-envelopes';

interface EnvelopeStats {
  pending: number;
  reviewed: number;
  approved: number;
  rejected: number;
  overdue: number;
}

const legalEntityNavigation = [
  { title: "Dashboard", icon: Package, id: "dashboard" },
  { title: "Document Inbox", icon: FileText, id: "inbox" },
  { title: "Reports", icon: BarChart3, id: "reports" },
  { title: "Settings", icon: Settings, id: "settings" },
];

function LegalEntitySidebar({ 
  onNavigate, 
  currentSection,
  pendingCount
}: { 
  onNavigate: (section: LegalEntitySection) => void; 
  currentSection: LegalEntitySection;
  pendingCount: number;
}) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <div className={`p-3 border-b border-border ${collapsed ? 'flex justify-center' : ''}`}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-lg font-bold text-primary">Legal Entity Portal</h1>
              <p className="text-xs text-muted-foreground">Document Processing</p>
            </div>
          </div>
        )}
        {collapsed && <Building2 className="h-8 w-8 text-primary" />}
      </div>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{!collapsed && "Navigation"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {legalEntityNavigation.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onNavigate(item.id as LegalEntitySection)}
                    className={`${collapsed ? 'justify-center' : 'justify-start gap-3'} ${
                      currentSection === item.id ? "bg-primary/10 text-primary font-medium" : ""
                    } relative`}
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && <span>{item.title}</span>}
                    {item.id === 'inbox' && pendingCount > 0 && (
                      <Badge variant="destructive" className="ml-auto h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {pendingCount}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export function LegalEntityPlatform() {
  const { user, profile, signOut } = useLocalAuth();
  const { getWorkloadStats } = useLegalEntityEnvelopes();
  const [currentSection, setCurrentSection] = useState<LegalEntitySection>('dashboard');
  const [selectedEnvelope, setSelectedEnvelope] = useState<PendingEnvelope | null>(null);
  const [stats, setStats] = useState<EnvelopeStats>({
    pending: 0,
    reviewed: 0,
    approved: 0,
    rejected: 0,
    overdue: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch real workload stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const workloadStats = await getWorkloadStats();
        setStats({
          pending: workloadStats.total_pending,
          reviewed: workloadStats.total_in_review,
          approved: workloadStats.total_completed,
          rejected: 0, // This would need to be added to the workload function if needed
          overdue: workloadStats.total_overdue
        });
      } catch (error) {
        console.error('Error fetching workload stats:', error);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    if (isLegalEntity) {
      fetchStats();
    }
  }, [profile, getWorkloadStats]);

  const handleNavigate = (section: LegalEntitySection) => {
    setCurrentSection(section);
    if (section !== 'verification') {
      setSelectedEnvelope(null);
    }
  };

  const handleSelectEnvelope = (envelope: PendingEnvelope) => {
    setSelectedEnvelope(envelope);
    setCurrentSection('verification');
  };

  const handleVerificationComplete = () => {
    setSelectedEnvelope(null);
    setCurrentSection('inbox');
    
    // Refresh stats after verification
    const refreshStats = async () => {
      try {
        const workloadStats = await getWorkloadStats();
        setStats({
          pending: workloadStats.total_pending,
          reviewed: workloadStats.total_in_review,
          approved: workloadStats.total_completed,
          rejected: 0,
          overdue: workloadStats.total_overdue
        });
      } catch (error) {
        console.error('Error refreshing stats:', error);
      }
    };
    refreshStats();
  };

  const handleProfile = () => {
    console.log('Profile clicked');
  };

  const handleSettings = () => {
    setCurrentSection('settings');
  };

  const handleSignOut = async () => {
    await signOut();
  };


  const isLegalEntity = profile?.role === 'legal_entity';

  if (!isLegalEntity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md p-6 text-center">
          <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            This platform is only accessible to legal entities.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderContent = () => {
    if (currentSection === 'verification' && selectedEnvelope) {
      return (
        <LegalEntityVerification
          envelope={selectedEnvelope}
          onBack={() => setCurrentSection('inbox')}
          onComplete={handleVerificationComplete}
        />
      );
    }

    switch (currentSection) {
      case 'dashboard':
        return (
          <LegalEntityDashboard
            stats={stats}
            onNavigateToInbox={() => setCurrentSection('inbox')}
            onNavigateToVerification={() => setCurrentSection('verification')}
            onNavigateToReports={() => setCurrentSection('reports')}
          />
        );
      case 'inbox':
        return <LegalEntityInbox onSelectEnvelope={handleSelectEnvelope} />;
      case 'reports':
        return (
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Performance Reports</h3>
            <p className="text-muted-foreground">
              Detailed analytics and SLA compliance reports will be available here.
            </p>
          </div>
        );
      case 'settings':
        return (
          <div className="text-center py-12">
            <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Settings</h3>
            <p className="text-muted-foreground">
              Configure your legal entity preferences and notification settings.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <LegalEntitySidebar 
          onNavigate={handleNavigate}
          currentSection={currentSection}
          pendingCount={stats.pending}
        />

        <main className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center justify-between px-6">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4" />
              <div>
                <h2 className="text-xl font-semibold text-primary capitalize">
                  {currentSection === 'verification' && selectedEnvelope 
                    ? `Verification - ${selectedEnvelope.acid_number}`
                    : currentSection.replace('-', ' ')
                  }
                </h2>
                <p className="text-sm text-muted-foreground">
                  Welcome, {profile?.full_name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {stats.overdue}
                </Badge>
              </Button>
              
              <AccountDropdown
                userName={profile?.full_name || "Legal Entity User"}
                userEmail={profile?.email || ""}
                companyName="Legal Entity Portal"
                userRole="Legal Entity"
                profileImage="/placeholder.svg"
                notificationCount={stats.pending}
                onProfile={handleProfile}
                onSettings={handleSettings}
                onSignOut={handleSignOut}
              />
            </div>
          </header>

          <div className="flex-1 p-6 overflow-y-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
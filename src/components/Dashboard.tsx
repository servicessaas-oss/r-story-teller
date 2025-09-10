import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Edit, Inbox, FileText, Send, Archive, Package, Plus, Building2, CheckCircle, Clock, AlertCircle, Users, Bell, BarChart3, TrendingUp, Calendar, XCircle } from "lucide-react";
import { PrimesayLogo } from "./PrimesayLogo";
import { AccountDropdown } from "./AccountDropdown";
import { SmartBreadcrumbs } from "./SmartBreadcrumbs";
import { QuickActionsBar } from "./QuickActionsBar";
import { SearchDialog } from "./SearchDialog";
import { BlockchainSigningButton } from "./BlockchainSigningButton";
import { useState } from "react";

const sectionLabels: Record<string, string> = {
  'dashboard': 'Dashboard',
  'compose': 'Compose Envelope',
  'legal-entities': 'Legal Entities',
  'inbox': 'Messages & Documents',
  'messages': 'Chat',
  'profile': 'User Profile',
  'settings': 'Settings'
};

const getSectionLabel = (section: string) => {
  return sectionLabels[section] || section.replace('-', ' ');
};

interface DashboardProps {
  onCompose: () => void;
  onNavigate: (section: string) => void;
  currentSection: string;
  envelopes: Array<{
    id: string;
    recipient: string;
    status: 'draft' | 'pending_payment' | 'sent' | 'under_review' | 'approved' | 'rejected' | 'amendments_requested' | 'completed' | 'signed_and_approved';
    files: Array<{ name: string; type?: string }>;
    acidNumber: string;
    date: string;
  }>;
  onSendToEntity: (entityId: string) => void;
  onProfile: () => void;
  onSettings: () => void;
  onSignOut: () => void;
  breadcrumbs?: Array<{ label: string; onClick?: () => void }>;
  children?: React.ReactNode;
}

const navigationItems = [
  { title: "Dashboard", icon: Package, id: "dashboard" },
  { title: "Compose", icon: Edit, id: "compose" },
  { title: "Inbox", icon: Inbox, id: "inbox", badge: 5 },
  { title: "Chat", icon: Users, id: "messages", badge: 2 },
  { title: "Legal Entities", icon: Building2, id: "legal-entities" },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'sent': return <CheckCircle className="h-4 w-4 text-blue-500" />;
    case 'under_review': return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
    case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'draft': return <AlertCircle className="h-4 w-4 text-gray-500" />;
    default: return <Clock className="h-4 w-4" />;
  }
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'sent': return 'default';
    case 'under_review': return 'secondary';
    case 'approved': return 'default';
    case 'rejected': return 'destructive';
    case 'completed': return 'default';
    case 'draft': return 'outline';
    default: return 'outline';
  }
};

function SidebarComponent({ onNavigate, currentSection }: { 
  onNavigate: (section: string) => void; 
  currentSection: string;
}) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <div className={`p-3 border-b border-border ${collapsed ? 'flex justify-center' : ''}`}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <PrimesayLogo className="h-8 w-8" />
            <div>
              <h1 className="text-lg font-bold text-primary">Primesay Cargo</h1>
              <p className="text-xs text-muted-foreground">Document Transfer</p>
            </div>
          </div>
        )}
        {collapsed && <PrimesayLogo className="h-8 w-8" />}
      </div>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{!collapsed && "Navigation"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onNavigate(item.id)}
                    className={`${collapsed ? 'justify-center' : 'justify-start gap-3'} ${
                      currentSection === item.id ? "bg-primary/10 text-primary font-medium" : ""
                    } relative`}
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && <span>{item.title}</span>}
                    {item.badge && item.badge > 0 && (
                      <Badge variant="destructive" className="ml-auto h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {item.badge}
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

export function Dashboard({ onCompose, onNavigate, currentSection, envelopes, onSendToEntity, onProfile, onSettings, onSignOut, breadcrumbs = [], children }: DashboardProps) {
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);

  const handleStartChat = () => {
    // Mock chat functionality - navigate to inbox
    onNavigate('inbox');
  };

  const handleSearch = () => {
    setSearchDialogOpen(true);
  };
  return (
    <SidebarProvider>
      <div className="h-screen flex w-full bg-background overflow-hidden">
        <SidebarComponent 
          onNavigate={onNavigate}
          currentSection={currentSection}
        />

        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="h-16 border-b border-border flex items-center justify-between px-6 flex-shrink-0">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4" />
              <div className="flex flex-col">
                <SmartBreadcrumbs steps={breadcrumbs} />
                <h2 className="text-xl font-semibold text-primary capitalize">{getSectionLabel(currentSection)}</h2>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  3
                </Badge>
              </Button>
              
              <AccountDropdown
                userName="John Doe"
                userEmail="john.doe@company.com"
                companyName="Primesay Cargo Ltd."
                userRole="Manager"
                profileImage="/placeholder.svg"
                notificationCount={5}
                onProfile={onProfile}
                onSettings={onSettings}
                onSignOut={onSignOut}
              />
            </div>
          </header>

          <div className="flex-1 p-6 overflow-y-auto">
            <QuickActionsBar
              onNewEnvelope={onCompose}
              onStartChat={handleStartChat}
              onSearch={handleSearch}
              onViewDashboard={() => onNavigate('dashboard')}
              onViewInbox={() => onNavigate('inbox')}
              onViewEntities={() => onNavigate('legal-entities')}
              currentSection={currentSection}
            />

            {children ? (
              <div className="h-full">
                {children}
              </div>
            ) : currentSection === "dashboard" ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-primary">Envelope Status Dashboard</h3>
                    <p className="text-muted-foreground">Track all your document transfers</p>
                  </div>
                  <Button onClick={onCompose} variant="action">
                    <Plus className="h-4 w-4 mr-2" />
                    New Envelope
                  </Button>
                </div>
                
                <div className="grid gap-4">
                  {envelopes.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                        <h4 className="text-lg font-medium text-muted-foreground mb-2">No envelopes yet</h4>
                        <p className="text-sm text-muted-foreground mb-4">Create your first envelope to get started</p>
                        <Button onClick={onCompose} variant="action">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Envelope
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    envelopes.map((envelope) => (
                      <Card key={envelope.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">ACID: {envelope.acidNumber}</h4>
                                  <Badge variant={getStatusVariant(envelope.status)}>
                                    <div className="flex items-center gap-1">
                                      {getStatusIcon(envelope.status)}
                                      {envelope.status === 'approved' && '✅ Approved'}
                                      {envelope.status === 'rejected' && '❌ Rejected'}
                                      {envelope.status === 'under_review' && '🔍 Under Review'}
                                      {envelope.status === 'sent' && '📤 Sent'}
                                      {envelope.status === 'draft' && '📝 Draft'}
                                      {!['approved', 'rejected', 'under_review', 'sent', 'draft'].includes(envelope.status) && 
                                        envelope.status.charAt(0).toUpperCase() + envelope.status.slice(1)
                                      }
                                    </div>
                                  </Badge>
                                </div>
                              <p className="text-sm text-muted-foreground">To: {envelope.recipient}</p>
                              <p className="text-sm text-muted-foreground">
                                {envelope.files.length} document{envelope.files.length !== 1 ? 's' : ''} • {envelope.date}
                              </p>
                             </div>
                             <div className="flex items-center gap-2">
                               <BlockchainSigningButton 
                                 envelopeId={envelope.id}
                                 variant="outline"
                                 size="sm"
                               />
                               <Users className="h-4 w-4 text-muted-foreground" />
                             </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-primary capitalize">{currentSection.replace('-', ' ')}</h2>
                  <p className="text-muted-foreground">This section is not implemented yet</p>
                </div>
              </div>
            )}
          </div>
        </main>

        <SearchDialog
          open={searchDialogOpen}
          onOpenChange={setSearchDialogOpen}
          onNavigate={onNavigate}
        />
      </div>
    </SidebarProvider>
  );
}
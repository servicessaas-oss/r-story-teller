import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Inbox, 
  FileText, 
  Send, 
  Archive, 
  Search, 
  Filter,
  RefreshCw,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
  Archive as ArchiveIcon,
  Trash2
} from "lucide-react";
import { EnhancedInbox } from "./EnhancedInbox";
import { DraftsPage } from "./DraftsPage";
import { ArchiveManager } from "./ArchiveManager";
import { UserEnvelopeTracker } from "./UserEnvelopeTracker";
import { useAuth } from "@/contexts/AuthContext";

interface EnhancedInboxWithSectionsProps {
  onCompose: () => void;
  onOpenEnvelope?: (envelopeId: string) => void;
  onUnarchive?: (envelopeId: string) => void;
  onDownload?: (envelopeId: string) => void;
}

// Mock sent items data with legal entities as recipients
const mockSentItems = [
  {
    id: '1',
    recipient: 'Egyptian Customs Authority (NAFEZA)',
    legalEntityType: 'Customs Authority',
    status: 'delivered' as const,
    files: [
      { id: '1', name: 'certificate_of_origin.pdf', type: 'Certificate of Origin' },
      { id: '4', name: 'commercial_invoice.pdf', type: 'Commercial Invoice' }
    ],
    acidNumber: 'AC12345',
    date: '2024-01-15',
    subject: 'Commercial Goods Export Documentation',
    procedureType: 'Export'
  },
  {
    id: '2',
    recipient: 'Sudan Customs Department',
    legalEntityType: 'Customs Department',
    status: 'processing' as const,
    files: [
      { id: '2', name: 'bill_of_lading.pdf', type: 'Bill of Lading' },
      { id: '3', name: 'packing_list.pdf', type: 'Packing List' },
      { id: '5', name: 'export_permit.pdf', type: 'Export Permit' }
    ],
    acidNumber: 'AC12346',
    date: '2024-01-14',
    subject: 'Commercial Goods Export - Electronics',
    procedureType: 'Export'
  },
  {
    id: '3',
    recipient: 'Port Authority of Alexandria',
    legalEntityType: 'Port Authority',
    status: 'verified' as const,
    files: [
      { id: '6', name: 'port_clearance.pdf', type: 'Port Clearance' },
      { id: '7', name: 'container_manifest.pdf', type: 'Container Manifest' }
    ],
    acidNumber: 'AC12347',
    date: '2024-01-13',
    subject: 'Port Processing - Commercial Goods',
    procedureType: 'Export'
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'sent': 
    case 'delivered': 
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'processing': 
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'verified':
      return <CheckCircle className="h-4 w-4 text-blue-500" />;
    case 'draft': 
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
    default: 
      return <Clock className="h-4 w-4" />;
  }
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'sent':
    case 'delivered': 
      return 'default' as const;
    case 'processing': 
      return 'secondary' as const;
    case 'verified':
      return 'default' as const;
    case 'draft': 
      return 'outline' as const;
    default: 
      return 'outline' as const;
  }
};

function SentSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Sent Items</h3>
          <Badge variant="secondary">{mockSentItems.length}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {mockSentItems.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Send className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground mb-2">No sent items</h3>
              <p className="text-muted-foreground">
                Envelopes you send will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          mockSentItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">ACID: {item.acidNumber}</h4>
                      <Badge variant="outline" className="text-xs">
                        {(item as any).procedureType}
                      </Badge>
                      <Badge variant={getStatusVariant(item.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(item.status)}
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </div>
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-foreground">{item.subject}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>To:</span>
                      <span className="font-medium text-primary">{item.recipient}</span>
                      <Badge variant="secondary" className="text-xs">
                        {(item as any).legalEntityType}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.files.length} document{item.files.length !== 1 ? 's' : ''} • {item.date}
                    </p>
                    {/* Show uploaded documents */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.files.slice(0, 3).map((file) => (
                        <Badge key={file.id} variant="outline" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          {file.name}
                        </Badge>
                      ))}
                      {item.files.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{item.files.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ArchiveIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export function EnhancedInboxWithSections({ 
  onCompose, 
  onOpenEnvelope, 
  onUnarchive, 
  onDownload 
}: EnhancedInboxWithSectionsProps) {
  const [activeTab, setActiveTab] = useState("inbox");
  const { user } = useAuth();
  const currentUserId = user?.id;

  const tabCounts = {
    inbox: 5,
    drafts: 3,
    sent: mockSentItems.length,
    archive: 12
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-primary">Chat & Documents</h2>
        </div>
        <Button onClick={onCompose} variant="default">
          <Package className="h-4 w-4 mr-2" />
          New Envelope
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="inbox" className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            <span className="hidden sm:inline">Inbox</span>
            {tabCounts.inbox > 0 && (
              <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                {tabCounts.inbox}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="drafts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Drafts</span>
            {tabCounts.drafts > 0 && (
              <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                {tabCounts.drafts}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Sent</span>
            {tabCounts.sent > 0 && (
              <Badge variant="outline" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                {tabCounts.sent}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="archive" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            <span className="hidden sm:inline">Archive</span>
            {tabCounts.archive > 0 && (
              <Badge variant="outline" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                {tabCounts.archive}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="mt-6">
          <EnhancedInbox />
        </TabsContent>

        <TabsContent value="drafts" className="mt-6">
          <DraftsPage 
            onCompose={onCompose}
            onOpenEnvelope={onOpenEnvelope || (() => {})}
          />
        </TabsContent>

        <TabsContent value="sent" className="mt-6">
          <SentSection />
          {/* Ajouter le tracker des enveloppes utilisateur */}
          <div className="mt-8">
            <UserEnvelopeTracker userId={currentUserId || ''} />
          </div>
        </TabsContent>

        <TabsContent value="archive" className="mt-6">
          <ArchiveManager 
            onUnarchive={onUnarchive || (() => {})}
            onDownload={onDownload || (() => {})}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
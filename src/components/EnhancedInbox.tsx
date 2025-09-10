import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { LegalEntityEmailModal } from "./LegalEntityEmailModal";
import { 
  Mail, 
  Send, 
  Search, 
  Building2, 
  Clock, 
  CheckCircle,
  Archive,
  Star,
  Filter,
  Plus
} from "lucide-react";

interface EnhancedInboxProps {
  onBack?: () => void;
}

interface LegalEntity {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'busy';
  email: string;
  department?: string;
  location?: string;
  lastContact?: Date;
}

interface EmailMessage {
  id: string;
  subject: string;
  preview: string;
  sender: string;
  senderType: 'user' | 'entity';
  timestamp: Date;
  isRead: boolean;
  isStarred: boolean;
  entityId: string;
  status: 'sent' | 'delivered' | 'read';
  hasAttachment: boolean;
}

// Mock data for legal entities
const mockLegalEntities: LegalEntity[] = [
  {
    id: "sca",
    name: "Sudan Customs Authority",
    type: "Customs Authority",
    status: 'online',
    email: "clearance@customs.gov.sd",
    department: "Import/Export Clearance",
    location: "Khartoum, Sudan",
    lastContact: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: "spc",
    name: "Sea Ports Corporation",
    type: "Port Authority", 
    status: 'online',
    email: "operations@seaports.gov.sd",
    department: "Terminal Operations",
    location: "Port Sudan",
    lastContact: new Date(Date.now() - 24 * 60 * 60 * 1000)
  },
  {
    id: "mti",
    name: "Ministry of Trade and Industry",
    type: "Government Ministry",
    status: 'offline',
    email: "licensing@mti.gov.sd",
    department: "Trade Licensing",
    location: "Khartoum, Sudan"
  },
  {
    id: "cbs",
    name: "Central Bank of Sudan",
    type: "Financial Institution",
    status: 'busy',
    email: "forex@cbos.gov.sd",
    department: "Foreign Exchange",
    location: "Khartoum, Sudan",
    lastContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  }
];

const mockEmails: EmailMessage[] = [
  {
    id: "1",
    subject: "Certificate of Origin - Additional Documentation Required",
    preview: "We need additional documentation for the Certificate of Origin submitted under ACID AC12345...",
    sender: "Sudan Customs Authority",
    senderType: 'entity',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    isRead: false,
    isStarred: true,
    entityId: "sca",
    status: 'read',
    hasAttachment: true
  },
  {
    id: "2", 
    subject: "Cargo Clearance Approved - Ready for Pickup",
    preview: "Your cargo clearance has been approved. The container is ready for pickup at Gate 7...",
    sender: "Sea Ports Corporation",
    senderType: 'entity',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isRead: true,
    isStarred: false,
    entityId: "spc",
    status: 'delivered',
    hasAttachment: false
  },
  {
    id: "3",
    subject: "Trade License Renewal Reminder",
    preview: "This is a reminder that your trade license expires in 30 days. Please submit renewal documents...",
    sender: "Ministry of Trade and Industry", 
    senderType: 'entity',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isRead: true,
    isStarred: false,
    entityId: "mti",
    status: 'read',
    hasAttachment: true
  }
];

export function EnhancedInbox({ onBack }: EnhancedInboxProps) {
  const [activeTab, setActiveTab] = useState("emails");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<string>("");
  const [emails, setEmails] = useState<EmailMessage[]>(mockEmails);
  const [entities] = useState<LegalEntity[]>(mockLegalEntities);

  const filteredEmails = emails.filter(email =>
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEntities = entities.filter(entity =>
    entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entity.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entity.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = emails.filter(email => !email.isRead).length;
  const starredCount = emails.filter(email => email.isStarred).length;

  const handleComposeEmail = (entityId?: string) => {
    setSelectedEntity(entityId || "");
    setShowEmailModal(true);
  };

  const getStatusColor = (status: LegalEntity['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="h-[calc(100vh-120px)] bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 h-full">
        <div className="border-b bg-card px-6">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="emails" className="relative">
              Emails
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="entities">Entities</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="archive">Archive</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="emails" className="h-full m-0 p-0">
            <div className="h-full overflow-y-auto">
              {filteredEmails.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No emails found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? 'Try adjusting your search terms' : 'Start communicating with legal entities'}
                  </p>
                  <Button onClick={() => handleComposeEmail()}>
                    <Send className="mr-2 h-4 w-4" />
                    Send First Email
                  </Button>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredEmails.map((email) => (
                    <div
                      key={email.id}
                      className={`p-4 hover:bg-accent/50 cursor-pointer transition-colors ${
                        !email.isRead ? 'bg-accent/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">{email.sender}</span>
                          </div>
                          {email.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                          {email.hasAttachment && <Archive className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{formatTime(email.timestamp)}</span>
                          {email.status === 'read' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        </div>
                      </div>
                      <h3 className={`font-medium mb-1 ${!email.isRead ? 'font-semibold' : ''}`}>
                        {email.subject}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{email.preview}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="entities" className="h-full m-0 p-0">
            <div className="h-full overflow-y-auto">
              {filteredEntities.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No entities found</h3>
                  <p className="text-muted-foreground">Try adjusting your search terms</p>
                </div>
              ) : (
                <div className="grid gap-4 p-6">
                  {filteredEntities.map((entity) => (
                    <Card key={entity.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="relative">
                            <Building2 className="h-8 w-8 text-muted-foreground" />
                            <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(entity.status)}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-foreground">{entity.name}</h3>
                            <p className="text-sm text-muted-foreground">{entity.type}</p>
                            {entity.department && (
                              <p className="text-xs text-muted-foreground mt-1">{entity.department}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>{entity.email}</span>
                              {entity.location && <span>{entity.location}</span>}
                            </div>
                            {entity.lastContact && (
                              <div className="flex items-center gap-1 mt-1">
                                <Clock className="h-3 w-3" />
                                <span className="text-xs text-muted-foreground">
                                  Last contact: {formatTime(entity.lastContact)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleComposeEmail(entity.id)}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Contact
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sent" className="h-full m-0 p-0">
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Send className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Sent Messages</h3>
              <p className="text-muted-foreground">Your sent communications will appear here</p>
            </div>
          </TabsContent>

          <TabsContent value="archive" className="h-full m-0 p-0">
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Archive className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Archived Messages</h3>
              <p className="text-muted-foreground">Archived communications will appear here</p>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <LegalEntityEmailModal
        open={showEmailModal}
        onOpenChange={setShowEmailModal}
        preselectedLegalEntity={selectedEntity}
      />
    </div>
  );
}
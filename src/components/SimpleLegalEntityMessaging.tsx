import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Mail, 
  Search,
  Building2,
  MessageCircle,
  Send,
  Plus,
  History,
  Clock,
  CheckCircle
} from "lucide-react";
import { LegalEntityEmailModal } from "./LegalEntityEmailModal";

interface LegalEntity {
  id: string;
  name: string;
  entity_type: string;
  status: 'active' | 'busy' | 'offline';
  lastContact?: string;
  unreadCount?: number;
}

interface Conversation {
  id: string;
  entityId: string;
  entityName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'delivered' | 'read' | 'pending';
}

const legalEntities: LegalEntity[] = [
  { 
    id: "sca", 
    name: "Sudan Customs Authority (SCA)", 
    entity_type: "Customs Authority",
    status: "active",
    lastContact: "2024-01-15",
    unreadCount: 2
  },
  { 
    id: "spc", 
    name: "Sea Ports Corporation (SPC)", 
    entity_type: "Port Authority",
    status: "active",
    lastContact: "2024-01-14"
  },
  { 
    id: "mti", 
    name: "Ministry of Trade and Industry", 
    entity_type: "Government Ministry",
    status: "busy",
    lastContact: "2024-01-13"
  },
  { 
    id: "cbs", 
    name: "Central Bank of Sudan", 
    entity_type: "Financial Institution",
    status: "offline",
    lastContact: "2024-01-10"
  },
];

const recentConversations: Conversation[] = [
  {
    id: "1",
    entityId: "sca",
    entityName: "Sudan Customs Authority (SCA)",
    lastMessage: "Documents have been processed and approved",
    lastMessageTime: "2 hours ago",
    unreadCount: 2,
    status: "delivered"
  },
  {
    id: "2",
    entityId: "spc",
    entityName: "Sea Ports Corporation (SPC)",
    lastMessage: "Export clearance documentation required",
    lastMessageTime: "1 day ago",
    unreadCount: 0,
    status: "read"
  }
];

export function SimpleLegalEntityMessaging() {
  const [searchQuery, setSearchQuery] = useState("");
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState("");

  const filteredEntities = legalEntities.filter(entity =>
    entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entity.entity_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactEntity = (entityId: string) => {
    setSelectedEntityId(entityId);
    setEmailModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'read':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-primary">Messaging Center</h2>
          <Badge variant="secondary">Contact Legal Entities</Badge>
        </div>
        <Button 
          onClick={() => setEmailModalOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New Message
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search legal entity..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversations Récentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Conversations
              <Badge variant="destructive">{recentConversations.reduce((sum, conv) => sum + conv.unreadCount, 0)}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentConversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent conversations</p>
              </div>
            ) : (
              recentConversations.map((conversation) => (
                <div key={conversation.id} className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{conversation.entityName}</h4>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{conversation.lastMessage}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {getMessageStatusIcon(conversation.status)}
                        <span>{conversation.lastMessageTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Entités Légales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Available Legal Entities
              <Badge variant="secondary">{filteredEntities.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredEntities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No entities found</p>
              </div>
            ) : (
              filteredEntities.map((entity) => (
                <div key={entity.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Building2 className="h-8 w-8 text-primary" />
                      <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(entity.status)}`}></div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{entity.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{entity.entity_type}</Badge>
                        {entity.unreadCount && entity.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {entity.unreadCount} unread
                          </Badge>
                        )}
                      </div>
                      {entity.lastContact && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Last contact: {entity.lastContact}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleContactEntity(entity.id)}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Contact
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="outline" className="gap-2">
              <Mail className="h-4 w-4" />
              Pending messages
              <Badge variant="secondary">3</Badge>
            </Button>
            <Button variant="outline" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Read messages
              <Badge variant="secondary">12</Badge>
            </Button>
            <Button variant="outline" className="gap-2">
              <Send className="h-4 w-4" />
              Sent messages
              <Badge variant="secondary">8</Badge>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Modal */}
      <LegalEntityEmailModal
        open={emailModalOpen}
        onOpenChange={setEmailModalOpen}
        preselectedLegalEntity={selectedEntityId}
      />
    </div>
  );
}
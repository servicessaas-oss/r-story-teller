import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MessageCircle, Star, Archive, Filter, Plus, Building2, CheckCircle2, Clock, Paperclip } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface Conversation {
  id: string;
  entityName: string;
  entityType: string;
  entityLogo?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isStarred: boolean;
  isArchived: boolean;
  status: 'online' | 'offline' | 'away';
  lastSender: 'user' | 'entity';
  hasAttachment?: boolean;
}

interface ConversationsListProps {
  conversations: Conversation[];
  onConversationSelect: (conversationId: string) => void;
  onNewChat: () => void;
  selectedConversationId?: string;
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    entityName: "Sudan Customs Authority",
    entityType: "Customs Authority",
    entityLogo: "/placeholder.svg",
    lastMessage: "We need additional documentation for the Certificate of Origin submitted under ACID AC12345.",
    lastMessageTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    unreadCount: 2,
    isStarred: true,
    isArchived: false,
    status: 'online',
    lastSender: 'entity',
    hasAttachment: true
  },
  {
    id: "2", 
    entityName: "Sea Ports Corporation",
    entityType: "Port Authority",
    entityLogo: "/placeholder.svg",
    lastMessage: "Your cargo clearance has been approved. The container is ready for pickup at Gate 7.",
    lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    unreadCount: 0,
    isStarred: false,
    isArchived: false,
    status: 'online',
    lastSender: 'entity'
  },
  {
    id: "3",
    entityName: "Ministry of Trade and Industry", 
    entityType: "Government Ministry",
    entityLogo: "/placeholder.svg",
    lastMessage: "Your import license is scheduled to expire on March 31, 2024.",
    lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    unreadCount: 0,
    isStarred: false,
    isArchived: false,
    status: 'away',
    lastSender: 'entity'
  },
  {
    id: "4",
    entityName: "Freight Forwarders",
    entityType: "Logistics Provider", 
    entityLogo: "/placeholder.svg",
    lastMessage: "Thank you for the update. We'll proceed with the new schedule.",
    lastMessageTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    unreadCount: 0,
    isStarred: true,
    isArchived: false,
    status: 'offline',
    lastSender: 'user'
  },
  {
    id: "5",
    entityName: "Central Bank of Sudan",
    entityType: "Financial Institution",
    entityLogo: "/placeholder.svg",
    lastMessage: "New foreign exchange regulations will take effect from February 1st, 2024.",
    lastMessageTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    unreadCount: 1,
    isStarred: false,
    isArchived: false,
    status: 'offline',
    lastSender: 'entity',
    hasAttachment: true
  }
];

export function ConversationsList({ 
  conversations = mockConversations, 
  onConversationSelect, 
  onNewChat,
  selectedConversationId 
}: ConversationsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch && !conv.isArchived;
    if (activeTab === "unread") return matchesSearch && conv.unreadCount > 0 && !conv.isArchived;
    if (activeTab === "starred") return matchesSearch && conv.isStarred && !conv.isArchived;
    if (activeTab === "archived") return matchesSearch && conv.isArchived;
    
    return matchesSearch;
  });

  const unreadCount = conversations.filter(c => c.unreadCount > 0 && !c.isArchived).length;
  const starredCount = conversations.filter(c => c.isStarred && !c.isArchived).length;
  const archivedCount = conversations.filter(c => c.isArchived).length;

  const getStatusDot = (status: string) => {
    const colors = {
      online: 'bg-green-500',
      away: 'bg-yellow-500', 
      offline: 'bg-gray-400'
    };
    return `h-3 w-3 rounded-full ${colors[status as keyof typeof colors]}`;
  };

  const getEntityInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">Inbox</h2>
          <p className="text-muted-foreground">Manage conversations with entities</p>
        </div>
        <Button onClick={onNewChat} variant="action">
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread" className="relative">
            Unread
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="starred" className="relative">
            Starred
            {starredCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {starredCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="archived" className="relative">
            Archived
            {archivedCount > 0 && (
              <Badge variant="outline" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {archivedCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredConversations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
                <h4 className="text-lg font-medium text-muted-foreground mb-2">
                  {searchTerm ? "No conversations found" : "No conversations yet"}
                </h4>
                <p className="text-sm text-muted-foreground mb-6">
                  {searchTerm ? "Try adjusting your search terms" : "Start a new conversation to get started"}
                </p>
                {!searchTerm && (
                  <Button onClick={onNewChat} variant="action">
                    <Plus className="h-4 w-4 mr-2" />
                    Start New Chat
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredConversations.map((conversation) => (
                <Card 
                  key={conversation.id}
                  className={`cursor-pointer hover:shadow-md transition-all duration-200 ${
                    selectedConversationId === conversation.id ? 'ring-2 ring-primary/50 shadow-md' : ''
                  } ${conversation.unreadCount > 0 ? 'bg-accent/30' : ''}`}
                  onClick={() => onConversationSelect(conversation.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={conversation.entityLogo} alt={conversation.entityName} />
                          <AvatarFallback className="text-sm font-medium">
                            {getEntityInitials(conversation.entityName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 ${getStatusDot(conversation.status)} border-2 border-background`} />
                      </div>
                      
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className={`font-medium truncate ${conversation.unreadCount > 0 ? 'font-semibold' : ''}`}>
                              {conversation.entityName}
                            </h4>
                            {conversation.isStarred && (
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(conversation.lastMessageTime, { addSuffix: true })}
                            </span>
                            {conversation.unreadCount > 0 && (
                              <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <Badge variant="outline" className="text-xs w-fit">
                          {conversation.entityType}
                        </Badge>
                        
                        <div className="flex items-center gap-2">
                          {conversation.lastSender === 'user' && (
                            <CheckCircle2 className="h-3 w-3 text-blue-500 flex-shrink-0" />
                          )}
                          <p className={`text-sm line-clamp-2 ${conversation.unreadCount > 0 ? 'font-medium' : 'text-muted-foreground'}`}>
                            {conversation.lastMessage}
                          </p>
                          {conversation.hasAttachment && (
                            <Paperclip className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Search, CheckCircle, Clock, AlertCircle, FileText, Building2, Reply, Archive, Trash2 } from "lucide-react";

interface Message {
  id: string;
  sender: string;
  senderType: string;
  subject: string;
  message: string;
  timestamp: string;
  status: 'unread' | 'read' | 'replied';
  priority: 'high' | 'normal' | 'low';
  attachments?: Array<{ name: string; type: string }>;
  relatedEnvelope?: string;
}

const mockMessages: Message[] = [
  {
    id: "1",
    sender: "Sudan Customs Authority (SCA)",
    senderType: "Customs Authority",
    subject: "Document Validation Required - ACID: AC12345",
    message: "We need additional documentation for the Certificate of Origin submitted under ACID AC12345. Please provide the manufacturer's certification within 24 hours.",
    timestamp: "2024-01-15 14:30",
    status: "unread",
    priority: "high",
    attachments: [{ name: "requirements.pdf", type: "PDF" }],
    relatedEnvelope: "AC12345"
  },
  {
    id: "2",
    sender: "Sea Ports Corporation (SPC)",
    senderType: "Port Authority",
    subject: "Clearance Approved - Port Entry Confirmed",
    message: "Your cargo clearance has been approved. The container is ready for pickup at Gate 7. Reference number: SPC-2024-0115.",
    timestamp: "2024-01-15 12:15",
    status: "unread",
    priority: "normal",
    relatedEnvelope: "AC12347"
  },
  {
    id: "3",
    sender: "Ministry of Trade and Industry",
    senderType: "Government Ministry",
    subject: "Import License Renewal Notice",
    message: "Your import license is scheduled to expire on March 31, 2024. Please initiate the renewal process to avoid any disruption in your import activities.",
    timestamp: "2024-01-14 16:45",
    status: "read",
    priority: "normal",
  },
  {
    id: "4",
    sender: "Freight Forwarders",
    senderType: "Logistics Provider",
    subject: "Shipment Delay Notification",
    message: "Due to port congestion, your shipment scheduled for January 16th has been delayed by 2 days. New ETA: January 18th, 2024.",
    timestamp: "2024-01-14 10:20",
    status: "replied",
    priority: "high",
    relatedEnvelope: "AC12350"
  },
  {
    id: "5",
    sender: "Central Bank of Sudan",
    senderType: "Financial Institution",
    subject: "Foreign Exchange Compliance Update",
    message: "New foreign exchange regulations will take effect from February 1st, 2024. Please review the attached guidelines for compliance requirements.",
    timestamp: "2024-01-13 09:00",
    status: "read",
    priority: "low",
    attachments: [{ name: "forex_guidelines.pdf", type: "PDF" }]
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'unread': return <MessageCircle className="h-4 w-4 text-blue-500" />;
    case 'read': return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'replied': return <Reply className="h-4 w-4 text-gray-500" />;
    default: return <MessageCircle className="h-4 w-4" />;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'high': return <Badge variant="destructive">High</Badge>;
    case 'normal': return <Badge variant="secondary">Normal</Badge>;
    case 'low': return <Badge variant="outline">Low</Badge>;
    default: return <Badge variant="outline">Normal</Badge>;
  }
};

interface InboxMessagesProps {
  onReply: (messageId: string) => void;
}

export function InboxMessages({ onReply }: InboxMessagesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const filteredMessages = mockMessages.filter(message => {
    const matchesSearch = message.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedTab === "all") return matchesSearch;
    if (selectedTab === "unread") return matchesSearch && message.status === "unread";
    if (selectedTab === "high") return matchesSearch && message.priority === "high";
    
    return matchesSearch;
  });

  const unreadCount = mockMessages.filter(m => m.status === 'unread').length;
  const highPriorityCount = mockMessages.filter(m => m.priority === 'high').length;

  if (selectedMessage) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setSelectedMessage(null)}>
            ← Back to Inbox
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {selectedMessage.sender}
                </CardTitle>
                <CardDescription>{selectedMessage.senderType}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {getPriorityBadge(selectedMessage.priority)}
                {getStatusIcon(selectedMessage.status)}
              </div>
            </div>
            <div className="pt-4 border-t">
              <h2 className="text-xl font-semibold">{selectedMessage.subject}</h2>
              <p className="text-sm text-muted-foreground mt-1">{selectedMessage.timestamp}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose max-w-none">
              <p className="text-foreground leading-relaxed">{selectedMessage.message}</p>
            </div>

            {selectedMessage.relatedEnvelope && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground mb-1">Related Envelope</p>
                <p className="font-medium">ACID: {selectedMessage.relatedEnvelope}</p>
              </div>
            )}

            {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Attachments</p>
                <div className="space-y-2">
                  {selectedMessage.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border border-border rounded">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{attachment.name}</span>
                      <Badge variant="outline" className="text-xs">{attachment.type}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={() => onReply(selectedMessage.id)} variant="action">
                <Reply className="h-4 w-4 mr-2" />
                Reply
              </Button>
              <Button variant="outline">
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </Button>
              <Button variant="outline">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">Inbox</h2>
          <p className="text-muted-foreground">Manage your messages and communications</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount} unread
            </Badge>
          )}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search messages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Messages</TabsTrigger>
          <TabsTrigger value="unread" className="relative">
            Unread
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="high" className="relative">
            High Priority
            {highPriorityCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {highPriorityCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {filteredMessages.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h4 className="text-lg font-medium text-muted-foreground mb-2">No messages found</h4>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? "Try adjusting your search terms" : "You're all caught up!"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredMessages.map((message) => (
                <Card 
                  key={message.id} 
                  className={`cursor-pointer hover:shadow-md transition-shadow ${message.status === 'unread' ? 'bg-muted/30' : ''}`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(message.status)}
                          <h4 className={`font-medium text-sm ${message.status === 'unread' ? 'font-semibold' : ''}`}>
                            {message.sender}
                          </h4>
                          <Badge variant="outline" className="text-xs">{message.senderType}</Badge>
                        </div>
                        <h3 className={`text-base ${message.status === 'unread' ? 'font-semibold' : 'font-medium'}`}>
                          {message.subject}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{message.message}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{message.timestamp}</span>
                          {message.attachments && message.attachments.length > 0 && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {message.attachments.length} attachment{message.attachments.length > 1 ? 's' : ''}
                            </span>
                          )}
                          {message.relatedEnvelope && (
                            <span>ACID: {message.relatedEnvelope}</span>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        {getPriorityBadge(message.priority)}
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
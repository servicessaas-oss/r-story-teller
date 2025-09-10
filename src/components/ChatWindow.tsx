import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Paperclip, Smile, Phone, Video, MoreVertical, Info, Check, CheckCheck, Building2, Globe, Mail, MapPin } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDistanceToNow } from "date-fns";

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'entity';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  attachments?: Array<{
    name: string;
    type: string;
    size?: number;
  }>;
}

export interface EntityInfo {
  id: string;
  name: string;
  type: string;
  logo?: string;
  status: 'online' | 'offline' | 'away';
  location?: string;
  email?: string;
  website?: string;
  description?: string;
}

interface ChatWindowProps {
  entity: EntityInfo;
  messages: ChatMessage[];
  onBack: () => void;
  onSendMessage: (content: string, attachments?: File[]) => void;
  isTyping?: boolean;
}

const mockEntity: EntityInfo = {
  id: "1",
  name: "Sudan Customs Authority",
  type: "Customs Authority",
  logo: "/placeholder.svg",
  status: 'online',
  location: "Khartoum, Sudan",
  email: "info@customs.sd",
  website: "customs.gov.sd",
  description: "The official customs authority responsible for regulating imports and exports in Sudan."
};

const mockMessages: ChatMessage[] = [
  {
    id: "1",
    content: "Good morning! We have received your ACID submission AC12345. We are currently reviewing the documentation.",
    sender: 'entity',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'read'
  },
  {
    id: "2", 
    content: "Thank you for the update. The Certificate of Origin has been uploaded along with all supporting documents.",
    sender: 'user',
    timestamp: new Date(Date.now() - 90 * 60 * 1000),
    status: 'read'
  },
  {
    id: "3",
    content: "We need additional documentation for the Certificate of Origin. Please provide the manufacturer's certification within 24 hours.",
    sender: 'entity',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    status: 'read',
    attachments: [
      { name: "requirements.pdf", type: "PDF", size: 245760 }
    ]
  },
  {
    id: "4",
    content: "I'll upload the manufacturer's certification shortly. Is there anything else you need for the review?",
    sender: 'user',
    timestamp: new Date(Date.now()- 5 * 60 * 1000),
    status: 'delivered'
  }
];

export function ChatWindow({ 
  entity = mockEntity, 
  messages = mockMessages, 
  onBack, 
  onSendMessage,
  isTyping = false 
}: ChatWindowProps) {
  const [messageText, setMessageText] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showEntityProfile, setShowEntityProfile] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (messageText.trim() || attachments.length > 0) {
      onSendMessage(messageText.trim(), attachments);
      setMessageText("");
      setAttachments([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getEntityInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Check className="h-4 w-4 text-muted-foreground" />;
      case 'delivered': return <CheckCheck className="h-4 w-4 text-muted-foreground" />;
      case 'read': return <CheckCheck className="h-4 w-4 text-blue-500" />;
      default: return null;
    }
  };

  const getStatusDot = (status: string) => {
    const colors = {
      online: 'bg-green-500',
      away: 'bg-yellow-500',
      offline: 'bg-gray-400'
    };
    return `h-3 w-3 rounded-full ${colors[status as keyof typeof colors]}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <CardHeader className="flex-row items-center justify-between space-y-0 py-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={entity.logo} alt={entity.name} />
                <AvatarFallback className="text-sm font-medium">
                  {getEntityInitials(entity.name)}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 ${getStatusDot(entity.status)} border-2 border-background`} />
            </div>
            <div>
              <h3 className="font-semibold text-base">{entity.name}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{entity.type}</Badge>
                <span className="text-xs text-muted-foreground">
                  {entity.status === 'online' ? 'Online' : 
                   entity.status === 'away' ? 'Away' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Popover open={showEntityProfile} onOpenChange={setShowEntityProfile}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm">
                <Info className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={entity.logo} alt={entity.name} />
                    <AvatarFallback>{getEntityInitials(entity.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{entity.name}</h4>
                    <Badge variant="outline" className="text-xs">{entity.type}</Badge>
                  </div>
                </div>
                
                {entity.description && (
                  <p className="text-sm text-muted-foreground">{entity.description}</p>
                )}

                <div className="space-y-2">
                  {entity.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{entity.location}</span>
                    </div>
                  )}
                  {entity.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{entity.email}</span>
                    </div>
                  )}
                  {entity.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span>{entity.website}</span>
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Phone className="mr-2 h-4 w-4" />
                Call
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Video className="mr-2 h-4 w-4" />
                Video Call
              </DropdownMenuItem>
              <DropdownMenuItem>
                Archive Chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end gap-2 max-w-[70%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {message.sender === 'entity' && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={entity.logo} alt={entity.name} />
                    <AvatarFallback className="text-xs">
                      {getEntityInitials(entity.name)}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className="space-y-1">
                  <div
                    className={`rounded-lg px-4 py-3 ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 rounded bg-background/20">
                            <Paperclip className="h-4 w-4" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{attachment.name}</p>
                              {attachment.size && (
                                <p className="text-xs opacity-70">{formatFileSize(attachment.size)}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className={`flex items-center gap-1 text-xs text-muted-foreground ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <span>{formatDistanceToNow(message.timestamp, { addSuffix: true })}</span>
                    {message.sender === 'user' && getStatusIcon(message.status)}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-end gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={entity.logo} alt={entity.name} />
                  <AvatarFallback className="text-xs">
                    {getEntityInitials(entity.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Message Composer */}
      <div className="border-t p-4">
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center gap-2 bg-muted rounded px-3 py-2">
                <Paperclip className="h-4 w-4" />
                <span className="text-sm truncate max-w-32">{file.name}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-auto p-1"
                  onClick={() => removeAttachment(index)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Textarea
              placeholder="Type your message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              className="min-h-[44px] max-h-32 resize-none"
              rows={1}
            />
          </div>
          
          <div className="flex items-center gap-1">
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
            >
              <Smile className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={handleSendMessage}
              disabled={!messageText.trim() && attachments.length === 0}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
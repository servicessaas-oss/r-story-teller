import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Send, 
  Search, 
  Plus, 
  Users, 
  Settings, 
  Grid3X3,
  Type,
  Clipboard,
  CheckSquare,
  MoreVertical,
  Lock,
  ChevronDown
} from "lucide-react";
import { useMessaging, type Conversation, type Message, type Contact } from "@/hooks/useMessaging";
import { useAuth } from "@/contexts/AuthContext";
import { useProfiles } from "@/hooks/useProfiles";
import { format } from "date-fns";
import { NewConversationDialog } from "./NewConversationDialog";


export function ModernChatInterface() {
  const { user } = useAuth();
  const { currentUserProfile } = useProfiles();
  const {
    conversations,
    contacts,
    messages,
    loading,
    getUserConversations,
    getContacts,
    getConversationMessages,
    sendMessage,
    markMessagesAsRead,
    getOrCreateConversation
  } = useMessaging();

  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [activeTab, setActiveTab] = useState<'conversations' | 'contacts'>('conversations');
  const messagesEndRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (user) {
      getUserConversations();
      getContacts();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      getConversationMessages(selectedConversation);
      markMessagesAsRead(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;
    
    await sendMessage(selectedConversation, newMessage);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.other_participant?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.other_participant?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContacts = contacts.filter(contact =>
    contact.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const handleContactClick = async (contact: Contact) => {
    try {
      const conversationId = await getOrCreateConversation(contact.id);
      setSelectedConversation(conversationId);
      getUserConversations();
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const selectedConversationData = conversations.find(c => c.id === selectedConversation);

  const formatTime = (date: string) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return format(messageDate, 'h:mm a');
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return format(messageDate, 'M/d/yy');
    }
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Chat Sidebar */}
      <div className="w-80 bg-chat-sidebar flex flex-col">
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-chat-sidebar-foreground">Chat</h1>
          <div className="flex items-center space-x-2">
            <Lock className="h-4 w-4 text-chat-sidebar-foreground/70" />
            <MoreVertical className="h-4 w-4 text-chat-sidebar-foreground/70" />
          </div>
        </div>

        {/* Filter and Search */}
        <div className="px-4 pb-4 space-y-3">
          {/* Tab Buttons */}
          <div className="flex bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('conversations')}
              className={`flex-1 px-2 py-2 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'conversations' 
                  ? 'bg-white/20 text-chat-sidebar-foreground' 
                  : 'text-chat-sidebar-foreground/70 hover:text-chat-sidebar-foreground'
              }`}
            >
              Chats
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`flex-1 px-2 py-2 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'contacts' 
                  ? 'bg-white/20 text-chat-sidebar-foreground' 
                  : 'text-chat-sidebar-foreground/70 hover:text-chat-sidebar-foreground'
              }`}
            >
              Contacts
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-chat-sidebar-foreground/50" />
            <Input
              placeholder={
                activeTab === 'conversations' ? "Search chats" : "Search contacts"
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-chat-sidebar-foreground placeholder:text-chat-sidebar-foreground/50"
            />
          </div>
        </div>

        {/* Content List */}
        <ScrollArea className="flex-1">
          <div className="space-y-1 px-2">
            {activeTab === 'conversations' ? (
              // Conversations Tab
              filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-chat-sidebar-foreground/70">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium mb-1">No conversations yet</p>
                  <p className="text-sm">Start a new conversation to connect</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const unreadCount = 0; // Calculate based on your logic
                  return (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={`p-3 mx-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/10 ${
                        selectedConversation === conversation.id ? 'bg-chat-selected/20 border border-chat-selected/30' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-user-avatar text-white font-semibold">
                              {conversation.other_participant?.full_name
                                ?.split(' ')
                                .map(n => n[0])
                                .join('')
                                .toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-chat-sidebar"></div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-chat-sidebar-foreground truncate text-sm">
                              {conversation.other_participant?.full_name || 'Unknown User'}
                            </p>
                            <span className="text-xs text-chat-sidebar-foreground/60">
                              {formatTime(conversation.last_message_at)}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-chat-sidebar-foreground/70 truncate pr-2">
                              {conversation.last_message?.content || 'No messages yet'}
                            </p>
                            {unreadCount > 0 && (
                              <Badge className="bg-red-500 text-white text-xs h-5 min-w-5 rounded-full flex items-center justify-center px-1.5">
                                {unreadCount > 99 ? '99+' : unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              // Contacts Tab
              filteredContacts.length === 0 ? (
                <div className="p-6 text-center text-chat-sidebar-foreground/70">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium mb-1">No contacts found</p>
                  <p className="text-sm">Try a different search term</p>
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => handleContactClick(contact)}
                    className="p-3 mx-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/10"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-user-avatar text-white font-semibold">
                            {contact.full_name
                              ?.split(' ')
                              .map(n => n[0])
                              .join('')
                              .toUpperCase() || contact.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 rounded-full border-2 border-chat-sidebar"></div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-chat-sidebar-foreground truncate text-sm">
                          {contact.full_name || contact.email}
                        </p>
                        <p className="text-xs text-chat-sidebar-foreground/70 truncate">
                          {contact.email}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-background">
        {selectedConversation ? (
          <div className="h-full flex flex-col">
            {/* Chat Header */}
            <div className="p-4 bg-white border-b flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-user-avatar text-white font-semibold">
                      {selectedConversationData?.other_participant?.full_name
                        ?.split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedConversationData?.other_participant?.full_name || 'Unknown User'}
                  </h3>
                  <p className="text-xs text-green-600">Active now</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message, index) => {
                  const isCurrentUser = message.sender_id === user?.id;
                  const prevMessage = messages[index - 1];
                  const showAvatar = !prevMessage || prevMessage.sender_id !== message.sender_id;
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isCurrentUser && (
                        <div className="w-8 h-8 flex-shrink-0">
                          {showAvatar && (
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-user-avatar text-white text-xs">
                                {selectedConversationData?.other_participant?.full_name
                                  ?.split(' ')
                                  .map(n => n[0])
                                  .join('')
                                  .toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      )}
                      
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          isCurrentUser
                            ? 'bg-chat-sidebar text-chat-sidebar-foreground rounded-br-md'
                            : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        {(index === messages.length - 1 || messages[index + 1]?.sender_id !== message.sender_id) && (
                          <p className={`text-xs mt-1 ${
                            isCurrentUser 
                              ? 'text-chat-sidebar-foreground/70' 
                              : 'text-gray-500'
                          }`}>
                            {format(new Date(message.created_at), 'h:mm a')}
                          </p>
                        )}
                      </div>
                      
                      {isCurrentUser && <div className="w-8"></div>}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 bg-white border-t">
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="rounded-full border-gray-200 py-3 pr-12"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full p-0 bg-chat-sidebar hover:bg-chat-sidebar-accent"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="mb-6">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarFallback className="bg-user-avatar text-white text-2xl font-semibold">
                    {currentUserProfile?.full_name
                      ?.split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-medium text-gray-900 mb-2">
                  Welcome, {currentUserProfile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}!
                </h2>
                <p className="text-gray-600 mb-6">Please select a chat to Start messaging.</p>
                <Button 
                  onClick={() => setShowNewConversation(true)} 
                  className="bg-chat-sidebar hover:bg-chat-sidebar-accent text-chat-sidebar-foreground rounded-full px-6"
                >
                  Start a conversation
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="w-14 bg-gray-50 flex flex-col items-center py-4 space-y-6 border-l">
        <Grid3X3 className="h-5 w-5 text-gray-600 hover:text-gray-900 cursor-pointer" />
        <Type className="h-5 w-5 text-gray-600 hover:text-gray-900 cursor-pointer" />
        <Clipboard className="h-5 w-5 text-gray-600 hover:text-gray-900 cursor-pointer" />
        <CheckSquare className="h-5 w-5 text-gray-600 hover:text-gray-900 cursor-pointer" />
        <Settings className="h-5 w-5 text-gray-600 hover:text-gray-900 cursor-pointer" />
      </div>

      <NewConversationDialog
        open={showNewConversation}
        onOpenChange={setShowNewConversation}
        onConversationCreated={(conversationId) => {
          setSelectedConversation(conversationId);
          getUserConversations();
          getContacts();
        }}
      />
    </div>
  );
}
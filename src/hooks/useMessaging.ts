import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Contact {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  other_participant?: {
    id: string;
    full_name: string;
    email: string;
  };
  last_message?: {
    content: string;
    sender_id: string;
  };
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  attachments: any[];
  read_at: string | null;
  created_at: string;
  sender?: {
    full_name: string;
    email: string;
  };
}

export const useMessaging = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  // Get or create conversation between two users
  const getOrCreateConversation = async (otherUserId: string): Promise<string | null> => {
    if (!user) throw new Error("User not authenticated");

    try {
      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_1_id.eq.${user.id},participant_2_id.eq.${otherUserId}),and(participant_1_id.eq.${otherUserId},participant_2_id.eq.${user.id})`)
        .single();

      if (existingConversation) {
        return existingConversation.id;
      }

      // Create new conversation
      const { data: newConversation, error } = await supabase
        .from('conversations')
        .insert({
          participant_1_id: user.id,
          participant_2_id: otherUserId
        })
        .select('id')
        .single();

      if (error) throw error;
      return newConversation.id;

    } catch (error) {
      console.error('Error getting/creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      });
      return null;
    }
  };

  // Get user conversations
  const getUserConversations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          messages!inner (
            content,
            sender_id,
            created_at
          )
        `)
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Get participant details
      const userIds = data?.flatMap(conv => [conv.participant_1_id, conv.participant_2_id]) || [];
      const otherUserIds = userIds.filter(id => id !== user.id);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', otherUserIds);

      // Map conversations with participant details and last message
      const conversationsWithDetails = data?.map(conv => {
        const otherParticipantId = conv.participant_1_id === user.id ? conv.participant_2_id : conv.participant_1_id;
        const otherParticipant = profiles?.find(p => p.id === otherParticipantId);
        
        // Get last message
        const lastMessage = conv.messages && conv.messages.length > 0 
          ? conv.messages.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
          : null;

        return {
          ...conv,
          other_participant: otherParticipant,
          last_message: lastMessage
        };
      }) || [];

      setConversations(conversationsWithDetails);

    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get messages for a conversation
  const getConversationMessages = async (conversationId: string) => {
    setLoading(true);
    try {
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get sender details separately
      const senderIds = messagesData?.map(msg => msg.sender_id).filter(Boolean) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', senderIds);

      const messagesWithSender = messagesData?.map(msg => ({
        ...msg,
        attachments: Array.isArray(msg.attachments) ? msg.attachments : [],
        sender: profiles?.find(p => p.id === msg.sender_id)
      })) || [];

      setMessages(messagesWithSender as Message[]);

    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get all contacts (users)
  const getContacts = async () => {
    try {
      setLoading(true);
      const { data: contactsData, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .neq('id', user?.id); // Exclude current user

      if (error) throw error;

      setContacts(contactsData as Contact[]);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch contacts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const sendMessage = async (conversationId: string, content: string, attachments: any[] = []) => {
    if (!user) throw new Error("User not authenticated");

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          attachments
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Message sent successfully",
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (conversationId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .is('read_at', null);

    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('New message received:', payload);
          // Refresh conversations to update last message
          getUserConversations();
        }
      )
      .subscribe();

    // Subscribe to conversation updates
    const conversationsChannel = supabase
      .channel('conversations-channel')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          console.log('Conversation updated:', payload);
          getUserConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(conversationsChannel);
    };
  }, [user]);

  return {
    conversations,
    contacts,
    messages,
    loading,
    getOrCreateConversation,
    getUserConversations,
    getContacts,
    getConversationMessages,
    sendMessage,
    markMessagesAsRead
  };
};
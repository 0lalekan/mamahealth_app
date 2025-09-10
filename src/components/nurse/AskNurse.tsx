import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, MessageSquare, Bot, User as UserIcon, Stethoscope, Trash2, MessageCircle, Loader2, ArrowLeft } from "lucide-react";
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Conversation {
  id: string;
  created_at: string;
  status: string;
  // This would be ideal to have from a DB function later
  last_message_content?: string;
  last_message_time?: string;
}

interface Message {
  id: number | string;
  conversation_id: string;
  sender_id: string | null;
  sender_type: 'user' | 'nurse' | 'ai';
  content: string;
  created_at: string;
}

export const AskNurse = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<"ai" | "human">("ai");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }
    // No need to set isLoading here, as it can cause jarring UI shifts for real-time updates
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', selectedConversation.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
    } else {
      setMessages(data as Message[]);
    }
  }, [selectedConversation]); // Dependency on selectedConversation

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;
      setIsLoading(true);
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error("Error fetching conversations:", error);
      } else {
        setConversations(data as Conversation[]);
      }
      setIsLoading(false);
    };
    fetchConversations();
  }, [user]);

  // Fetch messages for selected conversation
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!selectedConversation) return;

    const channel = supabase
      .channel(`chat:${selectedConversation.id}`)
      .on<Message>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${selectedConversation.id}`,
        },
        (payload) => {
          // Refetch messages to ensure consistency and avoid race conditions
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation, fetchMessages]);
  
  if (!profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  const handleSendToAI = async () => {
    if (!input.trim() || !user) return;
    setIsLoading(true);
    const messageContent = input;
    setInput("");

    // Optimistically add user's message to the UI
    const tempMessageId = Date.now().toString();
    const userMessage: Message = {
      id: tempMessageId,
      conversation_id: selectedConversation?.id ?? "temp",
      sender_id: user.id,
      sender_type: "user",
      content: messageContent,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      let conversationId = selectedConversation?.id;
      if (!conversationId) {
        const { data: convData, error: convError } = await supabase
          .from('chat_conversations')
          .insert({ user_id: user.id })
          .select()
          .single();
        if (convError) throw convError;
        conversationId = convData.id;
        const newConv = convData as Conversation;
        setConversations([newConv, ...conversations]);
        setSelectedConversation(newConv);
        setIsCreatingNew(false);
        // Remove optimistic temp message and fetch real messages
        setMessages([]);
        await fetchMessages();
      }
      // Save user's message to the database
      const { error: userMessageError } = await supabase.from('chat_messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        sender_type: 'user',
        content: messageContent,
      });
      if (userMessageError) throw userMessageError;
      // Call the Edge Function for AI response
      const { error: invokeError } = await supabase.functions.invoke('get-ai-response', {
        body: { message: messageContent, conversation_id: conversationId, user_id: user.id },
      });
      if (invokeError) throw invokeError;
      // Always fetch messages after sending
      await fetchMessages();
    } catch (error: any) {
      console.error('Error sending AI message:', error);
      toast({
        title: "Error",
        description: "Could not send message to AI. " + error.message,
        variant: "destructive",
      });
      // Revert optimistic update on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessageId));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToHuman = async () => {
    if (!input.trim() || !user) return;

    setIsLoading(true);
    const messageContent = input;
    setInput("");

    const tempMessageId = Date.now().toString();

    try {
      let conversationId = selectedConversation?.id;

      // Step 1: Ensure a conversation exists, or create one.
      if (!conversationId) {
        const { data: convData, error: convError } = await supabase
          .from('chat_conversations')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (convError) throw convError;

        conversationId = convData.id;
        const newConv = convData as Conversation;
        setConversations([newConv, ...conversations]);
        setSelectedConversation(newConv);
        setIsCreatingNew(false); // <-- Ensure new chat state is reset
        // Remove optimistic temp message and fetch real messages
        setMessages([]);
        await fetchMessages();
      }
      
      const finalConversationId = conversationId;

      // Optimistically add user's message to the UI
      const userMessage: Message = {
        id: tempMessageId,
        conversation_id: finalConversationId,
        sender_id: user.id,
        content: messageContent,
        sender_type: "user",
        created_at: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, userMessage]);

      // Step 2: Save user's message to the database
      const { error: insertError } = await supabase.from("chat_messages").insert({
        conversation_id: finalConversationId,
        sender_id: user.id,
        content: messageContent,
        sender_type: "user",
      });

      if (insertError) throw insertError;

      // Step 3: Check if a nurse has already replied in this conversation
      const { data: nurseMessages, error: nurseCheckError } = await supabase
        .from('chat_messages')
        .select('id')
        .eq('conversation_id', finalConversationId)
        .eq('sender_type', 'nurse');

      if (nurseCheckError) {
        // Don't throw, just log it. The worst case is a duplicate notification.
        console.error("Error checking for nurse messages:", nurseCheckError);
      }

      const hasNurseReply = (nurseMessages?.length ?? 0) > 0;

      // Step 4: Always send a notification to the Telegram group for every user message
      const { error: functionError } = await supabase.functions.invoke("telegram-chat", {
        body: {
          conversation_id: finalConversationId,
          message: messageContent,
          user_id: user.id,
          user_name: profile?.full_name || "A user",
        },
      });
      if (functionError) throw functionError;
      // Always fetch messages after sending and notification
      await fetchMessages();
    } catch (error: any) {
      console.error("Error sending message to human:", error);
      toast({
        title: "Error",
        description: "Could not send message. " + error.message,
        variant: "destructive",
      });
      // Revert optimistic update on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessageId));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (chatMode === "ai") {
      handleSendToAI();
    } else {
      handleSendToHuman();
    }
  };

  const handleNewConversation = () => {
    setSelectedConversation(null);
    setMessages([]);
    setIsCreatingNew(true);
    setInput("");
  };

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    setIsCreatingNew(false);
  };
  
  const handleDeleteConversation = async (conversationId: string) => {
    if (!window.confirm("Are you sure you want to delete this conversation? This cannot be undone.")) {
      return;
    }

    const { error } = await supabase
      .from('chat_conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      toast({
        title: "Error",
        description: "Could not delete the conversation. " + error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Conversation deleted.",
      });
      setConversations(conversations.filter(c => c.id !== conversationId));
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }
    }
  };

  // Persist selectedConversation and isCreatingNew in localStorage
  useEffect(() => {
    if (selectedConversation) {
      localStorage.setItem('askNurse.selectedConversationId', selectedConversation.id);
    } else {
      localStorage.removeItem('askNurse.selectedConversationId');
    }
    localStorage.setItem('askNurse.isCreatingNew', JSON.stringify(isCreatingNew));
  }, [selectedConversation, isCreatingNew]);

  // Restore selectedConversation and isCreatingNew from localStorage on mount
  useEffect(() => {
    const savedId = localStorage.getItem('askNurse.selectedConversationId');
    const savedIsCreatingNew = localStorage.getItem('askNurse.isCreatingNew');
    if (savedIsCreatingNew === 'true') {
      setIsCreatingNew(true);
    } else if (savedId && conversations.length > 0) {
      const found = conversations.find(c => c.id === savedId);
      if (found) setSelectedConversation(found);
    }
  }, [conversations]);

  return (
    <div className="h-[80vh] bg-gradient-soft flex flex-col">
      <PageHeader
        title="Ask a Nurse"
        subtitle={chatMode === 'ai' ? 'Chat with AI or switch to a human nurse' : 'You\'re chatting with a human nurse'}
        icon={<MessageSquare className="h-6 w-6" />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleNewConversation}
              className="hidden sm:inline-flex"
            >
              New
            </Button>
            {selectedConversation && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteConversation(selectedConversation.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <Button asChild variant="outline" size="sm">
              <a href="https://wa.me/2347065159895" target="_blank" rel="noopener noreferrer" className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </a>
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-hidden px-4 md:px-6 pb-6">
        <div className="h-full w-full flex md:grid md:grid-cols-3">
          {/* Sidebar (mobile shows when no conversation selected) */}
          <div className={cn(
            "flex flex-col min-h-0 w-full md:col-span-1 border-r bg-white/60 backdrop-blur rounded-md md:rounded-none md:bg-transparent md:backdrop-blur-none md:border-r",
            (selectedConversation || isCreatingNew) && "hidden md:flex"
          )}>
            <div className="p-4 border-b flex items-center gap-2">
              {selectedConversation && (
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedConversation(null)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <h2 className="font-semibold text-sm flex-1">Conversations</h2>
              <Button variant="outline" size="sm" onClick={handleNewConversation} className="md:hidden">New</Button>
            </div>
            <div className="p-4 hidden md:block">
              <Button className="w-full" onClick={handleNewConversation}>New Conversation</Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={cn(
                    "w-full text-left p-4 border-b hover:bg-primary/10",
                    selectedConversation?.id === conv.id && "bg-primary/10"
                  )}
                >
                  <p className="font-semibold truncate">{format(new Date(conv.created_at), 'MMM d, yyyy')}</p>
                  <p className="text-xs text-muted-foreground capitalize">{conv.status}</p>
                </button>
              ))}
              {conversations.length === 0 && (
                <p className="text-center text-xs text-muted-foreground p-4">No conversations yet.</p>
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className={cn(
            "flex flex-col min-h-0 w-full md:col-span-2 bg-white/60 dark:bg-muted/30 backdrop-blur rounded-md border md:border-0 md:rounded-none transition-colors",
            !(selectedConversation || isCreatingNew) && "hidden md:flex"
          )}>
            {(selectedConversation || isCreatingNew) && (
              <div className="md:hidden p-2 border-b flex items-center gap-2 bg-background/60 backdrop-blur">
                <Button variant="ghost" size="sm" onClick={() => { setSelectedConversation(null); setIsCreatingNew(false); }} aria-label="Back to conversations">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <p className="font-medium text-sm">Conversation</p>
              </div>
            )}
            <div className="flex-1 p-4 overflow-y-auto space-y-4" style={{ maxHeight: "calc(80vh - 200px)" }}>
              {selectedConversation ? (
                messages.map(msg => {
                  const isUser = msg.sender_type === 'user';
                  const isAI = msg.sender_type === 'ai';
                  const isNurse = msg.sender_type === 'nurse';
                  const bubbleStyles = cn(
                    'relative p-3 rounded-2xl max-w-md shadow-sm text-sm leading-relaxed',
                    isUser && 'bg-primary text-primary-foreground',
                    isAI && 'bg-secondary/70 text-secondary-foreground border border-primary/20 dark:bg-secondary/40',
                    isNurse && 'bg-accent/60 text-accent-foreground border border-accent/40 dark:bg-accent/40',
                    !isUser && !isAI && !isNurse && 'bg-muted'
                  );
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex items-end gap-2 group',
                        isUser ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {!isUser && (
                        <Avatar className="h-8 w-8 ring-2 ring-background/50">
                          <AvatarFallback className={cn(
                            'text-[10px] font-medium',
                            isAI && 'bg-primary/15 text-primary',
                            isNurse && 'bg-accent/30 text-accent-foreground'
                          )}>
                            {isAI ? <Bot className="h-4 w-4" /> : <Stethoscope className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={bubbleStyles}>
                        {isAI && <span className="absolute -top-2 left-3 text-[10px] px-1 py-0.5 rounded bg-primary/20 text-primary tracking-wide">AI</span>}
                        {isNurse && <span className="absolute -top-2 left-3 text-[10px] px-1 py-0.5 rounded bg-accent/50 text-accent-foreground tracking-wide">Nurse</span>}
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        <p className="text-[10px] opacity-70 mt-1 text-right font-medium">
                          {format(new Date(msg.created_at), 'h:mm a')}
                        </p>
                      </div>
                      {isUser && (
                        <Avatar className="h-8 w-8 ring-2 ring-background/50">
                          <AvatarImage src={profile?.avatar_url} />
                          <AvatarFallback className="bg-primary/15 text-primary">
                            <UserIcon className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                  <p>Select a conversation or start a new one.</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t bg-white dark:bg-secondary/30 backdrop-blur supports-[backdrop-filter]:bg-secondary/20">
              <div className="flex justify-center mb-3">
                <div className="inline-flex rounded-full bg-muted/60 dark:bg-muted/40 p-1 shadow-inner border border-border/60">
                  <Button
                    size="sm"
                    type="button"
                    onClick={() => setChatMode('ai')}
                    variant={chatMode === 'ai' ? 'default' : 'ghost'}
                    className={cn(
                      'px-4 rounded-full',
                      chatMode === 'ai'
                        ? 'bg-primary text-primary-foreground shadow'
                        : 'hover:bg-muted/70 dark:hover:bg-muted/60'
                    )}
                    aria-pressed={chatMode === 'ai'}
                  >
                    <Bot className="h-4 w-4 mr-2" /> AI
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    onClick={() => setChatMode('human')}
                    variant={chatMode === 'human' ? 'default' : 'ghost'}
                    className={cn(
                      'px-4 rounded-full',
                      chatMode === 'human'
                        ? 'bg-primary text-primary-foreground shadow'
                        : 'hover:bg-muted/70 dark:hover:bg-muted/60'
                    )}
                    aria-pressed={chatMode === 'human'}
                  >
                    <Stethoscope className="h-4 w-4 mr-2" /> Human
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Textarea
                  placeholder={
                    chatMode === 'ai'
                      ? 'Chat with our AI assistant...'
                      : 'Send a message to a human nurse...'
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="pr-14 min-h-[70px] resize-y"
                />
                <Button
                  type="submit"
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={isLoading}
                  className="absolute top-3 right-3 rounded-full shadow-md hover:shadow-lg transition-shadow"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span className="sr-only">Send message</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
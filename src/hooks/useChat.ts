import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface UseChatOptions {
  characterId: string;
  characterName: string;
  personalityPrompt: string;
}

export const useChat = ({ characterId, characterName, personalityPrompt }: UseChatOptions) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { user } = useAuth();

  const initializeConversation = useCallback(async () => {
    if (!user) return null;

    try {
      // Check for existing conversation
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("user_id", user.id)
        .eq("character_id", characterId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (existing) {
        setConversationId(existing.id);
        
        // Load existing messages
        const { data: existingMessages } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", existing.id)
          .order("created_at", { ascending: true });

        if (existingMessages) {
          setMessages(existingMessages.map(m => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
          })));
        }

        return existing.id;
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from("conversations")
        .insert({ user_id: user.id, character_id: characterId })
        .select()
        .single();

      if (error) throw error;

      setConversationId(newConv.id);
      return newConv.id;

    } catch (error) {
      console.error("Failed to initialize conversation:", error);
      return null;
    }
  }, [user, characterId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: content.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Save user message if authenticated
      let convId = conversationId;
      if (user && !convId) {
        convId = await initializeConversation();
      }

      if (user && convId) {
        await supabase.from("messages").insert({
          conversation_id: convId,
          role: "user",
          content: content.trim(),
        });
      }

      // Get AI response
      const response = await supabase.functions.invoke("chat", {
        body: {
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          characterId,
          characterName,
          personalityPrompt,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to get response");
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.data.message,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save assistant message if authenticated
      if (user && convId) {
        await supabase.from("messages").insert({
          conversation_id: convId,
          role: "assistant",
          content: response.data.message,
        });

        // Update conversation timestamp
        await supabase
          .from("conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", convId);
      }

    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to send message";
      toast.error(errorMessage);
      
      // Remove the user message on error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, conversationId, user, characterId, characterName, personalityPrompt, initializeConversation]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationId(null);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    initializeConversation,
  };
};

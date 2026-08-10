import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, History, MessageCircle, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { GmailButton } from "@/components/GmailButton";
import { PageTransition } from "@/components/PageTransition";
import { getCharacterById } from "@/data/characters";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  character_id: string;
  updated_at: string;
  messageCount: number;
}

const HistoryPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          id,
          character_id,
          updated_at,
          messages(count)
        `)
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      setConversations(
        data.map((conv: { id: string; character_id: string; updated_at: string; messages: { count: number }[] }) => ({
          id: conv.id,
          character_id: conv.character_id,
          updated_at: conv.updated_at,
          messageCount: conv.messages[0]?.count || 0,
        }))
      );
    } catch (error) {
      console.error("Failed to load conversations:", error);
      toast.error("Failed to load chat history");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", conversationId);

      if (error) throw error;

      setConversations(prev => prev.filter(c => c.id !== conversationId));
      toast.success("Conversation deleted");
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      toast.error("Failed to delete conversation");
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-32 pb-20 px-4">
          <div className="container mx-auto max-w-3xl">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="mb-8 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Gallery
            </Button>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-4">
                <History className="w-8 h-8 text-primary" />
                <h1 className="font-serif text-4xl font-bold">Chat History</h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Resume your past conversations with historical figures.
              </p>
            </motion.div>

            {/* Conversations List */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : conversations.length > 0 ? (
              <div className="space-y-4">
                {conversations.map((conversation, index) => {
                  const character = getCharacterById(conversation.character_id);
                  if (!character) return null;

                  return (
                    <motion.div
                      key={conversation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                      onClick={() => navigate(`/chat/${character.id}`)}
                      className="group glass-card border border-border rounded-xl p-5 cursor-pointer transition-all duration-300 hover:border-primary/50 hover:glow-gold"
                    >
                      <div className="flex items-center gap-4">
                        {/* Portrait */}
                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/50 shrink-0">
                          <img
                            src={character.portraitUrl}
                            alt={character.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                            {character.name}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3.5 h-3.5" />
                              {conversation.messageCount} messages
                            </span>
                            <span>•</span>
                            <span>
                              {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>

                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDeleteConversation(conversation.id, e)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-center py-16"
              >
                <MessageCircle className="w-16 h-16 mx-auto mb-6 text-muted-foreground/30" />
                <h2 className="font-serif text-2xl font-semibold mb-4">
                  No conversations yet
                </h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Start chatting with historical figures and your conversations will be saved here.
                </p>
                <Button onClick={() => navigate("/")}>
                  Start a Conversation
                </Button>
              </motion.div>
            )}
          </div>
        </main>

        <GmailButton />
      </div>
    </PageTransition>
  );
};

export default HistoryPage;

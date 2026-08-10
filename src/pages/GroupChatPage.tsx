import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Users, Check, Volume2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { PageTransition } from "@/components/PageTransition";
import { ChatMessage } from "@/components/ChatMessage";
import { TypingIndicator } from "@/components/TypingIndicator";
import { characters, Character, getCategoryLabel } from "@/data/characters";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface GroupMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  characterId?: string;
  characterName?: string;
  characterImage?: string;
}

const GroupChatPage = () => {
  const navigate = useNavigate();
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<Character | null>(null);
  const [respondingIndex, setRespondingIndex] = useState(-1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { generateAndPlayAudio, stopAudio, getAudioState } = useTextToSpeech();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const toggleCharacter = (character: Character) => {
    setSelectedCharacters(prev =>
      prev.find(c => c.id === character.id)
        ? prev.filter(c => c.id !== character.id)
        : [...prev, character]
    );
  };

  const startGroupChat = () => {
    if (selectedCharacters.length < 2) {
      toast.error("Select at least 2 characters for group chat");
      return;
    }
    setStarted(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: GroupMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Each selected character responds sequentially
    for (let i = 0; i < selectedCharacters.length; i++) {
      const character = selectedCharacters[i];
      setCurrentSpeaker(character);
      setRespondingIndex(i);

      try {
        const allMessages = [...messages, userMsg];

        const response = await supabase.functions.invoke("chat", {
          body: {
            messages: allMessages.map(m => ({
              role: m.role,
              content: m.role === "assistant" && m.characterName
                ? `[${m.characterName}]: ${m.content}`
                : m.content,
            })),
            characterId: character.id,
            characterName: character.name,
            personalityPrompt: character.personalityPrompt + " You are in a group conversation with other historical figures. Be aware of what others have said and respond naturally. Keep your response to 2-4 sentences maximum, under 80 words.",
          },
        });

        if (response.error) throw new Error(response.error.message);

        const assistantMsg: GroupMessage = {
          id: `${character.id}-${Date.now()}`,
          role: "assistant",
          content: response.data.message,
          characterId: character.id,
          characterName: character.name,
          characterImage: character.portraitUrl,
        };

        setMessages(prev => [...prev, assistantMsg]);

        // Auto-play audio for this character
        try {
          await generateAndPlayAudioSequential(assistantMsg.id, response.data.message, character.voiceId);
        } catch {
          // Audio failed, continue to next character
        }
      } catch (error) {
        console.error(`Error getting response from ${character.name}:`, error);
      }
    }

    setIsLoading(false);
    setCurrentSpeaker(null);
    setRespondingIndex(-1);
  };

  const generateAndPlayAudioSequential = (messageId: string, text: string, voiceId: string): Promise<void> => {
    return new Promise(async (resolve) => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ text, voiceId }),
          }
        );

        if (!response.ok) {
          resolve();
          return;
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audio.onended = () => resolve();
        audio.onerror = () => resolve();

        await audio.play();
      } catch {
        resolve();
      }
    });
  };

  const handlePlayAudio = (messageId: string, content: string, voiceId: string) => {
    generateAndPlayAudio(messageId, content, voiceId);
  };

  // Selection screen
  if (!started) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 pt-28 pb-12">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-6 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Gallery
            </Button>

            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-primary/10 border border-primary/30">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Group Conversation</span>
              </div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                <span className="text-foreground">Create a </span>
                <span className="text-gradient-gold">Group Chat</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Select 2 or more historical figures to start a group conversation.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
              {characters.map((character) => {
                const isSelected = selectedCharacters.find(c => c.id === character.id);
                return (
                  <motion.button
                    key={character.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => toggleCharacter(character)}
                    className={cn(
                      "relative rounded-lg overflow-hidden border-2 transition-all duration-300 text-left",
                      isSelected
                        ? "border-primary glow-gold"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="aspect-[3/4] relative">
                      <img
                        src={character.portraitUrl}
                        alt={character.name}
                        className="w-full h-full object-cover object-top"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <span className="text-[10px] uppercase tracking-wide text-primary font-medium">
                        {getCategoryLabel(character.category)}
                      </span>
                      <h3 className="font-serif text-sm font-semibold text-foreground truncate">
                        {character.name}
                      </h3>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="text-center">
              <Button
                size="lg"
                onClick={startGroupChat}
                disabled={selectedCharacters.length < 2}
                className="rounded-full px-8 py-6 text-lg"
              >
                <Users className="w-5 h-5 mr-2" />
                Start Group Chat ({selectedCharacters.length} selected)
              </Button>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  // Chat screen
  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <div className="flex-1 flex pt-20">
          {/* Left Panel - Current Speaker Portrait */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:flex flex-col w-80 border-r border-border p-6"
          >
            <Button variant="ghost" size="sm" onClick={() => { setStarted(false); setMessages([]); }} className="w-fit mb-6 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Change Characters
            </Button>

            {/* Current Speaker Portrait */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSpeaker?.id || "idle"}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="portrait-frame aspect-square mb-6 relative overflow-hidden">
                  <motion.img
                    src={currentSpeaker?.portraitUrl || selectedCharacters[0]?.portraitUrl}
                    alt={currentSpeaker?.name || selectedCharacters[0]?.name}
                    className="w-full h-full object-cover"
                    animate={currentSpeaker ? {
                      scale: [1, 1.012, 1],
                    } : {
                      scale: [1, 1.008, 1],
                    }}
                    transition={currentSpeaker ? {
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    } : {
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
                <h2 className="font-serif text-2xl font-bold text-foreground text-center">
                  {currentSpeaker?.name || selectedCharacters[0]?.name}
                </h2>
                <p className="text-sm text-muted-foreground text-center">
                  {currentSpeaker ? "Speaking..." : "Waiting..."}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Participants */}
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">Participants</p>
              <div className="space-y-2">
                {selectedCharacters.map((char) => (
                  <div key={char.id} className={cn(
                    "flex items-center gap-2 p-2 rounded-lg transition-all duration-300",
                    currentSpeaker?.id === char.id ? "bg-primary/10 border border-primary/30" : "opacity-60"
                  )}>
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-border">
                      <img src={char.portraitUrl} alt={char.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm font-medium text-foreground truncate">{char.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.aside>

          {/* Chat Area */}
          <main className="flex-1 flex flex-col">
            {/* Mobile header */}
            <div className="lg:hidden flex items-center gap-4 p-4 border-b border-border">
              <Button variant="ghost" size="icon" onClick={() => { setStarted(false); setMessages([]); }}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="font-serif font-semibold">Group Chat</span>
                <span className="text-xs text-muted-foreground">({selectedCharacters.length} figures)</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              {messages.length === 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
                  <div className="flex justify-center gap-2 mb-6">
                    {selectedCharacters.slice(0, 4).map((char) => (
                      <div key={char.id} className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/50">
                        <img src={char.portraitUrl} alt={char.name} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {selectedCharacters.length > 4 && (
                      <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center text-sm text-primary font-medium">
                        +{selectedCharacters.length - 4}
                      </div>
                    )}
                  </div>
                  <h3 className="font-serif text-xl font-semibold mb-2">Group Conversation</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    Ask a question and each historical figure will share their unique perspective.
                  </p>
                </motion.div>
              )}

              <AnimatePresence>
                {messages.map((message) => {
                  const audioState = getAudioState(message.id);
                  const msgChar = message.characterId ? selectedCharacters.find(c => c.id === message.characterId) : null;
                  return (
                    <ChatMessage
                      key={message.id}
                      role={message.role}
                      content={message.content}
                      characterName={message.characterName}
                      characterImage={message.characterImage}
                      isPlaying={audioState.isPlaying}
                      isLoadingAudio={audioState.isLoading}
                      audioError={audioState.error}
                      onPlayAudio={message.role === "assistant" && msgChar
                        ? () => handlePlayAudio(message.id, message.content, msgChar.voiceId)
                        : undefined
                      }
                    />
                  );
                })}
              </AnimatePresence>

              {isLoading && currentSpeaker && (
                <TypingIndicator
                  characterName={currentSpeaker.name}
                  characterImage={currentSpeaker.portraitUrl}
                />
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask the group a question..."
                    disabled={isLoading}
                    className={cn(
                      "pr-12 py-6 text-base rounded-full bg-secondary border-border",
                      "focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    )}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim() || isLoading}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full w-9 h-9"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </PageTransition>
  );
};

export default GroupChatPage;

import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Trash2, Volume2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { ChatMessage } from "@/components/ChatMessage";
import { TypingIndicator } from "@/components/TypingIndicator";
import { GmailButton } from "@/components/GmailButton";
import { PageTransition } from "@/components/PageTransition";
import { getCharacterById, getCategoryLabel } from "@/data/characters";
import { useChat } from "@/hooks/useChat";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const ChatPage = () => {
  const { characterId } = useParams<{ characterId: string }>();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const character = getCharacterById(characterId || "");

  const { messages, isLoading, sendMessage, clearMessages, initializeConversation } = useChat({
    characterId: character?.id || "",
    characterName: character?.name || "",
    personalityPrompt: character?.personalityPrompt || "",
  });

  const { generateAndPlayAudio, stopAudio, getAudioState } = useTextToSpeech();

  // Check if any message is currently playing audio
  const isAnySpeaking = messages.some(m => getAudioState(m.id).isPlaying);

  useEffect(() => {
    if (user && character) {
      initializeConversation();
    }
  }, [user, character, initializeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  if (!character) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-serif text-2xl mb-4">Character not found</h1>
            <Button onClick={() => navigate("/")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return Home
            </Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput("");
    }
  };

  const handlePlayAudio = (messageId: string, content: string) => {
    generateAndPlayAudio(messageId, content, character.voiceId);
  };

  const handleStopAudio = (messageId: string) => {
    stopAudio(messageId);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <div className="flex-1 flex pt-20">
          {/* Left Panel - Character Portrait (smaller) */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden lg:flex flex-col w-72 border-r border-border p-5 items-center"
          >
            {/* Back Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="w-fit self-start mb-4 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {/* Portrait with glow */}
            <div
              className={cn(
                "portrait-frame aspect-square w-full mb-5 overflow-hidden rounded-lg transition-shadow duration-700",
                isAnySpeaking || isLoading
                  ? "shadow-[0_0_30px_8px_hsl(var(--primary)/0.5)]"
                  : "shadow-none"
              )}
            >
              <motion.img
                src={character.portraitUrl}
                alt={character.name}
                className="w-full h-full object-cover"
                animate={
                  isAnySpeaking || isLoading
                    ? { scale: [1, 1.012, 1] }
                    : { scale: [1, 1.008, 1] }
                }
                transition={{
                  duration: isAnySpeaking || isLoading ? 1.5 : 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>

            {/* Character Info */}
            <div className="w-full space-y-3 text-center">
              <span className="inline-block px-3 py-1 text-xs font-medium tracking-wide uppercase rounded-full bg-primary/20 text-primary border border-primary/30">
                {getCategoryLabel(character.category)}
              </span>

              <h2 className="font-serif text-xl font-bold text-foreground">
                {character.name}
              </h2>

              <p className="text-xs text-muted-foreground">
                {character.title} • {character.era}
              </p>

              <div className="pt-3 border-t border-border">
                <p className="text-xs text-secondary-foreground leading-relaxed">
                  {character.shortBio}
                </p>
              </div>

              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Volume2 className="w-3.5 h-3.5 text-primary" />
                  <span>{character.voiceStyle}</span>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Right Panel - Chat (larger) */}
          <main className="flex-1 flex flex-col min-w-0">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center gap-4 p-4 border-b border-border">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full overflow-hidden border-2 transition-shadow duration-700",
                    isAnySpeaking || isLoading
                      ? "border-primary shadow-[0_0_15px_4px_hsl(var(--primary)/0.5)]"
                      : "border-primary/50"
                  )}
                >
                  <img
                    src={character.portraitUrl}
                    alt={character.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="font-serif font-semibold text-foreground">
                    {character.name}
                  </h2>
                  <p className="text-xs text-muted-foreground">{character.title}</p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full overflow-hidden border-2 border-primary/50">
                    <img
                      src={character.portraitUrl}
                      alt={character.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-serif text-xl font-semibold mb-2">
                    Begin your conversation with {character.name}
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    Ask about their life, achievements, philosophy, or anything you've wondered about this remarkable historical figure.
                  </p>
                </motion.div>
              )}

              <AnimatePresence>
                {messages.map((message) => {
                  const audioState = getAudioState(message.id);
                  return (
                    <ChatMessage
                      key={message.id}
                      role={message.role}
                      content={message.content}
                      characterName={message.role === "assistant" ? character.name : undefined}
                      characterImage={message.role === "assistant" ? character.portraitUrl : undefined}
                      isPlaying={audioState.isPlaying}
                      isLoadingAudio={audioState.isLoading}
                      audioError={audioState.error}
                      onPlayAudio={message.role === "assistant" ? () => handlePlayAudio(message.id, message.content) : undefined}
                      onStopAudio={message.role === "assistant" ? () => handleStopAudio(message.id) : undefined}
                    />
                  );
                })}
              </AnimatePresence>

              {isLoading && (
                <TypingIndicator
                  characterName={character.name}
                  characterImage={character.portraitUrl}
                />
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border">
              <form onSubmit={handleSubmit} className="flex gap-3">
                {messages.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={clearMessages}
                    className="shrink-0"
                    title="Clear conversation"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                )}

                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Ask ${character.name} something...`}
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

        {/* Gmail FAB */}
        <GmailButton />
      </div>
    </PageTransition>
  );
};

export default ChatPage;

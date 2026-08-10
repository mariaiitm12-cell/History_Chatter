import { motion } from "framer-motion";
import { Volume2, Loader2, User, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  characterName?: string;
  characterImage?: string;
  isPlaying?: boolean;
  isLoadingAudio?: boolean;
  onPlayAudio?: () => void;
  onStopAudio?: () => void;
  audioError?: boolean;
}

export const ChatMessage = ({
  role,
  content,
  characterName,
  characterImage,
  isPlaying = false,
  isLoadingAudio = false,
  onPlayAudio,
  onStopAudio,
  audioError = false,
}: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex gap-4 max-w-4xl",
        isUser ? "ml-auto flex-row-reverse" : ""
      )}
    >
      {/* Avatar */}
      <div className={cn(
        "shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 flex items-center justify-center",
        isUser 
          ? "bg-primary/20 border-primary/30" 
          : "border-primary/50"
      )}>
        {isUser ? (
          <User className="w-5 h-5 text-primary" />
        ) : (
          characterImage && (
            <img 
              src={characterImage} 
              alt={characterName} 
              className="w-full h-full object-cover"
            />
          )
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        "flex-1 max-w-[80%]",
        isUser ? "text-right" : ""
      )}>
        {/* Name */}
        {!isUser && characterName && (
          <p className="text-sm font-medium text-primary mb-1">
            {characterName}
          </p>
        )}
        
        {/* Message Bubble */}
        <div className={cn(
          "inline-block rounded-2xl px-5 py-3",
          isUser 
            ? "bg-primary text-primary-foreground rounded-tr-md" 
            : "glass-card border border-border rounded-tl-md"
        )}>
          {isUser ? (
            <p className="text-sm leading-relaxed">{content}</p>
          ) : (
            <div className="prose prose-sm prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>,
                  strong: ({ children }) => <strong className="text-primary font-semibold">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Audio Controls for Assistant */}
        {!isUser && (onPlayAudio || onStopAudio) && (
          <div className="mt-2 flex items-center gap-2">
            {isPlaying ? (
              <button
                onClick={onStopAudio}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-destructive/20 text-destructive hover:bg-destructive/30 transition-all duration-300"
                title="Stop audio"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                onClick={onPlayAudio}
                disabled={isLoadingAudio}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300",
                  audioError
                    ? "bg-destructive/20 text-destructive/70 cursor-not-allowed"
                    : "bg-secondary hover:bg-primary/20 text-muted-foreground hover:text-primary"
                )}
                title={audioError ? "Voice unavailable" : "Play audio"}
              >
                {isLoadingAudio ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating voice...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{audioError ? "Voice unavailable" : "Listen"}</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

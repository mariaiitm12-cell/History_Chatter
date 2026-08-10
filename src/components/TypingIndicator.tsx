import { motion } from "framer-motion";

interface TypingIndicatorProps {
  characterName: string;
  characterImage?: string;
}

export const TypingIndicator = ({ characterName, characterImage }: TypingIndicatorProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex gap-4 max-w-4xl"
    >
      {/* Avatar */}
      <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 border-primary/50">
        {characterImage && (
          <img 
            src={characterImage} 
            alt={characterName} 
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Typing Bubble */}
      <div className="flex-1">
        <p className="text-sm font-medium text-primary mb-1">
          {characterName}
        </p>
        <div className="inline-block glass-card border border-border rounded-2xl rounded-tl-md px-5 py-4">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-primary"
                animate={{
                  y: [0, -6, 0],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {characterName} is thinking...
        </p>
      </div>
    </motion.div>
  );
};

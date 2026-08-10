import { motion } from "framer-motion";
import { Character, getCategoryLabel } from "@/data/characters";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface CharacterCardProps {
  character: Character;
  onClick: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
  index: number;
}

export const CharacterCard = ({ 
  character, 
  onClick, 
  isFavorite = false,
  onToggleFavorite,
  index 
}: CharacterCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative portrait-frame bg-card overflow-hidden transition-all duration-500 group-hover:glow-gold">
        {/* Portrait Image */}
        <div className="aspect-[3/4] relative overflow-hidden">
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-30",
            character.accentColor
          )} />
          <img
            src={character.portraitUrl}
            alt={character.name}
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
          
          {/* Favorite Button */}
          {onToggleFavorite && (
            <button
              onClick={onToggleFavorite}
              className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm transition-all duration-300 hover:bg-primary/20 z-10"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart 
                className={cn(
                  "w-5 h-5 transition-all duration-300",
                  isFavorite ? "fill-primary text-primary" : "text-foreground/60 hover:text-primary"
                )} 
              />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          {/* Category Badge */}
          <span className="inline-block px-3 py-1 mb-3 text-xs font-medium tracking-wide uppercase rounded-full bg-primary/20 text-primary border border-primary/30">
            {getCategoryLabel(character.category)}
          </span>
          
          {/* Name */}
          <h3 className="font-serif text-xl font-semibold text-foreground mb-1 group-hover:text-gradient-gold transition-all duration-300">
            {character.name}
          </h3>
          
          {/* Title */}
          <p className="text-sm text-muted-foreground mb-2">
            {character.title}
          </p>
          
          {/* Era */}
          <p className="text-xs text-muted-foreground/70">
            {character.era}
          </p>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>
    </motion.div>
  );
};

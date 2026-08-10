import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, MessageCircle, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { CharacterCard } from "@/components/CharacterCard";
import { GmailButton } from "@/components/GmailButton";
import { PageTransition } from "@/components/PageTransition";
import { characters } from "@/data/characters";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleCharacterClick = (characterId: string) => {
    navigate(`/chat/${characterId}`);
  };

  const handleToggleFavorite = (characterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(characterId);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-hero-pattern pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/10 via-transparent to-transparent pointer-events-none" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto text-center"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-primary/10 border border-primary/30"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">AI-Powered Historical Conversations</span>
              </motion.div>

              {/* Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
              >
                <span className="text-foreground">Converse With The </span>
                <span className="text-gradient-gold">Greatest Minds</span>
                <span className="text-foreground"> In History</span>
              </motion.h1>

              {/* Subheading */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
              >
                Chat with legendary scientists, explorers, philosophers, and leaders — 
                and hear them speak through realistic AI voices.
              </motion.p>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <Button
                  size="lg"
                  onClick={() => document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth" })}
                  className="group text-lg px-8 py-6 rounded-full bg-primary text-primary-foreground hover:glow-gold transition-all duration-300"
                >
                  Start Exploring History
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>

              {/* Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex flex-wrap justify-center gap-8 mt-16"
              >
                {[
                  { icon: MessageCircle, label: "Interactive Chat" },
                  { icon: Volume2, label: "AI Voice Synthesis" },
                  { icon: Sparkles, label: "Authentic Personalities" },
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-muted-foreground">
                    <feature.icon className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">{feature.label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Gallery Section */}
        <section id="gallery" className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                <span className="text-foreground">Meet The </span>
                <span className="text-gradient-gold">Legends</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Select a historical figure to begin your conversation through time.
              </p>
            </motion.div>

            {/* Character Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {characters.map((character, index) => (
                <CharacterCard
                  key={character.id}
                  character={character}
                  onClick={() => handleCharacterClick(character.id)}
                  index={index}
                  isFavorite={user ? isFavorite(character.id) : false}
                  onToggleFavorite={user ? (e) => handleToggleFavorite(character.id, e) : undefined}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-border">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} HistoryChat. Powered by AI. Made with curiosity.
            </p>
          </div>
        </footer>

        {/* Gmail FAB */}
        <GmailButton />
      </div>
    </PageTransition>
  );
};

export default Index;

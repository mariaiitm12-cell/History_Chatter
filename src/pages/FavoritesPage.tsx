import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { CharacterCard } from "@/components/CharacterCard";
import { GmailButton } from "@/components/GmailButton";
import { PageTransition } from "@/components/PageTransition";
import { characters, getCharacterById } from "@/data/characters";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const FavoritesPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const favoriteCharacters = characters.filter(c => favorites.includes(c.id));

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

        <main className="pt-32 pb-20 px-4">
          <div className="container mx-auto">
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
                <Heart className="w-8 h-8 text-primary fill-primary" />
                <h1 className="font-serif text-4xl font-bold">Your Favorites</h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Historical figures you've saved for quick access.
              </p>
            </motion.div>

            {/* Favorites Grid */}
            {favoriteCharacters.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {favoriteCharacters.map((character, index) => (
                  <CharacterCard
                    key={character.id}
                    character={character}
                    onClick={() => handleCharacterClick(character.id)}
                    index={index}
                    isFavorite={isFavorite(character.id)}
                    onToggleFavorite={(e) => handleToggleFavorite(character.id, e)}
                  />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-center py-16"
              >
                <Heart className="w-16 h-16 mx-auto mb-6 text-muted-foreground/30" />
                <h2 className="font-serif text-2xl font-semibold mb-4">
                  No favorites yet
                </h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Click the heart icon on any character card to add them to your favorites for quick access.
                </p>
                <Button onClick={() => navigate("/")}>
                  Browse Historical Figures
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

export default FavoritesPage;

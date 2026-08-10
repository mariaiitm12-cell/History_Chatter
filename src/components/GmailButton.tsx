import { motion } from "framer-motion";
import { Mail } from "lucide-react";

export const GmailButton = () => {
  const handleClick = () => {
    window.location.href = "mailto:ts2818099@gmail.com";
  };

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center transition-all duration-300 hover:glow-gold"
      aria-label="Contact via Gmail"
      title="Contact via Gmail"
    >
      <Mail className="w-6 h-6" />
    </motion.button>
  );
};

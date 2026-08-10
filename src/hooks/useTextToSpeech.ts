import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";

interface AudioState {
  isLoading: boolean;
  isPlaying: boolean;
  error: boolean;
}

export const useTextToSpeech = () => {
  const [audioStates, setAudioStates] = useState<Record<string, AudioState>>({});
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const currentlyPlayingRef = useRef<string | null>(null);

  const generateAndPlayAudio = useCallback(async (
    messageId: string,
    text: string,
    voiceId: string
  ) => {
    // Stop any currently playing audio
    if (currentlyPlayingRef.current && audioRefs.current[currentlyPlayingRef.current]) {
      audioRefs.current[currentlyPlayingRef.current].pause();
      setAudioStates(prev => ({
        ...prev,
        [currentlyPlayingRef.current!]: { isLoading: false, isPlaying: false, error: false }
      }));
    }

    // If we already have this audio cached and not loading, just play it
    if (audioRefs.current[messageId] && !audioStates[messageId]?.isLoading) {
      const audio = audioRefs.current[messageId];
      audio.currentTime = 0;
      
      currentlyPlayingRef.current = messageId;
      setAudioStates(prev => ({
        ...prev,
        [messageId]: { isLoading: false, isPlaying: true, error: false }
      }));

      audio.play().catch((err) => {
        console.error("Audio playback error:", err);
        setAudioStates(prev => ({
          ...prev,
          [messageId]: { isLoading: false, isPlaying: false, error: true }
        }));
      });
      return;
    }

    // Generate new audio
    setAudioStates(prev => ({
      ...prev,
      [messageId]: { isLoading: true, isPlaying: false, error: false }
    }));

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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Voice generation failed");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setAudioStates(prev => ({
          ...prev,
          [messageId]: { isLoading: false, isPlaying: false, error: false }
        }));
        currentlyPlayingRef.current = null;
      };

      audio.onerror = () => {
        setAudioStates(prev => ({
          ...prev,
          [messageId]: { isLoading: false, isPlaying: false, error: true }
        }));
        currentlyPlayingRef.current = null;
      };

      audioRefs.current[messageId] = audio;
      currentlyPlayingRef.current = messageId;

      setAudioStates(prev => ({
        ...prev,
        [messageId]: { isLoading: false, isPlaying: true, error: false }
      }));

      await audio.play();

    } catch (error) {
      console.error("TTS error:", error);
      const errorMessage = error instanceof Error ? error.message : "Voice generation failed";
      
      setAudioStates(prev => ({
        ...prev,
        [messageId]: { isLoading: false, isPlaying: false, error: true }
      }));

      toast.error(errorMessage, {
        description: "Text response is shown below."
      });
    }
  }, [audioStates]);

  const stopAudio = useCallback((messageId: string) => {
    if (audioRefs.current[messageId]) {
      audioRefs.current[messageId].pause();
      setAudioStates(prev => ({
        ...prev,
        [messageId]: { isLoading: false, isPlaying: false, error: prev[messageId]?.error || false }
      }));
    }
  }, []);

  const getAudioState = useCallback((messageId: string): AudioState => {
    return audioStates[messageId] || { isLoading: false, isPlaying: false, error: false };
  }, [audioStates]);

  return {
    generateAndPlayAudio,
    stopAudio,
    getAudioState,
  };
};

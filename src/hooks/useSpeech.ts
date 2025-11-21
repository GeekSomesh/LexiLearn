import { useState, useCallback, useRef } from 'react';
import { synthesizeEleven } from '../services/ttsService';

export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopSpeaking = useCallback(() => {
    // Stop any playing audio
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    } catch (e) {
      // ignore
    }
    // Also cancel speechSynthesis fallback
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(async (text: string, _rate: number = 1.0) => {
    // Prefer ElevenLabs TTS via synthesizeEleven; fall back to Web Speech API
    try {
      setIsSpeaking(true);

      // Try ElevenLabs synthesis
      const blob = await synthesizeEleven(text);
      const url = URL.createObjectURL(blob);

      // Clean up previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
        audioRef.current = null;
      }

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        try { URL.revokeObjectURL(url); } catch (e) {}
        audioRef.current = null;
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        try { URL.revokeObjectURL(url); } catch (e) {}
        audioRef.current = null;
      };

      await audio.play();
    } catch (err) {
      // Fallback to browser TTS if ElevenLabs fails
      console.warn('ElevenLabs TTS failed, falling back to Web Speech API:', err);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = Math.max(0.8, Math.min(1.2, _rate));
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
      } else {
        setIsSpeaking(false);
      }
    }
  }, []);

  const startListening = useCallback((onResult: (transcript: string) => void) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.start();

    return () => recognition.stop();
  }, []);

  return {
    speak,
    stopSpeaking,
    isSpeaking,
    startListening,
    isListening,
    // Expose audioRef for BionicReading component to sync with playback
    audioElement: audioRef.current
  };
};

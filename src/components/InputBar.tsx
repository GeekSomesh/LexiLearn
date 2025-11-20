import { useState } from 'react';
import { Mic, Image as ImageIcon, Send } from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';

interface InputBarProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export const InputBar = ({ onSendMessage, disabled }: InputBarProps) => {
  const [input, setInput] = useState('');
  const { startListening, isListening } = useSpeech();

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceInput = () => {
    startListening((transcript) => {
      setInput((prev) => prev + ' ' + transcript);
    });
  };

  return (
    <div className="border-t-2 border-blue-200 bg-[#FFFFF0] p-4">
      <div className="max-w-4xl mx-auto flex items-center gap-3">
        <button
          onClick={handleVoiceInput}
          disabled={disabled || isListening}
          className={`flex-shrink-0 p-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 ${
            isListening
              ? 'bg-red-400 animate-pulse'
              : 'bg-blue-200 hover:bg-blue-300'
          }`}
          aria-label={isListening ? 'Recording...' : 'Start voice input'}
        >
          <Mic className="w-6 h-6 text-gray-800" aria-hidden="true" />
        </button>

        <button
          disabled={disabled}
          className="flex-shrink-0 p-3 bg-blue-200 hover:bg-blue-300 rounded-full transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
          aria-label="Upload image"
        >
          <ImageIcon className="w-6 h-6 text-gray-800" aria-hidden="true" />
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          placeholder="Ask anything..."
          className="flex-1 bg-blue-100 text-gray-800 px-6 py-4 rounded-full text-lg font-['Comic_Sans_MS'] tracking-wide focus:outline-none focus:ring-4 focus:ring-blue-300 placeholder-gray-500"
          aria-label="Type your message"
        />

        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="flex-shrink-0 p-3 bg-green-300 hover:bg-green-400 rounded-full transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <Send className="w-6 h-6 text-gray-800" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

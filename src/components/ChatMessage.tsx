import { Volume2, Bot, User } from 'lucide-react';
import { Message } from '../types';
import { useSpeech } from '../hooks/useSpeech';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const { speak, isSpeaking, stopSpeaking } = useSpeech();
  const isAssistant = message.role === 'assistant';

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(message.content);
    }
  };

  return (
    <div
      className={`flex gap-3 mb-6 ${isAssistant ? 'justify-start' : 'justify-end'}`}
    >
      {isAssistant && (
        <div className="flex-shrink-0 w-10 h-10 bg-green-300 rounded-full flex items-center justify-center">
          <Bot className="w-6 h-6 text-gray-800" aria-hidden="true" />
        </div>
      )}

      <div
        className={`max-w-[75%] ${
          isAssistant
            ? 'bg-white border-2 border-green-200'
            : 'bg-blue-200'
        } rounded-2xl p-6 shadow-sm`}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <p className="text-gray-800 font-['Comic_Sans_MS'] text-lg leading-loose tracking-wide whitespace-pre-wrap">
            {message.content}
          </p>
          <button
            onClick={handleSpeak}
            className="flex-shrink-0 p-2 hover:bg-gray-200 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label={isSpeaking ? 'Stop reading' : 'Read message aloud'}
          >
            <Volume2
              className={`w-5 h-5 ${isSpeaking ? 'text-blue-600' : 'text-gray-600'}`}
              aria-hidden="true"
            />
          </button>
        </div>

        {isAssistant && (
          <div className="flex gap-2 mt-4">
            <button className="bg-purple-200 hover:bg-purple-300 text-gray-800 font-['Comic_Sans_MS'] text-sm py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400">
              Make Response Shorter
            </button>
            <button className="bg-purple-200 hover:bg-purple-300 text-gray-800 font-['Comic_Sans_MS'] text-sm py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400">
              Tell me about more
            </button>
          </div>
        )}
      </div>

      {!isAssistant && (
        <div className="flex-shrink-0 w-10 h-10 bg-blue-300 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-gray-800" aria-hidden="true" />
        </div>
      )}
    </div>
  );
};

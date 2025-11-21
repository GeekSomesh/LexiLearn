import { useEffect, useRef } from "react";
import { Edit, Play } from "lucide-react";
import { Message } from "../types";
import { ChatMessage } from "./ChatMessage";

interface ChatAreaProps {
  messages: Message[];
  title: string;
  onTitleEdit?: () => void;
}

export const ChatArea = ({ messages, title, onTitleEdit }: ChatAreaProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-2xl font-bold text-gray-800 font-['Comic_Sans_MS'] tracking-wide">
            {title}
          </h1>
          <button
            onClick={onTitleEdit}
            className="p-2 hover:bg-gray-200 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Edit title"
          >
            <Edit className="w-5 h-5 text-gray-600" aria-hidden="true" />
          </button>
          <button
            className="p-2 hover:bg-green-200 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
            aria-label="Play audio summary"
          >
            <Play className="w-5 h-5 text-green-600" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 font-['Comic_Sans_MS'] text-lg leading-loose tracking-wide">
                Start a conversation by typing a message below or using voice
                input.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};

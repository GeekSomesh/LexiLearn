import {
  Brain,
  Plus,
  Search,
  Map,
  FileText,
  MessageCircle,
  Zap,
  FileUp,
} from "lucide-react";
import { Project, Chat } from "../types";

interface SidebarProps {
  projects: Project[];
  chats: Chat[];
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  selectedChatId: string | null;
  onOpenSummarizer?: () => void;
  onOpenScreener?: () => void;
  dyslexicEnabled?: boolean;
  onToggleDyslexic?: () => void;
  currentView?: "chat" | "summarizer" | "screener";
}

export const Sidebar = ({
  projects,
  chats,
  onNewChat,
  onSelectChat,
  selectedChatId,
  onOpenSummarizer,
  onOpenScreener,
  dyslexicEnabled,
  onToggleDyslexic,
  currentView,
}: SidebarProps) => {
  return (
    <aside className="w-full lg:w-64 bg-[#E8E4F3] h-screen flex flex-col p-4 fixed lg:relative z-20">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-8 h-8 text-purple-600" aria-hidden="true" />
        <h1 className="text-xl font-bold text-gray-800 font-['Comic_Sans_MS']">
          LexiLearn
        </h1>
      </div>

      <button
        onClick={onNewChat}
        className="w-full bg-green-300 hover:bg-green-400 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 mb-6 focus:outline-none focus:ring-4 focus:ring-green-500"
        aria-label="Start a new chat"
      >
        <Plus className="w-5 h-5" aria-hidden="true" />
        <span className="font-['Comic_Sans_MS']">New Chat</span>
      </button>

      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-600 mb-3 font-['Comic_Sans_MS'] tracking-wide">
          Tools
        </h2>
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-purple-200 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400">
            <Search className="w-5 h-5" aria-hidden="true" />
            <span className="font-['Comic_Sans_MS'] text-base">
              Search Chats
            </span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-purple-200 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400">
            <Map className="w-5 h-5" aria-hidden="true" />
            <span className="font-['Comic_Sans_MS'] text-base">Mind Map</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-purple-200 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400">
            <FileText className="w-5 h-5" aria-hidden="true" />
            <span className="font-['Comic_Sans_MS'] text-base">My Notes</span>
          </button>
          <button
            onClick={onOpenSummarizer}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
              currentView === "summarizer"
                ? "bg-purple-300 text-gray-800"
                : "text-gray-700 hover:bg-purple-200"
            }`}
          >
            <FileUp className="w-5 h-5" aria-hidden="true" />
            <span className="font-['Comic_Sans_MS'] text-base">Summarizer</span>
          </button>
          <button
            onClick={onOpenScreener}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700 hover:bg-purple-200"
          >
            <Search className="w-5 h-5" aria-hidden="true" />
            <span className="font-['Comic_Sans_MS'] text-base">
              Check for Dyslexia
            </span>
          </button>
          <button
            onClick={onToggleDyslexic}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
              dyslexicEnabled
                ? "bg-green-200 text-gray-800"
                : "text-gray-700 hover:bg-purple-200"
            }`}
          >
            <span className="w-5 h-5" aria-hidden="true">
              🔤
            </span>
            <span className="font-['Comic_Sans_MS'] text-base">
              Dyslexic Font: {dyslexicEnabled ? "On" : "Off"}
            </span>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-600 mb-3 font-['Comic_Sans_MS'] tracking-wide">
          Projects
        </h2>
        <div className="space-y-2">
          {projects.map((project) => (
            <button
              key={project.id}
              className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-purple-200 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <span className="text-xl" aria-hidden="true">
                {project.icon}
              </span>
              <span className="font-['Comic_Sans_MS'] text-base truncate">
                {project.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mb-6">
        <h2 className="text-sm font-semibold text-gray-600 mb-3 font-['Comic_Sans_MS'] tracking-wide">
          Chats
        </h2>
        <div className="space-y-2">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                selectedChatId === chat.id
                  ? "bg-purple-300 text-gray-800"
                  : "text-gray-700 hover:bg-purple-200"
              }`}
            >
              <MessageCircle className="w-5 h-5" aria-hidden="true" />
              <span className="font-['Comic_Sans_MS'] text-base truncate">
                {chat.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      <button className="w-full bg-green-300 hover:bg-green-400 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-green-500">
        <Zap className="w-5 h-5" aria-hidden="true" />
        <span className="font-['Comic_Sans_MS']">Upgrade to Plus</span>
      </button>
    </aside>
  );
};

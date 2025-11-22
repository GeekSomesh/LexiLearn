import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Sidebar } from "./components/Sidebar";
import ErrorBoundary from "./components/ErrorBoundary";
import { FormattingToolbar } from "./components/FormattingToolbar";
import { ChatArea } from "./components/ChatArea";
import { InputBar } from "./components/InputBar";
import { MindMapPanel } from "./components/MindMapPanel";
import { VisualCrowdingScreener } from "./components/VisualCrowdingScreener";
import { PricingPage } from "./components/PricingPage";
import StartupScreener from "./components/StartupScreener";
import DyslexiaQuestionnaire from "./components/DyslexiaQuestionnaire";
import Scorecard from "./components/Scorecard";
import {
  initRecommendationsFromStore,
  getRecommendationStore,
  setRecommendationEnabled,
} from "./lib/screenerStore";
import { useEffect } from "react";
import { SummarizerPage } from "./components/SummarizerPage";
import { NotesPage } from "./components/NotesPage";
import { Project, Chat, Message, MindMapNode } from "./types";
import { callOpenRouter } from "./services/openRouterService";
import { fetchChats as apiFetchChats, createChat as apiCreateChat, fetchMessages as apiFetchMessages, addMessage as apiAddMessage } from "./services/chatApi";

const sampleProjects: Project[] = [
  {
    id: "1",
    user_id: "demo",
    name: "New Project",
    icon: "📁",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    user_id: "demo",
    name: "Project AI",
    icon: "📁",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    user_id: "demo",
    name: "Homework",
    icon: "📁",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    user_id: "demo",
    name: "Topic",
    icon: "📁",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const sampleChats: Chat[] = [
  {
    id: "1",
    user_id: "demo",
    project_id: null,
    title: "The advantages of AI",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    user_id: "demo",
    project_id: null,
    title: "Platform Marketplace",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "3",
    user_id: "demo",
    project_id: null,
    title: "Platform Marketplace",
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

const sampleMessages: Message[] = [
  {
    id: "1",
    chat_id: "1",
    role: "user",
    content: "The advantages of Artificial Intelligence",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    chat_id: "1",
    role: "assistant",
    content: `Artificial Intelligence (AI) offers numerous advantages and has the potential to revolutionize various aspects of our lives. Here are some key advantages of AI:

1. Automation: AI can automate repetitive and mundane tasks, saving time and effort for humans. It can handle large volumes of data, perform complex calculations, and execute tasks with precision and consistency. This automation leads to increased productivity and efficiency in various industries.

2. Decision-making: AI systems can analyze vast amounts of data, identify patterns, and make informed decisions based on that analysis. This ability is particularly useful in complex scenarios where humans may struggle to process large datasets or where quick and accurate decisions are crucial.

3. Improved accuracy: AI algorithms can achieve high levels of accuracy and precision in tasks such as image recognition, natural language processing, and data analysis. They can eliminate human errors caused by fatigue, distractions, or bias, leading to more reliable and consistent results.`,
    created_at: new Date().toISOString(),
  },
];

const sampleMindMapNodes: MindMapNode[] = [
  {
    id: "1",
    label: "Automation",
    content:
      "AI can automate repetitive and mundane tasks, saving time and effort for humans. It can handle large volumes of data, perform complex calculations, and execute tasks with precision.",
    x: 0,
    y: 0,
    children: ["1a", "1b"],
  },
  {
    id: "2",
    label: "Decision making",
    content:
      "AI systems can analyze vast amounts of data, identify patterns, and make informed decisions based on that analysis.",
    x: 0,
    y: 100,
    children: [],
  },
];

function App() {
  const [projects] = useState<Project[]>(sampleProjects);
  const [chats, setChats] = useState<Chat[]>(sampleChats);
  const [selectedChatId, setSelectedChatId] = useState<string | null>("1");
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [mindMapNodes] = useState<MindMapNode[]>(sampleMindMapNodes);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<
    | "chat"
    | "summarizer"
    | "screener"
    | "pricing"
    | "questionnaire"
    | "notes"
  >("chat");

  // Startup prompt state: show on first-run unless user skipped before
  const [showStartupPrompt, setShowStartupPrompt] = useState<boolean>(() => {
    try {
      const skip = localStorage.getItem("skipStartupScreener");
      return !skip;
    } catch (e) {
      return true;
    }
  });

  const [lastQuestionnaireResult, setLastQuestionnaireResult] = useState<
    any | null
  >(null);

  useEffect(() => {
    // Apply any saved recommendation preferences on app start
    initRecommendationsFromStore();
    console.log("App mounted — React root is active.");
    try {
      const skip = localStorage.getItem("skipStartupScreener");
      const lastQ = localStorage.getItem("last_questionnaire_result");
      console.log("[startup-debug] skipStartupScreener=", skip);
      console.log("[startup-debug] last_questionnaire_result=", lastQ);
      console.log(
        "[startup-debug] initial showStartupPrompt=",
        showStartupPrompt
      );
    } catch (e) {
      console.log("[startup-debug] localStorage not accessible", e);
    }
    // URL override: visit the app with ?showWelcome=1 to force the welcome screener
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("showWelcome") === "1") {
        try {
          localStorage.removeItem("skipStartupScreener");
        } catch (e) {}
        setShowStartupPrompt(true);
      }
    } catch (e) {
      // ignore
    }
    // Defensive re-check: if the skip flag is not present, ensure the prompt shows.
    // This handles cases where localStorage changed or the initial state was evaluated differently.
    try {
      const skipNow = localStorage.getItem("skipStartupScreener");
      if (!skipNow) {
        setShowStartupPrompt(true);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // When authenticated, fetch token and load remote chats
  useEffect(() => {
    (async () => {
      if (!isAuthenticated) {
        setAuthToken(null);
        return;
      }
      try {
        const token = await getAccessTokenSilently();
        setAuthToken(token);
        const remote = await apiFetchChats(token);
        const mapped: Chat[] = remote.map((c) => ({
          id: c.id,
          user_id: "remote",
          project_id: null,
          title: c.title,
          created_at: c.created_at,
          updated_at: c.updated_at,
        }));
        setChats((prev) => {
          const extras = prev.filter((p) => !mapped.some((m) => m.id === p.id));
          return [...mapped, ...extras];
        });
        const hasPrevRemote = mapped.some((c) => c.id === selectedChatId);
        const firstRemoteId = mapped[0]?.id;
        const fetchId = hasPrevRemote ? selectedChatId : firstRemoteId;
        if (fetchId) {
          try {
            const msgs = await apiFetchMessages(token, fetchId);
            // Only replace messages for that chat; keep any local messages for other chats
            setMessages((prev) => {
              const others = prev.filter((m) => m.chat_id !== fetchId);
              return [...others, ...msgs as any];
            });
          } catch (e) {
            console.warn("Failed to fetch messages for", fetchId, e);
          }
        }
        // Preserve user selection if they created a local chat; only set if none selected yet
        setSelectedChatId((prev) => prev ?? firstRemoteId ?? null);
      } catch (e) {
        console.warn("Failed to load remote chats", e);
      }
    })();
  }, [isAuthenticated, getAccessTokenSilently]);

  // Dyslexic font toggle state
  const [dyslexicEnabled, setDyslexicEnabled] = useState<boolean>(false);

  useEffect(() => {
    const store = getRecommendationStore();
    setDyslexicEnabled(!!store?.enabled);
  }, []);

  const handleToggleDyslexic = () => {
    // Toggle based on the current UI state to avoid relying on possibly stale store values
    const store = getRecommendationStore();
    if (dyslexicEnabled) {
      // disable
      setRecommendationEnabled(false);
      setDyslexicEnabled(false);
    } else {
      // enable with stored values or defaults
      const letterSpacing = store?.letterSpacing ?? 0;
      const lineHeight = store?.lineHeight ?? 1.2;
      const fontWeight = store?.fontWeight ?? 400;
      setRecommendationEnabled(true, { letterSpacing, lineHeight, fontWeight });
      setDyslexicEnabled(true);
    }
  };

  function handleStartupYes() {
    setShowStartupPrompt(false);
    setCurrentView("questionnaire");
  }

  function handleStartupSkip() {
    try {
      localStorage.setItem("skipStartupScreener", "1");
    } catch (e) {}
    setShowStartupPrompt(false);
    setCurrentView("chat");
  }

  function handleQuestionnaireComplete(result: any) {
    // store last result for scorecard display and optionally persist
    setLastQuestionnaireResult(result);
    // show scorecard view inside the app by replacing currentView with chat after user proceeds
    setCurrentView("chat");
    // persist the questionnaire result for future reference
    try {
      localStorage.setItem("last_questionnaire_result", JSON.stringify(result));
    } catch (e) {}
    // show scorecard by setting a small flag - we'll render it as a temporary overlay below
    setShowScorecard(true);
  }

  const [showScorecard, setShowScorecard] = useState(false);

  function handleContinueFromScorecard() {
    setShowScorecard(false);
  }

  const selectedChat = chats.find((chat) => chat.id === selectedChatId);
  const chatMessages = messages.filter((msg) => msg.chat_id === selectedChatId);

  const handleNewChat = () => {
    console.log('[chat] New Chat button clicked. isAuthenticated=', isAuthenticated);
    const createLocal = (id: string, title = "New Chat"): Chat => ({
      id,
      user_id: isAuthenticated ? "remote" : "demo",
      project_id: null,
      title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    // Optimistic insertion
    const tempId = `temp-${Date.now()}`;
    const optimistic = createLocal(tempId);
    setChats((prev) => [optimistic, ...prev]);
    setSelectedChatId(tempId);
    setCurrentView("chat");
    if (isAuthenticated && authToken) {
      apiCreateChat(authToken, "New Chat")
        .then((row) => {
          console.log('[chat] Remote chat created', row.id);
          setChats((prev) => {
            return prev.map((c) => c.id === tempId ? { ...c, id: row.id, title: row.title, created_at: row.created_at, updated_at: row.updated_at } : c);
          });
          setSelectedChatId(row.id);
        })
        .catch((e) => {
          console.warn('[chat] Remote create failed, keeping local temp chat', e);
          // Convert temp to stable local id so later remote sync doesn't discard it
          setChats((prev) => prev.map((c) => c.id === tempId ? { ...c, id: `chat-${Date.now()}` } : c));
          setSelectedChatId((prev) => prev === tempId ? `chat-${Date.now()}` : prev);
        });
    } else {
      console.log('[chat] Guest mode chat created');
      // Replace temp id with permanent local id
      const newLocalId = `chat-${Date.now()}`;
      setChats((prev) => prev.map((c) => c.id === tempId ? { ...c, id: newLocalId } : c));
      setSelectedChatId(newLocalId);
    }
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setCurrentView("chat");
    if (isAuthenticated && authToken) {
      apiFetchMessages(authToken, chatId)
        .then((rows) => {
          setMessages(rows as any);
        })
        .catch((e) => console.warn("fetch messages failed", e));
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedChatId) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      chat_id: selectedChatId,
      role: "user",
      content,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (isAuthenticated && authToken) {
      apiAddMessage(authToken, selectedChatId, "user", content).catch(() => {});
    }
    setIsLoading(true);

    try {
      // Get conversation history for context
      const conversationHistory = chatMessages.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));

      // Add the new user message
      conversationHistory.push({
        role: "user",
        content,
      });

      // Call OpenRouter API
      const assistantResponse = await callOpenRouter(conversationHistory);

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        chat_id: selectedChatId,
        role: "assistant",
        content: assistantResponse,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      if (isAuthenticated && authToken) {
        apiAddMessage(authToken, selectedChatId, "assistant", assistantResponse).catch(() => {});
      }

      if (selectedChat && selectedChat.title === "New Chat") {
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === selectedChatId
              ? { ...chat, title: content.slice(0, 50) }
              : chat
          )
        );
      }
    } catch (error) {
      console.error("Failed to get response:", error);
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        chat_id: selectedChatId,
        role: "assistant",
        content:
          "Sorry, I encountered an error while processing your message. Please try again.",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#FFFFF0] overflow-hidden">
      <div className="hidden lg:block">
        <Sidebar
          projects={projects}
          chats={chats}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          selectedChatId={selectedChatId}
          onOpenSummarizer={() => setCurrentView("summarizer")}
          onOpenScreener={() => setCurrentView("screener")}
          onOpenPricing={() => setCurrentView("pricing")}
          onOpenNotes={() => setCurrentView("notes")}
          dyslexicEnabled={dyslexicEnabled}
          onToggleDyslexic={handleToggleDyslexic}
          currentView={currentView}
          onShowStartup={() => {
            try {
              localStorage.removeItem("skipStartupScreener");
            } catch (e) {}
            setShowStartupPrompt(true);
            // bring user to chat area while welcome is visible
            setCurrentView("chat");
          }}
        />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden">
        {showStartupPrompt && (
          <StartupScreener
            onYes={handleStartupYes}
            onSkip={handleStartupSkip}
          />
        )}
        {currentView === "questionnaire" && (
          <DyslexiaQuestionnaire onComplete={handleQuestionnaireComplete} />
        )}
        <ErrorBoundary>
          {currentView === "chat" ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <FormattingToolbar />
              <div className="flex-1 flex overflow-hidden gap-4 p-4">
                {/* Left side: Chat */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                  <ChatArea
                    messages={chatMessages}
                    title={selectedChat?.title || "New Chat"}
                  />
                  <InputBar
                    onSendMessage={handleSendMessage}
                    disabled={isLoading}
                  />
                </div>

                {/* Right side: Mindmap Panel */}
                <div className="w-1/2 flex-shrink-0 hidden lg:flex">
                  <MindMapPanel nodes={mindMapNodes} messages={chatMessages} />
                </div>
              </div>
            </div>
          ) : currentView === "summarizer" ? (
            <SummarizerPage />
          ) : currentView === "screener" ? (
            <VisualCrowdingScreener onClose={() => setCurrentView("chat")} />
          ) : currentView === "notes" ? (
            <NotesPage />
          ) : (
            <PricingPage onClose={() => setCurrentView("chat")} />
          )}
        </ErrorBoundary>
      </main>
      {/* Floating button to reopen the welcome screener (visible on all sizes) */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => {
            // clear skip flag for a fresh run and show the prompt so we can debug reliably
            try {
              localStorage.removeItem("skipStartupScreener");
            } catch (e) {}
            setShowStartupPrompt(true);
          }}
          aria-label="Show welcome screener"
          className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          ⭐ Welcome
        </button>
      </div>
      {showScorecard && lastQuestionnaireResult ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-purple-100 to-yellow-50"></div>
          <div className="relative min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-3xl">
              <Scorecard
                total={lastQuestionnaireResult.total}
                max={lastQuestionnaireResult.max}
                percent={lastQuestionnaireResult.percent}
                band={lastQuestionnaireResult.band}
                categories={lastQuestionnaireResult.categories}
                onContinue={handleContinueFromScorecard}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;

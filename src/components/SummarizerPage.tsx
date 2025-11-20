import { useState, useRef, useEffect } from 'react';
import { FileUp, Loader, Send, Mic, Image as ImageIcon } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedQuestions?: string[];
}

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

const extractTextFromPdf = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  let fullText = '';

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + ' ';
  }

  return fullText;
};

const generateSummary = async (text: string): Promise<string> => {
  const OPENROUTER_API_KEY = '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';
  const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
  const MODEL = 'kwaipilot/kat-coder-pro:free';

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://dyslearnai.local',
        'X-Title': 'DysLearnAI',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful educational assistant designed for learners with dyslexia. Provide a clear, concise summary of the given text. Use simple language without markdown formatting, ### symbols, ** bold markers, or * italics. Just use plain text with proper spacing between paragraphs. Make it easy to read and understand.'
          },
          {
            role: 'user',
            content: `Please provide a clear and concise summary of the following text:\n\n${text}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 1,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error?.message || JSON.stringify(data);
      throw new Error(`OpenRouter API error: ${response.status} - ${errorMessage}`);
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Unexpected response format from OpenRouter API');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating summary:', error);
    throw error;
  }
};

const askFollowUpQuestion = async (
  pdfText: string,
  question: string,
  conversationHistory: ChatMessage[]
): Promise<string> => {
  const OPENROUTER_API_KEY = 'YOUR API KEY';
  const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
  const MODEL = 'kwaipilot/kat-coder-pro:free';

  try {
    // Build conversation history for context
    const messages = [
      {
        role: 'system' as const,
        content: `You are a helpful educational assistant designed for learners with dyslexia. You are helping the user understand a PDF document. Here is the full text of the PDF for context:\n\n${pdfText}\n\nAnswer questions about this document clearly and concisely. Use simple language without markdown formatting, ### symbols, ** bold markers, or * italics. Just use plain text with proper spacing between paragraphs. Make it easy to read and understand.`
      },
      ...conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: question
      }
    ];

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://dyslearnai.local',
        'X-Title': 'DysLearnAI',
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 1,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error?.message || JSON.stringify(data);
      throw new Error(`OpenRouter API error: ${response.status} - ${errorMessage}`);
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Unexpected response format from OpenRouter API');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error asking follow-up question:', error);
    throw error;
  }
};

const generateSuggestedQuestions = async (
  pdfText: string,
  lastAssistantMessage: string,
  conversationHistory: ChatMessage[]
): Promise<string[]> => {
  const OPENROUTER_API_KEY = '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';
  const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
  const MODEL = 'kwaipilot/kat-coder-pro:free';

  try {
    const messages = [
      {
        role: 'system' as const,
        content: `You are a helpful educational assistant. Based on the PDF content and the current conversation, suggest 3 clear and simple follow-up questions that would help the user better understand the material. 

Rules:
- Generate exactly 3 questions
- Keep each question simple and short (under 15 words)
- Make questions relevant to the PDF content
- Use simple words suitable for learners with dyslexia
- Return ONLY the questions, one per line, without numbering or bullet points
- No markdown or special formatting`
      },
      {
        role: 'user' as const,
        content: `Here is the PDF text:\n\n${pdfText}\n\nHere is our conversation so far:\n\n${conversationHistory
          .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
          .join('\n\n')}\n\nAssistant's last message: ${lastAssistantMessage}\n\nPlease suggest 3 follow-up questions that would help clarify the content.`
      }
    ];

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://dyslearnai.local',
        'X-Title': 'DysLearnAI',
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 500,
        top_p: 1,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error?.message || JSON.stringify(data);
      console.error('Error generating suggestions:', errorMessage);
      return [];
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return [];
    }

    const responseText = data.choices[0].message.content;
    const questions = responseText
      .split('\n')
      .map((q: string) => q.trim())
      .filter((q: string) => q.length > 0 && !q.match(/^\d+\.|^[-*]/));

    return questions.slice(0, 3);
  } catch (error) {
    console.error('Error generating suggested questions:', error);
    return [];
  }
};

export const SummarizerPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    setIsLoading(true);
    setError(null);
    setFileName(file.name);
    setChatMessages([]);
    setInput('');

    try {
      const text = await extractTextFromPdf(file);
      if (!text.trim()) {
        throw new Error('Could not extract text from PDF');
      }

      setPdfText(text);

      // Generate initial summary
      const generatedSummary = await generateSummary(text);
      const summaryMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: generatedSummary,
        timestamp: new Date().toISOString()
      };

      setChatMessages([summaryMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setPdfText(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !pdfText || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await askFollowUpQuestion(pdfText, input, chatMessages);

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };

      // Generate suggested questions for this response
      const suggestions = await generateSuggestedQuestions(
        pdfText,
        response,
        [...chatMessages, userMessage]
      );

      assistantMessage.suggestedQuestions = suggestions;

      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Remove the user message if there was an error
      setChatMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#FFFFF0]">
      {/* Header */}
      <div className="p-6 border-b-2 border-blue-200 bg-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 font-['Comic_Sans_MS'] tracking-wide mb-2">
            PDF Summarizer & Chat
          </h1>
          <p className="text-gray-600 font-['Comic_Sans_MS'] text-lg">
            Upload a PDF and ask questions about it
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {!pdfText ? (
          // Upload Section
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <label className="block">
                  <div className="border-3 border-dashed border-blue-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 transition-all">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      disabled={isLoading}
                      className="hidden"
                    />
                    <FileUp className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                    <p className="text-gray-700 font-['Comic_Sans_MS'] font-bold text-2xl mb-2">
                      Click to upload PDF
                    </p>
                    <p className="text-gray-500 font-['Comic_Sans_MS'] text-lg">
                      or drag and drop
                    </p>
                  </div>
                </label>

                {isLoading && (
                  <div className="mt-6 flex items-center justify-center gap-3">
                    <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                    <span className="font-['Comic_Sans_MS'] text-lg text-blue-600 font-semibold">
                      Processing PDF...
                    </span>
                  </div>
                )}

                {error && (
                  <div className="mt-6 bg-red-100 border-2 border-red-400 text-red-700 px-6 py-4 rounded-lg font-['Comic_Sans_MS'] text-lg">
                    Error: {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Chat Section
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-4 p-4 bg-blue-100 rounded-lg">
                <span className="text-xl">📄</span>
                <div>
                  <p className="font-['Comic_Sans_MS'] font-semibold text-gray-800">
                    {fileName}
                  </p>
                  <button
                    onClick={() => {
                      setPdfText(null);
                      setChatMessages([]);
                      setError(null);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-['Comic_Sans_MS'] underline"
                  >
                    Upload Different PDF
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 h-96 overflow-y-auto space-y-4">
                {chatMessages.map((message) => (
                  <div key={message.id} className="space-y-3">
                    <div
                      className={`flex ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-2xl rounded-lg px-6 py-4 ${
                          message.role === 'user'
                            ? 'bg-green-300 text-gray-800'
                            : 'bg-blue-100 text-gray-800'
                        }`}
                      >
                        <p className="font-['Comic_Sans_MS'] text-lg leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                    </div>

                    {/* Suggested Questions */}
                    {message.role === 'assistant' && message.suggestedQuestions && message.suggestedQuestions.length > 0 && (
                      <div className="flex justify-start">
                        <div className="max-w-2xl space-y-2">
                          <p className="text-sm font-['Comic_Sans_MS'] text-gray-600 px-2">
                            💡 Would you like to know more about:
                          </p>
                          <div className="space-y-2 flex flex-col">
                            {message.suggestedQuestions.map((question, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setInput(question);
                                }}
                                className="text-left bg-purple-200 hover:bg-purple-300 text-gray-800 px-4 py-3 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 font-['Comic_Sans_MS'] text-base leading-relaxed"
                              >
                                • {question}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-blue-100 rounded-lg px-6 py-4 flex items-center gap-3">
                      <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                      <span className="font-['Comic_Sans_MS'] text-gray-800">
                        Thinking...
                      </span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded font-['Comic_Sans_MS']">
                    Error: {error}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Section */}
      {pdfText && (
        <div className="border-t-2 border-blue-200 bg-white p-6">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <button
              disabled={isLoading}
              className="flex-shrink-0 p-3 bg-blue-200 hover:bg-blue-300 rounded-full transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
              aria-label="Voice input"
            >
              <Mic className="w-6 h-6 text-gray-800" aria-hidden="true" />
            </button>

            <button
              disabled={isLoading}
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
              disabled={isLoading}
              placeholder="Ask a question about the PDF..."
              className="flex-1 bg-blue-100 text-gray-800 px-6 py-4 rounded-full text-lg font-['Comic_Sans_MS'] tracking-wide focus:outline-none focus:ring-4 focus:ring-blue-300 placeholder-gray-500"
              aria-label="Ask question"
            />

            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="flex-shrink-0 p-3 bg-green-300 hover:bg-green-400 rounded-full transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send className="w-6 h-6 text-gray-800" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

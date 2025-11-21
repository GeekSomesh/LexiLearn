import { useState } from 'react';
import { FileUp, X, Loader } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

interface PdfSummarizerProps {
  isOpen: boolean;
  onClose: () => void;
  onSummaryGenerated: (summary: string) => void;
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
  const MODEL = 'openai/gpt-4o-mini';

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

export const PdfSummarizer = ({ isOpen, onClose, onSummaryGenerated }: PdfSummarizerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

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

    try {
      const text = await extractTextFromPdf(file);
      if (!text.trim()) {
        throw new Error('Could not extract text from PDF');
      }

      const summary = await generateSummary(text);
      onSummaryGenerated(summary);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 font-['Comic_Sans_MS']">
            PDF Summarizer
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-all"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-all">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={isLoading}
                className="hidden"
              />
              <FileUp className="w-12 h-12 text-blue-400 mx-auto mb-2" />
              <p className="text-gray-700 font-['Comic_Sans_MS'] font-semibold">
                Click to upload PDF
              </p>
              <p className="text-sm text-gray-500 font-['Comic_Sans_MS']">
                or drag and drop
              </p>
            </div>
          </label>

          {fileName && (
            <p className="text-sm text-gray-600 font-['Comic_Sans_MS']">
              File: {fileName}
            </p>
          )}

          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <Loader className="w-5 h-5 animate-spin" />
              <span className="font-['Comic_Sans_MS']">Summarizing your PDF...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded font-['Comic_Sans_MS']">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

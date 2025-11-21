import { useState, useEffect, useRef } from 'react';
import { Zap } from 'lucide-react';
import { Message } from '../types';
import mermaid from 'mermaid';
import { generateMermaidMindmapViaLLM } from '../services/llmMindmapService';

interface MindMapPanelProps {
  nodes?: any[];
  messages?: Message[];
}

export const MindMapPanel = ({ messages = [] }: MindMapPanelProps) => {
  const [mermaidDiagram, setMermaidDiagram] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mermaidContainerRef = useRef<HTMLDivElement>(null);

  // Initialize mermaid
  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });
  }, []);

  // Render mindmap when diagram changes
  useEffect(() => {
    if (mermaidDiagram && mermaidContainerRef.current) {
      const renderDiagram = async () => {
        try {
          console.log('Starting render, diagram length:', mermaidDiagram.length);
          
          // Add a small delay to ensure ref is ready
          await new Promise(resolve => setTimeout(resolve, 100));
          
          if (!mermaidContainerRef.current) {
            console.error('Ref is null after delay');
            return;
          }
          
          const renderId = 'chatbot-mindmap-' + Date.now();
          console.log('Calling mermaid.render with id:', renderId);
          const { svg } = await mermaid.render(renderId, mermaidDiagram);
          
          console.log('SVG rendered successfully, length:', svg.length);
          
          // Clear and set innerHTML
          mermaidContainerRef.current.innerHTML = '';
          mermaidContainerRef.current.innerHTML = svg;
          
          console.log('innerHTML set successfully');
          
          // Style the SVG
          const svgElement = mermaidContainerRef.current.querySelector('svg');
          if (svgElement) {
            svgElement.style.width = '95%';
            svgElement.style.height = 'auto';
            svgElement.style.maxWidth = '100%';
            svgElement.style.display = 'block';
            svgElement.style.margin = '0 auto';
            console.log('SVG styled successfully');
          }
        } catch (err) {
          console.error('Failed to render diagram:', err);
          setError('Failed to render: ' + (err instanceof Error ? err.message : String(err)));
        }
      };
      renderDiagram();
    }
  }, [mermaidDiagram]);

  const handleGenerateMindmap = async () => {
    if (messages.length === 0) {
      setError('No messages to generate mindmap from');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const diagram = await generateMermaidMindmapViaLLM(messages);
      console.log('Generated diagram:', diagram.substring(0, 100));
      setMermaidDiagram(diagram);
    } catch (err) {
      console.error('Error generating mindmap:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate mindmap');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadMermaidSvg = () => {
    if (!mermaidContainerRef.current?.innerHTML) {
      setError('No mindmap to download');
      return;
    }

    try {
      const svg = mermaidContainerRef.current.innerHTML;
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mindmap-${new Date().getTime()}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading mindmap:', err);
      setError('Failed to download mindmap');
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-300 bg-gradient-to-r from-purple-100 to-blue-100 flex-shrink-0">
        <h3 className="text-xl font-bold text-gray-800 font-['Comic_Sans_MS'] mb-3">
          📊 Chat Mindmap
        </h3>
        <button
          onClick={handleGenerateMindmap}
          disabled={isGenerating || messages.length === 0}
          className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed font-['Comic_Sans_MS'] text-base flex items-center justify-center gap-2"
        >
          <Zap className="w-5 h-5" />
          {isGenerating ? 'Generating...' : 'Generate'}
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 flex flex-col min-h-0 p-4">
        {mermaidDiagram ? (
          <>
            <div className="flex justify-center mb-3 flex-shrink-0">
              <button
                onClick={downloadMermaidSvg}
                className="px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white font-bold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 font-['Comic_Sans_MS'] text-sm"
              >
                ⬇️ Download
              </button>
            </div>
            <div
              ref={mermaidContainerRef}
              className="flex-1 overflow-auto flex items-center justify-center min-h-0 bg-white rounded-lg"
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 font-['Comic_Sans_MS'] text-center px-4">
            <div>
              <p className="text-base">📌 Generate a mindmap</p>
              <p className="text-xs mt-2 text-gray-400">Click the button above</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded text-sm font-['Comic_Sans_MS']">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

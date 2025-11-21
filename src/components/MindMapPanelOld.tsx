import { useState, useEffect, useRef } from 'react';
import { Play, Settings, ChevronDown, ChevronRight, Zap, Download } from 'lucide-react';
import { MindMapNode, Message } from '../types';
import mermaid from 'mermaid';
import { generateMermaidMindmap } from '../services/mindmapService';

interface MindMapPanelProps {
  nodes: MindMapNode[];
  messages?: Message[];
}

interface NodeCardProps {
  node: MindMapNode;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

const NodeCard = ({ node, index, isExpanded, onToggle }: NodeCardProps) => {
  return (
    <div className="relative">
      <div className="bg-white border-2 border-green-300 rounded-xl p-4 mb-4 shadow-sm">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-300 rounded-full flex items-center justify-center font-bold text-gray-800">
              {index + 1}
            </div>
            <h3 className="font-bold text-gray-800 font-['Comic_Sans_MS'] text-base">
              {node.label}
            </h3>
          </div>
          <div className="flex gap-1">
            <button
              onClick={onToggle}
              className="p-1 hover:bg-gray-200 rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-600" aria-hidden="true" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" aria-hidden="true" />
              )}
            </button>
            <button
              className="p-1 hover:bg-gray-200 rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
              aria-label="Node settings"
            >
              <Settings className="w-4 h-4 text-gray-600" aria-hidden="true" />
            </button>
          </div>
        </div>

        {isExpanded && (
          <p className="text-gray-700 font-['Comic_Sans_MS'] text-sm leading-relaxed tracking-wide mt-2">
            {node.content}
          </p>
        )}
      </div>

      {node.children && node.children.length > 0 && (
        <div className="ml-8 pl-4 border-l-2 border-dotted border-green-300">
          {node.children.map((childId, idx) => (
            <div key={childId} className="mb-2">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-gray-700 font-['Comic_Sans_MS'] text-sm">
                  Topic {idx + 1}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const MindMapPanel = ({ nodes, messages = [] }: MindMapPanelProps) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [mermaidDiagram, setMermaidDiagram] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showMermaidView, setShowMermaidView] = useState(false);
  const mermaidContainerRef = useRef<HTMLDivElement>(null);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const handleGenerateMindmap = async () => {
    if (messages.length === 0) {
      alert('No messages to generate mindmap from. Start a conversation first!');
      return;
    }

    setIsGenerating(true);
    try {
      const diagram = await generateMermaidMindmap(messages);
      setMermaidDiagram(diagram);
      setShowMermaidView(true);
      
      // Initialize mermaid and render
      mermaid.initialize({ startOnLoad: true });
      mermaid.contentLoaded();
    } catch (error) {
      console.error('Error generating mindmap:', error);
      alert('Failed to generate mindmap');
    } finally {
      setIsGenerating(false);
    }
  };

  // Render mermaid diagram when it's updated
  useEffect(() => {
    const renderMermaid = async () => {
      if (mermaidDiagram && mermaidContainerRef.current && showMermaidView) {
        try {
          const div = mermaidContainerRef.current;
          div.innerHTML = '';
          
          const id = `mermaid-${Date.now()}`;
          const pre = document.createElement('div');
          pre.className = 'mermaid';
          pre.id = id;
          pre.textContent = mermaidDiagram;
          div.appendChild(pre);
          
          // Re-render mermaid content
          await mermaid.run();
        } catch (error) {
          console.error('Error rendering mermaid diagram:', error);
          if (mermaidContainerRef.current) {
            mermaidContainerRef.current.innerHTML = '<p>Error rendering diagram</p>';
          }
        }
      }
    };

    renderMermaid();
  }, [mermaidDiagram, showMermaidView]);

  const downloadMermaidSvg = async () => {
    if (!mermaidDiagram) return;
    try {
      const { svg } = await mermaid.render('mindmap-export', mermaidDiagram);
      const element = document.createElement('a');
      element.setAttribute('href', 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
      element.setAttribute('download', `mindmap-${new Date().getTime()}.svg`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error('Error downloading mindmap:', error);
    }
  };

  return (
    <aside className="w-full lg:w-96 bg-[#F0FFF0] h-screen overflow-y-auto p-4">
      <div className="mb-4">
        <div className="inline-block bg-green-300 text-gray-800 font-bold font-['Comic_Sans_MS'] px-6 py-2 rounded-full text-lg">
          MIND MAP
        </div>
      </div>

      {/* Generate Mindmap Button */}
      <div className="bg-gradient-to-r from-purple-200 to-pink-200 rounded-xl p-4 mb-6">
        <button
          onClick={handleGenerateMindmap}
          disabled={isGenerating || messages.length === 0}
          className="w-full flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-bold font-['Comic_Sans_MS'] px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <Zap className="w-5 h-5" aria-hidden="true" />
          {isGenerating ? 'Generating...' : 'Generate Mindmap'}
        </button>
      </div>

      {/* Mermaid Diagram View */}
      {showMermaidView && mermaidDiagram && (
        <div className="mb-6 bg-white rounded-xl p-4 border-2 border-purple-300 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800 font-['Comic_Sans_MS']">Chat Mindmap</h3>
            <div className="flex gap-2">
              <button
                onClick={downloadMermaidSvg}
                className="p-2 hover:bg-gray-200 rounded transition-all duration-200"
                aria-label="Download mindmap"
                title="Download as SVG"
              >
                <Download className="w-4 h-4 text-gray-600" aria-hidden="true" />
              </button>
              <button
                onClick={() => setShowMermaidView(false)}
                className="text-gray-600 hover:text-gray-800 font-bold"
              >
                ✕
              </button>
            </div>
          </div>
          <div
            ref={mermaidContainerRef}
            className="bg-gray-50 rounded p-3 overflow-x-auto max-h-96 flex items-center justify-center"
          >
            {/* Mermaid diagram will be rendered here */}
          </div>
        </div>
      )}

      {/* Audio Summary Section */}
      <div className="bg-blue-100 rounded-xl p-4 mb-6 flex items-center gap-3">
        <button
          className="p-2 bg-blue-300 hover:bg-blue-400 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Play audio summary"
        >
          <Play className="w-5 h-5 text-gray-800" aria-hidden="true" />
        </button>
        <div className="flex-1 h-8 bg-blue-200 rounded-lg relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center gap-1">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="w-1 bg-blue-400 rounded"
                style={{
                  height: `${Math.random() * 60 + 20}%`,
                  animation: `pulse ${Math.random() * 2 + 1}s ease-in-out infinite`
                }}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
        <span className="text-gray-700 font-['Comic_Sans_MS'] text-sm">2:34</span>
      </div>

      {/* Nodes List */}
      <div className="space-y-4">
        {nodes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 font-['Comic_Sans_MS'] text-base leading-loose tracking-wide">
              Mind map will appear here as you chat with the AI.
            </p>
          </div>
        ) : (
          nodes.map((node, index) => (
            <NodeCard
              key={node.id}
              node={node}
              index={index}
              isExpanded={expandedNodes.has(node.id)}
              onToggle={() => toggleNode(node.id)}
            />
          ))
        )}
      </div>
    </aside>
  );
};

import { useState } from 'react';
import { Play, Settings, ChevronDown, ChevronRight } from 'lucide-react';
import { MindMapNode } from '../types';

interface MindMapPanelProps {
  nodes: MindMapNode[];
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

export const MindMapPanel = ({ nodes }: MindMapPanelProps) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

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

  return (
    <aside className="w-full lg:w-96 bg-[#F0FFF0] h-screen overflow-y-auto p-4">
      <div className="mb-4">
        <div className="inline-block bg-green-300 text-gray-800 font-bold font-['Comic_Sans_MS'] px-6 py-2 rounded-full text-lg">
          MIND MAP
        </div>
      </div>

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

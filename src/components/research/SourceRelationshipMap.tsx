import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Source, Match } from '../../types/analysis';
import type { ClaimItem } from '../../types/claim';
import { Network, List, ExternalLink, ShieldCheck } from 'lucide-react';

interface SourceRelationshipMapProps {
  documentTitle: string;
  sources: Source[];
  matches: Match[];
  claims?: ClaimItem[];
  onSelectSource?: (source: Source) => void;
  onSelectMatch?: (match: Match) => void;
}

export const SourceRelationshipMap: React.FC<SourceRelationshipMapProps> = ({
  documentTitle,
  sources,
  matches,
  claims = [],
  onSelectSource,
  onSelectMatch,
}) => {
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // SVG Center & Node calculations
  const width = 600;
  const height = 400;
  const centerX = width / 2;
  const centerY = height / 2;

  const validSources = sources.slice(0, 8); // Max 8 nodes for visual clarity
  const radius = 140;

  const sourceNodes = validSources.map((source, idx) => {
    const angle = (idx / (validSources.length || 1)) * 2 * Math.PI - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    const relatedMatch = matches.find((m) => m.sourceId === source.id || m.sources?.some((s) => s.id === source.id));

    return {
      id: source.id,
      title: source.title || source.domain,
      url: source.url,
      x,
      y,
      similarity: source.similarity,
      verified: source.verified,
      source,
      relatedMatch,
    };
  });

  return (
    <div className="bg-[#0b0c10] border border-white/10 rounded-xl p-4 flex flex-col space-y-4">
      {/* Header & View Mode Switcher */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <Network className="w-5 h-5 text-cyan-400" />
          <h3 className="font-semibold text-white text-sm">Source Relationship Topology Map</h3>
        </div>

        <div className="flex items-center bg-black/50 p-1 rounded-lg border border-white/10 text-xs">
          <button
            onClick={() => setViewMode('graph')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-all ${
              viewMode === 'graph' ? 'bg-cyan-500/20 text-cyan-400 font-medium' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Interactive Map</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-all ${
              viewMode === 'list' ? 'bg-cyan-500/20 text-cyan-400 font-medium' : 'text-gray-400 hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Accessible List</span>
          </button>
        </div>
      </div>

      {viewMode === 'graph' ? (
        <div className="relative w-full overflow-hidden bg-black/60 rounded-lg p-2 border border-white/5 flex flex-col items-center">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[380px]">
            {/* Background Connection Lines */}
            {sourceNodes.map((node) => (
              <line
                key={`line-${node.id}`}
                x1={centerX}
                y1={centerY}
                x2={node.x}
                y2={node.y}
                stroke={selectedNodeId === node.id ? '#38bdf8' : 'rgba(255,255,255,0.15)'}
                strokeWidth={selectedNodeId === node.id ? 2.5 : 1.5}
                strokeDasharray={node.verified ? undefined : '4,4'}
              />
            ))}

            {/* Central Document Node */}
            <g transform={`translate(${centerX}, ${centerY})`}>
              <circle r="36" fill="#0f172a" stroke="#0284c7" strokeWidth="2.5" className="filter drop-shadow-md" />
              <text textAnchor="middle" dy="-4" fill="#ffffff" fontSize="11" fontWeight="bold">
                DOCUMENT
              </text>
              <text textAnchor="middle" dy="12" fill="#94a3b8" fontSize="9">
                {documentTitle.slice(0, 12)}...
              </text>
            </g>

            {/* Source Radial Nodes */}
            {sourceNodes.map((node) => {
              const isSelected = selectedNodeId === node.id;

              return (
                <g
                  key={`node-${node.id}`}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedNodeId(node.id);
                    if (onSelectSource) onSelectSource(node.source);
                    if (node.relatedMatch && onSelectMatch) onSelectMatch(node.relatedMatch);
                  }}
                >
                  <circle
                    r={isSelected ? "26" : "22"}
                    fill={node.verified ? "#064e3b" : "#1e1b4b"}
                    stroke={isSelected ? "#38bdf8" : node.verified ? "#10b981" : "#6366f1"}
                    strokeWidth="2"
                  />
                  <text textAnchor="middle" dy="-2" fill="#ffffff" fontSize="9" fontWeight="600">
                    {node.title.slice(0, 10)}
                  </text>
                  <text textAnchor="middle" dy="10" fill="#a7f3d0" fontSize="8">
                    {node.similarity}% sim
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Node Info Overlay */}
          {selectedNodeId && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full bg-[#131722] border border-cyan-500/30 rounded-lg p-3 mt-2 flex items-center justify-between text-xs"
            >
              {(() => {
                const activeNode = sourceNodes.find((n) => n.id === selectedNodeId);
                if (!activeNode) return null;
                return (
                  <>
                    <div>
                      <div className="font-semibold text-white flex items-center space-x-1.5">
                        <span>{activeNode.title}</span>
                        {activeNode.verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <div className="text-gray-400 truncate max-w-md mt-0.5">{activeNode.url || 'No URL available'}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-cyan-500/20 text-cyan-300 font-semibold px-2 py-0.5 rounded">
                        {activeNode.similarity}% Overlap
                      </span>
                      {activeNode.url && (
                        <a
                          href={activeNode.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-gray-400 hover:text-white bg-white/5 rounded hover:bg-white/10"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </>
                );
              })()}
            </motion.div>
          )}
        </div>
      ) : (
        /* Accessible List View Fallback */
        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
          <div className="text-xs text-gray-400 mb-2">
            Structured representation of source relationships connected to <strong className="text-white">{documentTitle}</strong>:
          </div>

          {sources.map((src, i) => {
            const relatedMatch = matches.find((m) => m.sourceId === src.id || m.sources?.some((s) => s.id === src.id));
            const matchingClaims = claims.filter((c) => c.sources.some((s) => s.id === src.id));

            return (
              <div
                key={src.id || i}
                onClick={() => {
                  if (onSelectSource) onSelectSource(src);
                  if (relatedMatch && onSelectMatch) onSelectMatch(relatedMatch);
                }}
                className="bg-black/40 border border-white/10 hover:border-cyan-500/40 rounded-lg p-3 transition-all cursor-pointer text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-white flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>{src.title || src.domain || 'Source Reference'}</span>
                  </div>
                  <span className="bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono font-semibold">
                    {src.similarity}% Similarity
                  </span>
                </div>

                <div className="text-gray-400 pl-4 border-l border-white/10 space-y-1">
                  <div>
                    <strong>Connection Type:</strong> {relatedMatch ? 'Direct Text Match' : 'Citation Alignment'}
                  </div>
                  {src.url && (
                    <div className="truncate">
                      <strong>URL:</strong> {src.url}
                    </div>
                  )}
                  {matchingClaims.length > 0 && (
                    <div className="text-emerald-400">
                      <strong>Supporting Claims:</strong> {matchingClaims.length} verified assertion(s)
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

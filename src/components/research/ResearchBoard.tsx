import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { researchBoardStore } from '../../lib/researchBoardStore';
import type { BoardCard, BoardCollection, BoardConnection } from '../../lib/researchBoardStore';
import { Layout, Plus, Search, Folder, Trash2, ExternalLink, Bookmark } from 'lucide-react';

interface ResearchBoardProps {
  documentId: string;
  versionId: string;
  analysisId: string;
  documentTitle?: string;
  onOpenSource?: (sourceId: string) => void;
  onOpenEvidence?: (entityId: string) => void;
}

export const ResearchBoard: React.FC<ResearchBoardProps> = ({
  documentId,
  versionId,
  analysisId,
  onOpenEvidence,
}) => {
  const [collections] = useState<BoardCollection[]>(() => researchBoardStore.getCollections());
  const [activeCollectionId, setActiveCollectionId] = useState<string>(collections[0]?.id || 'coll-default');
  const [cards, setCards] = useState<BoardCard[]>(() => researchBoardStore.getCards(activeCollectionId, documentId));
  const [connections, setConnections] = useState<BoardConnection[]>(() => researchBoardStore.getConnections(activeCollectionId));
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  const refreshBoard = () => {
    setCards(researchBoardStore.getCards(activeCollectionId, documentId));
    setConnections(researchBoardStore.getConnections(activeCollectionId));
  };

  const handleCreateCard = (type: BoardCard['type'], title: string, snippet: string) => {
    researchBoardStore.addCard({
      collectionId: activeCollectionId,
      documentId,
      versionId,
      analysisId,
      type,
      title,
      snippet,
      entityId: `entity-${Date.now()}`,
      x: 50 + (cards.length % 4) * 220,
      y: 50 + Math.floor(cards.length / 4) * 160,
    });
    refreshBoard();
  };

  const handleDeleteCard = (id: string) => {
    researchBoardStore.removeCard(id);
    refreshBoard();
  };

  const filteredCards = cards.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.snippet.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#0b0c10] border border-white/10 rounded-2xl p-5 flex flex-col space-y-4 min-h-[500px]">
      {/* Top Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-600 dark:text-cyan-400">
            <Layout className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Visual Research Command Board</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">Organize claims, sources, and evidence collections</p>
          </div>
        </div>

        {/* Collection Selector & View Switcher */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-black/40 p-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs">
            <Folder className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 ml-1" />
            <select
              value={activeCollectionId}
              onChange={(e) => {
                setActiveCollectionId(e.target.value);
                setCards(researchBoardStore.getCards(e.target.value, documentId));
                setConnections(researchBoardStore.getConnections(e.target.value));
              }}
              className="bg-transparent text-slate-900 dark:text-white focus:outline-none text-xs font-medium cursor-pointer pr-2"
            >
              {collections.map((coll) => (
                <option key={coll.id} value={coll.id} className="bg-[#11131c]">
                  {coll.name} ({coll.type})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-black/50 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'board' ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Visual Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Accessible List
            </button>
          </div>
        </div>
      </div>

      {/* Quick Search & Add Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search board cards, claims, or sources... (/)"
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/40"
          />
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleCreateCard('note', 'Custom Note', 'Recorded research note observation.')}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-medium border border-white/10 flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Add Note</span>
          </button>
          <button
            onClick={() => handleCreateCard('claim', 'Factual Assertion', 'Extracted study claim for review.')}
            className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-xl text-xs font-bold border border-cyan-500/30 flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Add Claim Card</span>
          </button>
        </div>
      </div>

      {/* Board View Mode */}
      {viewMode === 'board' ? (
        <div className="relative w-full min-h-[420px] bg-black/50 border border-white/5 rounded-xl p-4 overflow-auto">
          {/* SVG Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {connections.map((conn) => {
              const cardA = cards.find((c) => c.id === conn.fromCardId);
              const cardB = cards.find((c) => c.id === conn.toCardId);
              if (!cardA || !cardB) return null;

              return (
                <line
                  key={conn.id}
                  x1={cardA.x + 100}
                  y1={cardA.y + 50}
                  x2={cardB.x + 100}
                  y2={cardB.y + 50}
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                />
              );
            })}
          </svg>

          {/* Cards Grid / Canvas */}
          {filteredCards.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredCards.map((card) => (
                <motion.div
                  key={card.id}
                  layout
                  className="bg-[#131722] border border-white/10 hover:border-cyan-500/40 rounded-xl p-4 flex flex-col justify-between space-y-3 text-xs shadow-lg relative group transition-all"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="font-semibold text-cyan-400 uppercase tracking-wider text-[10px] flex items-center space-x-1">
                      <Bookmark className="w-3 h-3" />
                      <span>{card.type}</span>
                    </span>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-sm leading-snug">{card.title}</h4>
                    <p className="text-gray-300 font-mono text-[11px] mt-1 line-clamp-3 leading-relaxed">
                      "{card.snippet}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-white/5">
                    <span>{new Date(card.createdAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => onOpenEvidence && onOpenEvidence(card.entityId)}
                      className="text-cyan-400 hover:underline flex items-center space-x-1"
                    >
                      <span>Details</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center text-gray-500 text-xs">
              <Layout className="w-8 h-8 text-gray-600 mb-2" />
              <p className="font-medium text-white text-sm">Your research board is empty.</p>
              <p className="mt-1">Click "Add Note" or "Add Claim Card" above to build your evidence workspace.</p>
            </div>
          )}
        </div>
      ) : (
        /* Accessible List View */
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {filteredCards.map((card) => (
            <div
              key={card.id}
              className="bg-black/40 border border-white/10 p-3 rounded-xl flex items-center justify-between text-xs"
            >
              <div className="flex items-center space-x-3">
                <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 font-mono font-bold rounded uppercase text-[10px]">
                  {card.type}
                </span>
                <div>
                  <h4 className="font-bold text-white">{card.title}</h4>
                  <p className="text-gray-400 font-mono truncate max-w-lg">{card.snippet}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDeleteCard(card.id)}
                  className="p-1.5 text-gray-400 hover:text-red-400 rounded hover:bg-white/5"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

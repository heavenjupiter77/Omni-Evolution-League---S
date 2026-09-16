import React, { useState, useMemo } from 'react';
import { NewspaperEdition } from '../types';
import { Search, Calendar, ChevronRight, Newspaper, X, Flame, Clock, Plus } from 'lucide-react';

interface NewspaperSectionProps {
  newspapers: NewspaperEdition[];
  onNavigateToAdmin?: () => void;
}

export const NewspaperSection: React.FC<NewspaperSectionProps> = ({
  newspapers,
  onNavigateToAdmin,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(8);
  const [selectedEdition, setSelectedEdition] = useState<NewspaperEdition | null>(null);

  // Filter editions based on title or article headings
  const filteredEditions = useMemo(() => {
    if (!searchQuery.trim()) {
      return newspapers;
    }
    const q = searchQuery.toLowerCase();
    return newspapers.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.articles.some((a) => a.heading.toLowerCase().includes(q))
    );
  }, [newspapers, searchQuery]);

  // Paginated list
  const displayEditions = filteredEditions.slice(0, visibleCount);
  const hasMore = visibleCount < filteredEditions.length;

  const handleSeePreviousTwenty = () => {
    setVisibleCount((prev) => prev + 20);
  };

  const latestEdition = displayEditions[0];
  const subsequentEditions = displayEditions.slice(1);

  if (newspapers.length === 0) {
    return (
      <div className="bg-slate-950/90 rounded-2xl border border-cyan-500/30 p-12 text-center max-w-xl mx-auto space-y-4">
        <div className="w-14 h-14 rounded-full bg-cyan-950/70 border border-cyan-400 flex items-center justify-center mx-auto text-cyan-300">
          <Newspaper className="w-7 h-7" />
        </div>
        <h3 className="font-display font-bold text-xl text-white tracking-wide">
          THE CHRONICLE ARCHIVE
        </h3>
        <p className="text-sm text-slate-400 font-mono leading-relaxed">
          No chronicle dispatches or tournament reports have been published yet.
        </p>
        {onNavigateToAdmin && (
          <div className="pt-2">
            <button
              onClick={onNavigateToAdmin}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] text-cyan-300 font-mono text-xs font-bold tracking-wider transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>COMPOSE EDITION IN ADMIN</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8" id="newspaper-section-container">
      {/* Header & Search Bar */}
      <div className="bg-slate-950/90 rounded-2xl border border-cyan-500/30 p-6 shadow-[0_0_20px_rgba(6,182,212,0.12)] flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-cyan-400" />
            <h2 className="font-display font-bold text-2xl text-white tracking-wider">
              THE CHRONICLE ARCHIVE
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Official league dispatches, player developments, and tactical reports
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
          <input
            id="input-newspaper-search"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setVisibleCount(8);
            }}
            placeholder="Search editions..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-cyan-500/30 focus:border-cyan-400 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* When no results match search */}
      {filteredEditions.length === 0 && (
        <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-12 text-center text-slate-400 font-mono">
          <p className="text-base text-slate-300">No newspaper edition found matching "{searchQuery}".</p>
          <p className="text-xs text-slate-500 mt-2">Try searching by keyword or clear the search query.</p>
        </div>
      )}

      {/* Newspaper Display Grid */}
      {displayEditions.length > 0 && (
        <div className="space-y-6">
          {/* LATEST EDITION: Amber outline */}
          {latestEdition && (
            <div
              id={`latest-newspaper-${latestEdition.id}`}
              onClick={() => setSelectedEdition(latestEdition)}
              className="relative group cursor-pointer bg-slate-950/95 rounded-2xl border-2 border-amber-500/80 hover:border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.25)] hover:shadow-[0_0_35px_rgba(245,158,11,0.4)] p-6 sm:p-8 transition-colors duration-150 overflow-hidden"
            >
              {/* Amber Badge */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500 text-amber-300 font-mono text-xs font-bold">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    LATEST EDITION #{latestEdition.editionNumber || 1}
                  </span>
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    {latestEdition.date}
                  </span>
                </div>
              </div>

              {/* Big Title */}
              <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white group-hover:text-amber-300 transition-colors tracking-wide leading-tight max-w-4xl">
                {latestEdition.title}
              </h3>

              {/* Featured Articles Preview */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
                {latestEdition.articles.map((art) => (
                  <div
                    key={art.id}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-colors"
                  >
                    {art.category && (
                      <span className="text-[10px] font-mono uppercase text-amber-400 block mb-1">
                        {art.category}
                      </span>
                    )}
                    <h4 className="font-display text-sm font-bold text-slate-200 line-clamp-2">
                      {art.heading}
                    </h4>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                      {art.body}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between text-xs font-mono text-amber-400 pt-3 border-t border-amber-950/60">
                <span>CLICK TO READ COMPLETE DISPATCH</span>
                <span className="flex items-center gap-1">
                  READ FULL DISPATCH <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          )}

          {/* REMAINING EDITIONS: Neon Cyan Outlines with simple hover lighting */}
          {subsequentEditions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subsequentEditions.map((edition) => (
                <div
                  key={edition.id}
                  id={`newspaper-card-${edition.id}`}
                  onClick={() => setSelectedEdition(edition)}
                  className="group cursor-pointer bg-slate-950/90 rounded-xl border border-cyan-500/30 hover:border-cyan-400 p-5 shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] transition-colors duration-150 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                      <span className="text-cyan-400 font-bold">
                        VOL. {edition.editionNumber || 1}
                      </span>
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        {edition.date}
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-base text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                      {edition.title}
                    </h4>

                    {/* Articles preview */}
                    <div className="mt-4 space-y-2">
                      {edition.articles.slice(0, 2).map((a) => (
                        <div
                          key={a.id}
                          className="p-2 rounded bg-slate-900/60 border border-slate-800/80"
                        >
                          <h5 className="font-mono text-xs font-semibold text-slate-300 truncate">
                            {a.heading}
                          </h5>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                            {a.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-xs font-mono text-cyan-400/80 group-hover:text-cyan-300">
                    <span>{edition.articles.length} Article{edition.articles.length > 1 ? 's' : ''}</span>
                    <span className="flex items-center gap-1">
                      Read <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && (
            <div className="pt-4 text-center">
              <button
                id="btn-see-previous-twenty"
                onClick={handleSeePreviousTwenty}
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-cyan-500/40 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] text-cyan-300 font-mono text-xs font-bold tracking-wider transition-colors cursor-pointer"
              >
                LOAD MORE EDITIONS (+20)
              </button>
            </div>
          )}
        </div>
      )}

      {/* EDITION DETAIL MODAL */}
      {selectedEdition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-950 border-2 border-cyan-400 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-[0_0_35px_rgba(6,182,212,0.3)] relative">
            <button
              onClick={() => setSelectedEdition(null)}
              className="absolute top-6 right-6 p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-xs font-mono text-cyan-400 mb-2">
              <span className="font-bold">VOL. {selectedEdition.editionNumber || 1}</span>
              <span>•</span>
              <span>{selectedEdition.date}</span>
            </div>

            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-wide leading-tight pr-8">
              {selectedEdition.title}
            </h2>

            <div className="mt-8 space-y-6">
              {selectedEdition.articles.map((art, idx) => (
                <article
                  key={art.id || idx}
                  className="p-5 rounded-xl bg-slate-900/70 border border-slate-800"
                >
                  {art.category && (
                    <span className="inline-block px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] uppercase font-bold mb-2">
                      {art.category}
                    </span>
                  )}
                  <h3 className="font-display font-bold text-lg text-white mb-3">
                    {art.heading}
                  </h3>
                  <div className="text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                    {art.body}
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedEdition(null)}
                className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono cursor-pointer transition-colors"
              >
                CLOSE DISPATCH
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

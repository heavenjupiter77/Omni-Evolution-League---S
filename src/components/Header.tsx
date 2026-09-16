import React from 'react';
import { Swords, Newspaper, Shield, Lock, FileSpreadsheet, Activity } from 'lucide-react';

export type MainTab = 'profiles' | 'compare' | 'newspaper' | 'admin';

interface HeaderProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'alert';
  autoSaveCountdown: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  syncStatus,
  autoSaveCountdown,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-cyan-500/30">
      {/* Clean, minimalist live status bar */}
      <div className="border-b border-slate-900 bg-slate-950/70 px-4 py-1.5 text-[11px] font-mono flex items-center justify-between text-slate-400">
        <div className="flex items-center gap-2">
          {/* Top-left title removed per user request */}
        </div>

        {/* Live Google Sheets & Auto-save status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-slate-400">Registry:</span>
            <span className="font-bold">SYNCED</span>
          </div>

          <div className="flex items-center gap-1.5 text-cyan-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="hidden sm:inline text-slate-400">Auto-save:</span>
            <span>{autoSaveCountdown}s</span>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand & Title (Image & subtitle removed per instructions, main title kept) */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onTabChange('profiles')}
            className="text-left cursor-pointer focus:outline-none"
          >
            <h1 className="font-display font-extrabold text-lg sm:text-xl tracking-wider text-white hover:text-cyan-300 transition-colors">
              OMNI EVOLUTION LEAGUE
            </h1>
          </button>

          {/* Mobile Admin Link */}
          <button
            onClick={() => onTabChange('admin')}
            className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/40 text-cyan-300 font-mono text-xs hover:border-cyan-400 hover:bg-slate-800 transition-colors"
          >
            <Lock className="w-3 h-3" />
            <span>/admin</span>
          </button>
        </div>

        {/* Tab Navigation with Theme-Based Horizontal Scroll */}
        <div className="relative flex items-center">
          <nav
            className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin scrollbar-thumb-cyan-700 scrollbar-track-slate-950"
            id="main-navigation-tabs"
          >
          <button
            id="nav-tab-profiles"
            onClick={() => onTabChange('profiles')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold tracking-wider transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'profiles'
                ? 'bg-cyan-950/90 border border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>ATHLETE METRICS</span>
          </button>

          <button
            id="nav-tab-compare"
            onClick={() => onTabChange('compare')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold tracking-wider transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'compare'
                ? 'bg-cyan-950/90 border border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>CLASH COMPARE</span>
          </button>

          <button
            id="nav-tab-newspaper"
            onClick={() => onTabChange('newspaper')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold tracking-wider transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'newspaper'
                ? 'bg-cyan-950/90 border border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>THE CHRONICLE</span>
          </button>

          <button
            id="nav-tab-admin"
            onClick={() => onTabChange('admin')}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold tracking-wider transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-cyan-950/90 border border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                : 'text-cyan-400/80 border border-cyan-500/20 hover:border-cyan-400 hover:bg-cyan-950/30'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>/ADMIN</span>
          </button>
        </nav>
        </div>
      </div>
    </header>
  );
};

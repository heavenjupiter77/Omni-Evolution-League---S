import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PlayerProfile,
  NewspaperEdition,
  SyncLogEntry,
  METRIC_DEFINITIONS,
} from './types';
import {
  loadStoredData,
  saveStoredData,
  verifyAndSyncGoogleSheets,
  getSyncLogs,
} from './utils/storage';
import { ensurePlayerPerformance } from './utils/performance';
import { Header, MainTab } from './components/Header';
import { PlayerCard } from './components/PlayerCard';
import { ProfileComparison } from './components/ProfileComparison';
import { NewspaperSection } from './components/NewspaperSection';
import { AdminPanel } from './components/AdminPanel';
import {
  Search,
  Filter,
  Activity,
  CheckCircle2,
  Lock,
  UserPlus,
} from 'lucide-react';

export default function App() {
  const initial = loadStoredData();
  const [players, setPlayers] = useState<PlayerProfile[]>(() =>
    initial.players.map(ensurePlayerPerformance)
  );
  const [newspapers, setNewspapers] = useState<NewspaperEdition[]>(initial.newspapers);
  const [lastSavedTime, setLastSavedTime] = useState<string>(initial.lastSaved);

  // Tab State & Route Handling
  const [activeTab, setActiveTab] = useState<MainTab>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname.startsWith('/admin') || window.location.hash === '#admin') {
        return 'admin';
      }
    }
    return 'profiles';
  });

  // URL synchronization for /admin
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname.startsWith('/admin') || window.location.hash === '#admin') {
        setActiveTab('admin');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleTabChange = (tab: MainTab) => {
    setActiveTab(tab);
    if (tab === 'admin') {
      window.history.pushState(null, '', '/admin');
    } else {
      window.history.pushState(null, '', '/');
    }
  };

  // Compare targets
  const [compareP1Id, setCompareP1Id] = useState<string>(initial.players[0]?.id || '');
  const [compareP2Id, setCompareP2Id] = useState<string>(initial.players[1]?.id || '');

  // Filter & Search on Roster
  const [playerSearchQuery, setPlayerSearchQuery] = useState('');
  const [selectedArchetype, setSelectedArchetype] = useState<string>('ALL');

  // Auto-Save Countdown (60 seconds)
  const [autoSaveCountdown, setAutoSaveCountdown] = useState(60);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'alert'>('synced');
  const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>(() => getSyncLogs());
  const [syncNotification, setSyncNotification] = useState<string | null>(null);

  // References to keep current state inside intervals
  const playersRef = useRef(players);
  const newspapersRef = useRef(newspapers);
  useEffect(() => {
    playersRef.current = players;
  }, [players]);
  useEffect(() => {
    newspapersRef.current = newspapers;
  }, [newspapers]);

  // Initial load check with Google Sheets
  useEffect(() => {
    const runInitialSyncCheck = async () => {
      setSyncStatus('syncing');
      const res = await verifyAndSyncGoogleSheets(playersRef.current, newspapersRef.current);
      setSyncStatus('synced');
      setSyncLogs(getSyncLogs());
      if (!res.matched) {
        setSyncNotification(res.message);
        setTimeout(() => setSyncNotification(null), 4000);
      }
    };
    runInitialSyncCheck();
  }, []);

  // 1-Minute Auto-Save Interval (every 60 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setAutoSaveCountdown((prev) => {
        if (prev <= 1) {
          const newTimestamp = saveStoredData(playersRef.current, newspapersRef.current);
          setLastSavedTime(newTimestamp);

          verifyAndSyncGoogleSheets(playersRef.current, newspapersRef.current).then(() => {
            setSyncLogs(getSyncLogs());
          });

          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Manual save handler
  const handleManualSave = useCallback(() => {
    const newTimestamp = saveStoredData(players, newspapers);
    setLastSavedTime(newTimestamp);
    setAutoSaveCountdown(60);
    verifyAndSyncGoogleSheets(players, newspapers).then(() => {
      setSyncLogs(getSyncLogs());
    });
  }, [players, newspapers]);

  const handleTriggerSyncCheck = useCallback(async () => {
    setSyncStatus('syncing');
    const res = await verifyAndSyncGoogleSheets(players, newspapers);
    setSyncStatus('synced');
    setSyncLogs(getSyncLogs());
    setSyncNotification(res.message);
    setTimeout(() => setSyncNotification(null), 3500);
  }, [players, newspapers]);

  // Quick Compare jumper from a player card
  const handleQuickCompare = (targetPlayer: PlayerProfile) => {
    setCompareP1Id(targetPlayer.id);
    const other = players.find((p) => p.id !== targetPlayer.id);
    if (other) setCompareP2Id(other.id);
    handleTabChange('compare');
  };

  // Filtered Players
  const filteredPlayers = players.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(playerSearchQuery.toLowerCase()) ||
      p.nickname.toLowerCase().includes(playerSearchQuery.toLowerCase());

    const matchesArchetype =
      selectedArchetype === 'ALL' || p.archetype === selectedArchetype;

    return matchesSearch && matchesArchetype;
  });

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 cyber-grid flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Header with Navigation */}
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        syncStatus={syncStatus}
        autoSaveCountdown={autoSaveCountdown}
      />

      {/* Floating Auto-Sync Notification */}
      {syncNotification && (
        <div className="fixed top-16 right-6 z-50 p-3.5 rounded-xl bg-slate-950/95 border border-emerald-400 text-emerald-300 font-mono text-xs shadow-[0_0_25px_rgba(16,185,129,0.3)] flex items-center gap-3 max-w-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="font-bold block uppercase text-[10px] text-emerald-400">
              Registry Sync
            </span>
            <p className="text-slate-200 mt-0.5 leading-snug">{syncNotification}</p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: PLAYER ROSTER & 6 DISTINCT METRICS */}
        {activeTab === 'profiles' && (
          <div className="space-y-8" id="view-player-profiles">
            {/* Minimalist Hero Section */}
            <div className="bg-slate-950/90 rounded-2xl border border-cyan-500/30 p-6 sm:p-8 shadow-[0_0_25px_rgba(6,182,212,0.1)] relative overflow-hidden">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 text-xs font-mono mb-3">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ATHLETE METRICS VAULT</span>
                </div>
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-wide leading-tight">
                  OMNI EVOLUTION LEAGUE
                </h2>
                <p className="text-sm sm:text-base text-slate-300 font-mono mt-3 leading-relaxed">
                  Evaluate athletes across 6 distinct metrics ranked D to S. Strengths, weaknesses, and tactical archetypes.
                </p>
              </div>

              {/* 6 Metrics Legend */}
              <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {METRIC_DEFINITIONS.map((m) => (
                  <div
                    key={m.key}
                    className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800"
                  >
                    <span className="font-mono text-cyan-400 font-bold text-xs block">
                      {m.code}
                    </span>
                    <span className="text-white text-xs font-medium block truncate">
                      {m.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Grade Bar Color Spectrum Legend (As Requested: D=grey-red, C=yellow, B=blue, A=green, S=purple) */}
              <div className="mt-4 pt-4 border-t border-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <span className="text-slate-400 uppercase text-[11px]">Rank Gradient Scale:</span>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-4 h-2 rounded-sm bg-gradient-to-r from-neutral-700 via-zinc-600 to-red-600 inline-block border border-red-700/60" />
                    <span>D (Grey-Red)</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-4 h-2 rounded-sm bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-300 inline-block border border-amber-600/60" />
                    <span>C (Yellow)</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-4 h-2 rounded-sm bg-gradient-to-r from-cyan-600 via-blue-500 to-sky-400 inline-block border border-cyan-600/60" />
                    <span>B (Blue)</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-4 h-2 rounded-sm bg-gradient-to-r from-emerald-600 via-green-500 to-teal-300 inline-block border border-emerald-600/60" />
                    <span>A (Green)</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-4 h-2 rounded-sm bg-gradient-to-r from-violet-700 via-fuchsia-500 to-purple-400 inline-block border border-purple-600/60" />
                    <span>S (Purple)</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                <input
                  id="input-roster-search"
                  type="text"
                  value={playerSearchQuery}
                  onChange={(e) => setPlayerSearchQuery(e.target.value)}
                  placeholder="Search athlete by name or title..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Archetype Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <span className="text-[11px] font-mono text-slate-500 uppercase mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3 text-cyan-400" />
                  Archetype:
                </span>
                {['ALL', 'Attacker', 'Chopper', 'Blocker', 'Finisher', 'Lobber'].map((arch) => (
                  <button
                    key={arch}
                    onClick={() => setSelectedArchetype(arch)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold tracking-wider cursor-pointer transition-colors ${
                      selectedArchetype === arch
                        ? 'bg-cyan-950 border border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.35)]'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {arch.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Player Cards Grid */}
            {filteredPlayers.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="roster-cards-grid">
                {filteredPlayers.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    onCompareSelect={handleQuickCompare}
                  />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 font-mono bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
                {players.length === 0 ? (
                  <>
                    <p className="text-base text-slate-300">No athlete profiles enrolled in the league yet.</p>
                    <p className="text-xs text-slate-500">Enlist your first athlete profile with photo and 6 distinct metrics in the admin console.</p>
                    <div className="pt-2">
                      <button
                        onClick={() => handleTabChange('admin')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] text-cyan-300 font-mono text-xs font-bold tracking-wider transition-colors cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>ENLIST FIRST ATHLETE</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-400">No athletes matched your query "{playerSearchQuery}".</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PROFILE COMPARISON */}
        {activeTab === 'compare' && (
          <ProfileComparison
            players={players}
            initialPlayer1Id={compareP1Id}
            initialPlayer2Id={compareP2Id}
            onNavigateToAdmin={() => handleTabChange('admin')}
          />
        )}

        {/* TAB 3: THE CHRONICLE (NEWSPAPER ARCHIVE) */}
        {activeTab === 'newspaper' && (
          <NewspaperSection
            newspapers={newspapers}
            onNavigateToAdmin={() => handleTabChange('admin')}
          />
        )}

        {/* TAB 4: ADMIN SYSTEM */}
        {activeTab === 'admin' && (
          <AdminPanel
            players={players}
            newspapers={newspapers}
            onSavePlayers={(updated) => {
              setPlayers(updated);
              const timestamp = saveStoredData(updated, newspapers);
              setLastSavedTime(timestamp);
            }}
            onSaveNewspapers={(updated) => {
              setNewspapers(updated);
              const timestamp = saveStoredData(players, updated);
              setLastSavedTime(timestamp);
            }}
            onManualSave={handleManualSave}
            lastSavedTime={lastSavedTime}
            autoSaveCountdown={autoSaveCountdown}
            syncStatus={syncStatus}
            syncLogs={syncLogs}
            onTriggerSyncCheck={handleTriggerSyncCheck}
          />
        )}
      </main>

      {/* Clean Minimalist Footer (NO password, NO fluff) */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-5 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="font-semibold tracking-wider">OMNI EVOLUTION LEAGUE</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Auto-Sync Active</span>
            <span>•</span>
            <button
              onClick={() => handleTabChange('admin')}
              className="flex items-center gap-1.5 text-cyan-400/80 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              <Lock className="w-3 h-3" />
              <span>/admin</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

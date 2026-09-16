import React, { useState, useRef } from 'react';
import {
  PlayerProfile,
  NewspaperEdition,
  RankGrade,
  PlayerArchetype,
  MetricKey,
  METRIC_DEFINITIONS,
  SyncLogEntry,
} from '../types';
import { getRankBadgeStyle } from '../utils/ranks';
import { ThemeStepper } from './ThemeStepper';
import { PerformanceRatingAdmin } from './PerformanceRatingAdmin';
import {
  Lock,
  Unlock,
  Save,
  Clock,
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  X,
  FileText,
  UserPlus,
  Shield,
  Layers,
  Upload,
  User,
  Image as ImageIcon,
  Activity,
} from 'lucide-react';

interface AdminPanelProps {
  players: PlayerProfile[];
  newspapers: NewspaperEdition[];
  onSavePlayers: (players: PlayerProfile[]) => void;
  onSaveNewspapers: (newspapers: NewspaperEdition[]) => void;
  onManualSave: () => void;
  lastSavedTime: string;
  autoSaveCountdown: number;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'alert';
  syncLogs: SyncLogEntry[];
  onTriggerSyncCheck: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  players,
  newspapers,
  onSavePlayers,
  onSaveNewspapers,
  onManualSave,
  lastSavedTime,
  autoSaveCountdown,
  syncStatus,
  syncLogs,
  onTriggerSyncCheck,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // Active admin sub-tab
  const [activeAdminTab, setActiveAdminTab] = useState<'profiles' | 'newspapers' | 'performance' | 'sheets'>('profiles');

  // Modals
  const [editingPlayer, setEditingPlayer] = useState<PlayerProfile | null>(null);
  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<PlayerProfile | null>(null);

  const [editingNewspaper, setEditingNewspaper] = useState<NewspaperEdition | null>(null);
  const [isCreatingNewspaper, setIsCreatingNewspaper] = useState(false);
  const [newspaperToDelete, setNewspaperToDelete] = useState<NewspaperEdition | null>(null);

  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === 'oelauditor') {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const triggerManualSave = () => {
    onManualSave();
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2500);
  };

  // If not authenticated, render password lock gate (NO password hint or password exposure)
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12" id="admin-password-gate">
        <div className="bg-slate-950/95 rounded-2xl border border-cyan-500/40 p-8 shadow-[0_0_30px_rgba(6,182,212,0.15)] text-center relative">
          <div className="w-14 h-14 rounded-full bg-cyan-950/80 border border-cyan-400 flex items-center justify-center mx-auto text-cyan-300 mb-4">
            <Lock className="w-6 h-6 text-cyan-400" />
          </div>

          <h2 className="font-display font-bold text-2xl text-white tracking-wider">
            ADMIN SECURITY ACCESS
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Restricted access. Enter administrator passphrase to manage profiles and chronicle publications.
          </p>

          <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
            <div>
              <input
                id="input-admin-password"
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setAuthError(false);
                }}
                placeholder="Enter passphrase..."
                className={`w-full px-4 py-3 bg-slate-900 border rounded-xl text-center text-sm font-mono text-white placeholder-slate-500 focus:outline-none transition-colors ${
                  authError
                    ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                    : 'border-cyan-500/40 focus:border-cyan-400'
                }`}
              />
              {authError && (
                <p className="text-xs font-mono text-red-400 mt-2 flex items-center justify-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Access Denied: Incorrect passphrase.
                </p>
              )}
            </div>

            <button
              id="btn-admin-login"
              type="submit"
              className="w-full py-3 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-400 text-cyan-300 font-mono font-bold text-xs tracking-widest uppercase cursor-pointer transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              AUTHENTICATE ADMIN
            </button>
          </form>

          <div className="mt-6 text-[11px] font-mono text-slate-500">
            System Protected
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" id="admin-system-container">
      {/* Top Admin Controls & Auto-Save Indicator */}
      <div className="bg-slate-950/95 rounded-2xl border border-cyan-500/30 p-6 shadow-[0_0_20px_rgba(6,182,212,0.12)] flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h2 className="font-display font-bold text-2xl text-white tracking-wider">
              ADMIN CONTROL CENTER
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Manage athlete profiles, publish chronicle dispatches, and review data registry sync.
          </p>
        </div>

        {/* Visual Auto-save and Manual Save Indicator */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Auto-Save Status Badge */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <div>
              <span className="text-slate-400 text-[10px] block">AUTO-SAVE:</span>
              <span className="text-cyan-300 font-bold">in {autoSaveCountdown}s</span>
            </div>
            <div className="pl-3 border-l border-slate-700">
              <span className="text-slate-400 text-[10px] block">SAVED AT:</span>
              <span className="text-emerald-400 font-bold">{lastSavedTime || 'Just now'}</span>
            </div>
          </div>

          {/* Manual Save Button */}
          <button
            id="btn-manual-save"
            onClick={triggerManualSave}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] text-cyan-300 font-mono text-xs font-bold tracking-wider cursor-pointer transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>SAVE NOW</span>
          </button>

          {/* Logout */}
          <button
            id="btn-admin-logout"
            onClick={() => {
              setIsAuthenticated(false);
              setPasswordInput('');
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
            title="Lock Admin Console"
          >
            <Unlock className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Save Success Banner */}
      {saveSuccessNotice && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-mono text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Vault database state synchronized and locked.</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-emerald-400">Persisted</span>
        </div>
      )}

      {/* Admin Sub-Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            id="admin-subtab-profiles"
            onClick={() => setActiveAdminTab('profiles')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold tracking-wider cursor-pointer transition-colors ${
              activeAdminTab === 'profiles'
                ? 'bg-cyan-950 border border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>ATHLETE PROFILES ({players.length})</span>
          </button>

          <button
            id="admin-subtab-newspapers"
            onClick={() => setActiveAdminTab('newspapers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold tracking-wider cursor-pointer transition-colors ${
              activeAdminTab === 'newspapers'
                ? 'bg-cyan-950 border border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>CHRONICLE DISPATCHES ({newspapers.length})</span>
          </button>

          <button
            id="admin-subtab-performance"
            onClick={() => setActiveAdminTab('performance')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold tracking-wider cursor-pointer transition-colors ${
              activeAdminTab === 'performance'
                ? 'bg-cyan-950 border border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>PERFORMANCE RATINGS</span>
          </button>

          <button
            id="admin-subtab-sheets"
            onClick={() => setActiveAdminTab('sheets')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold tracking-wider cursor-pointer transition-colors ${
              activeAdminTab === 'sheets'
                ? 'bg-cyan-950 border border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>REGISTRY AUDIT LOG</span>
          </button>
        </div>

        {/* Context Action Button */}
        {activeAdminTab === 'profiles' && (
          <button
            id="btn-open-create-player"
            onClick={() => {
              setEditingPlayer(null);
              setIsCreatingPlayer(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] text-cyan-300 font-mono text-xs font-bold tracking-wider cursor-pointer transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>ENLIST ATHLETE</span>
          </button>
        )}

        {activeAdminTab === 'newspapers' && (
          <button
            id="btn-open-create-newspaper"
            onClick={() => {
              setEditingNewspaper(null);
              setIsCreatingNewspaper(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] text-cyan-300 font-mono text-xs font-bold tracking-wider cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>PUBLISH DISPATCH</span>
          </button>
        )}
      </div>

      {/* SECTION 1: PROFILES MANAGEMENT */}
      {activeAdminTab === 'profiles' && (
        <div className="space-y-4" id="admin-players-section">
          {players.length === 0 ? (
            <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-12 text-center text-slate-400 font-mono space-y-3">
              <User className="w-12 h-12 mx-auto text-slate-600" />
              <p className="text-base text-slate-300">No athlete profiles currently enrolled in the league.</p>
              <p className="text-xs text-slate-500">Click "Enlist Athlete" above to configure your first player with the 6 distinct metrics.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map((player) => (
                <div
                  key={player.id}
                  id={`admin-player-card-${player.id}`}
                  className="bg-slate-950/90 rounded-xl border border-cyan-500/30 hover:border-cyan-400 p-4 shadow-[0_0_12px_rgba(6,182,212,0.1)] hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] flex flex-col justify-between transition-colors duration-150"
                >
                  <div>
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-cyan-500/50 bg-slate-900 flex-shrink-0 flex items-center justify-center">
                        {player.avatarUrl ? (
                          <img
                            src={player.avatarUrl}
                            alt={player.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-cyan-400/60" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-display font-bold text-white truncate text-base">
                          {player.name}
                        </h4>
                        {player.nickname && (
                          <p className="text-xs text-cyan-400/80 font-mono truncate">
                            "{player.nickname}"
                          </p>
                        )}
                        <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 uppercase">
                          {player.archetype}
                        </span>
                      </div>
                    </div>

                    {/* Metric summary badges */}
                    <div className="grid grid-cols-3 gap-1.5 my-3 pt-1">
                      {METRIC_DEFINITIONS.map((def) => {
                        const grade = player.metrics[def.key];
                        const badge = getRankBadgeStyle(grade);
                        return (
                          <div
                            key={def.key}
                            className="p-1 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-[10px] font-mono"
                          >
                            <span className="text-slate-400">{def.code}:</span>
                            <span className={`font-bold ${badge.text}`}>{grade}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                    <button
                      id={`btn-edit-player-${player.id}`}
                      onClick={() => {
                        setEditingPlayer(player);
                        setIsCreatingPlayer(false);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-mono transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>EDIT</span>
                    </button>
                    <button
                      id={`btn-delete-player-${player.id}`}
                      onClick={() => setPlayerToDelete(player)}
                      className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-xs transition-colors cursor-pointer"
                      title="Delete profile"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: NEWSPAPER DISPATCHES */}
      {activeAdminTab === 'newspapers' && (
        <div className="space-y-4" id="admin-newspapers-section">
          {newspapers.length === 0 ? (
            <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-12 text-center text-slate-400 font-mono space-y-3">
              <FileText className="w-12 h-12 mx-auto text-slate-600" />
              <p className="text-base text-slate-300">No chronicle dispatches published yet.</p>
              <p className="text-xs text-slate-500">Click "Publish Dispatch" to write tournament reports and league news.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {newspapers.map((news) => (
                <div
                  key={news.id}
                  id={`admin-newspaper-item-${news.id}`}
                  className="bg-slate-950/90 rounded-xl border border-cyan-500/30 hover:border-cyan-400 p-4 shadow-[0_0_12px_rgba(6,182,212,0.1)] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-150"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 text-xs font-mono text-cyan-400 mb-1">
                      <span className="font-bold">VOL. {news.editionNumber || 1}</span>
                      <span>•</span>
                      <span className="text-slate-400">{news.date}</span>
                    </div>
                    <h4 className="font-display font-bold text-white text-base truncate">
                      {news.title}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      {news.articles.length} article(s) included in this dispatch
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      id={`btn-edit-newspaper-${news.id}`}
                      onClick={() => {
                        setEditingNewspaper(news);
                        setIsCreatingNewspaper(false);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-mono transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>EDIT</span>
                    </button>
                    <button
                      id={`btn-delete-newspaper-${news.id}`}
                      onClick={() => setNewspaperToDelete(news)}
                      className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-xs transition-colors cursor-pointer"
                      title="Delete dispatch"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: REGISTRY & GOOGLE SHEETS AUDIT LOG */}
      {activeAdminTab === 'sheets' && (
        <div className="bg-slate-950/90 rounded-2xl border border-cyan-500/30 p-6 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-display font-bold text-lg text-white tracking-wide flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <span>DATA REGISTRY AUDIT TRAIL</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Checksum records verifying integrity across local vault and cloud registry
              </p>
            </div>

            <button
              id="btn-trigger-sync-audit"
              onClick={onTriggerSyncCheck}
              disabled={syncStatus === 'syncing'}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-mono text-xs cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              <span>{syncStatus === 'syncing' ? 'SYNCING...' : 'FORCE VERIFY'}</span>
            </button>
          </div>

          <div className="mt-4 space-y-2 max-h-[360px] overflow-y-auto pr-2 font-mono text-xs">
            {syncLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 flex items-start justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold">[{log.action}]</span>
                    <span className="text-slate-300">{log.details}</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-500 whitespace-nowrap">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: PERFORMANCE RATINGS */}
      {activeAdminTab === 'performance' && (
        <PerformanceRatingAdmin
          players={players}
          onSavePlayers={onSavePlayers}
        />
      )}

      {/* MODAL: Player Create / Edit Form */}
      {(isCreatingPlayer || editingPlayer) && (
        <PlayerFormModal
          initialPlayer={editingPlayer}
          onClose={() => {
            setIsCreatingPlayer(false);
            setEditingPlayer(null);
          }}
          onSave={(savedPlayer) => {
            if (editingPlayer) {
              const updated = players.map((p) =>
                p.id === savedPlayer.id ? savedPlayer : p
              );
              onSavePlayers(updated);
            } else {
              onSavePlayers([savedPlayer, ...players]);
            }
            setIsCreatingPlayer(false);
            setEditingPlayer(null);
          }}
        />
      )}

      {/* CONFIRMATION MODAL: Delete Player */}
      {playerToDelete && (
        <ConfirmationModal
          title="DELETE ATHLETE PROFILE"
          message={`Are you sure you want to delete profile for "${playerToDelete.name}"? This action cannot be reversed.`}
          confirmLabel="CONFIRM DELETION"
          onConfirm={() => {
            const updated = players.filter((p) => p.id !== playerToDelete.id);
            onSavePlayers(updated);
            setPlayerToDelete(null);
          }}
          onCancel={() => setPlayerToDelete(null)}
        />
      )}

      {/* MODAL: Newspaper Create / Edit Form */}
      {(isCreatingNewspaper || editingNewspaper) && (
        <NewspaperFormModal
          initialNewspaper={editingNewspaper}
          onClose={() => {
            setIsCreatingNewspaper(false);
            setEditingNewspaper(null);
          }}
          onSave={(savedNewspaper) => {
            if (editingNewspaper) {
              const updated = newspapers.map((n) =>
                n.id === savedNewspaper.id ? savedNewspaper : n
              );
              onSaveNewspapers(updated);
            } else {
              onSaveNewspapers([savedNewspaper, ...newspapers]);
            }
            setIsCreatingNewspaper(false);
            setEditingNewspaper(null);
          }}
        />
      )}

      {/* CONFIRMATION MODAL: Delete Newspaper */}
      {newspaperToDelete && (
        <ConfirmationModal
          title="DELETE CHRONICLE DISPATCH"
          message={`Are you sure you want to delete edition "${newspaperToDelete.title}" (Vol. ${newspaperToDelete.editionNumber || 1})?`}
          confirmLabel="CONFIRM DELETION"
          onConfirm={() => {
            const updated = newspapers.filter((n) => n.id !== newspaperToDelete.id);
            onSaveNewspapers(updated);
            setNewspaperToDelete(null);
          }}
          onCancel={() => setNewspaperToDelete(null)}
        />
      )}
    </div>
  );
};

// ==========================================
// SUB-COMPONENT: Player Create/Edit Modal
// ==========================================
interface PlayerFormModalProps {
  initialPlayer: PlayerProfile | null;
  onClose: () => void;
  onSave: (player: PlayerProfile) => void;
}

const PlayerFormModal: React.FC<PlayerFormModalProps> = ({ initialPlayer, onClose, onSave }) => {
  const [name, setName] = useState(initialPlayer?.name || '');
  const [nickname, setNickname] = useState(initialPlayer?.nickname || '');
  const [avatarUrl, setAvatarUrl] = useState(initialPlayer?.avatarUrl || '');
  const [archetype, setArchetype] = useState<PlayerArchetype>(
    initialPlayer?.archetype || 'Attacker'
  );

  const [metrics, setMetrics] = useState<Record<MetricKey, RankGrade>>(
    initialPlayer?.metrics || {
      fhf: 'A',
      bhl: 'B',
      ssc: 'A',
      vnp: 'A',
      fwa: 'B',
      rcx: 'A',
    }
  );

  const [strengths, setStrengths] = useState<string[]>(
    initialPlayer?.strengths || ['High topspin velocity on third-ball offensive drive']
  );
  const [weaknesses, setWeaknesses] = useState<string[]>(
    initialPlayer?.weaknesses || ['Slightly lower consistency on passive mid-distance blocks']
  );

  const [newStrength, setNewStrength] = useState('');
  const [newWeakness, setNewWeakness] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMetricChange = (key: MetricKey, grade: RankGrade) => {
    setMetrics((prev) => ({ ...prev, [key]: grade }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddStrength = () => {
    if (newStrength.trim()) {
      setStrengths([...strengths, newStrength.trim()]);
      setNewStrength('');
    }
  };

  const handleAddWeakness = () => {
    if (newWeakness.trim()) {
      setWeaknesses([...weaknesses, newWeakness.trim()]);
      setNewWeakness('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const saved: PlayerProfile = {
      id: initialPlayer?.id || 'player-' + Date.now(),
      name: name.trim(),
      nickname: nickname.trim(),
      avatarUrl: avatarUrl.trim(),
      archetype,
      metrics,
      strengths: strengths.length > 0 ? strengths : ['Strong offensive drive'],
      weaknesses: weaknesses.length > 0 ? weaknesses : ['Vulnerable to deep spin variation'],
      careerHighlights: initialPlayer?.careerHighlights,
      worldRank: initialPlayer?.worldRank,
      bladeRubber: initialPlayer?.bladeRubber,
      currentPerformance: initialPlayer?.currentPerformance ?? 100,
      performanceHistory: initialPlayer?.performanceHistory,
      lastPerformanceMonth: initialPlayer?.lastPerformanceMonth,
    };

    onSave(saved);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-950 border border-cyan-400 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-[0_0_35px_rgba(6,182,212,0.25)] relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-700 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-display font-bold text-xl text-white tracking-wide">
          {initialPlayer ? 'EDIT ATHLETE PROFILE' : 'ENLIST NEW ATHLETE'}
        </h3>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Configure profile details, local photo upload, 6 distinct metrics, and traits
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono uppercase text-cyan-400 font-bold block mb-1">
                Athlete Name *
              </label>
              <input
                id="input-player-name"
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Liam Zhang"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-mono uppercase text-cyan-400 font-bold block mb-1">
                Nickname / Title
              </label>
              <input
                id="input-player-nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. Iron Wall"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Archetype & Avatar File Selector from PC */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div>
              <label className="text-xs font-mono uppercase text-cyan-400 font-bold block mb-1">
                Archetype *
              </label>
              <select
                id="select-player-archetype"
                value={archetype}
                onChange={(e) => setArchetype(e.target.value as PlayerArchetype)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono focus:border-cyan-400 focus:outline-none"
              >
                <option value="Attacker">Attacker</option>
                <option value="Chopper">Chopper</option>
                <option value="Blocker">Blocker</option>
                <option value="Finisher">Finisher</option>
                <option value="Lobber">Lobber</option>
              </select>
            </div>

            {/* Local Image File Selector */}
            <div>
              <label className="text-xs font-mono uppercase text-cyan-400 font-bold block mb-1">
                Athlete Photo (From PC)
              </label>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                id="input-avatar-file"
              />

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg border border-cyan-500/50 bg-slate-900 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-slate-500" />
                  )}
                </div>

                <div className="flex-1 flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 hover:border-cyan-400 hover:shadow-[0_0_10px_rgba(6,182,212,0.3)] text-cyan-300 font-mono text-xs cursor-pointer transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>SELECT IMAGE FROM PC</span>
                  </button>

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="text-[10px] font-mono text-red-400 hover:text-red-300 text-left transition-colors"
                    >
                      Clear Image
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 6 Metrics Ranking (D to S) with Theme Buttons */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <label className="text-xs font-mono uppercase text-cyan-400 font-bold block">
              6 Distinct Metrics Rankings [D, C, B, A, S]
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {METRIC_DEFINITIONS.map((def) => {
                const currentGrade = metrics[def.key];
                return (
                  <div
                    key={def.key}
                    className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800"
                  >
                    <div>
                      <span className="text-cyan-400 font-mono font-bold mr-1.5">{def.code}:</span>
                      <span className="text-xs text-slate-300">{def.name}</span>
                    </div>
                    <div className="flex gap-1">
                      {(['D', 'C', 'B', 'A', 'S'] as RankGrade[]).map((g) => {
                        const isSelected = currentGrade === g;
                        const badge = getRankBadgeStyle(g);
                        return (
                          <button
                            type="button"
                            key={g}
                            onClick={() => handleMetricChange(def.key, g)}
                            className={`w-6 h-6 rounded text-[11px] font-mono font-bold cursor-pointer transition-colors ${
                              isSelected
                                ? `${badge.bg} ${badge.text} border ${badge.border} ${badge.glow}`
                                : 'bg-slate-900 text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            {g}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
              <label className="text-xs font-mono uppercase text-emerald-400 font-bold block mb-2">
                Strengths ({strengths.length})
              </label>
              <div className="space-y-1.5 mb-3 max-h-28 overflow-y-auto">
                {strengths.map((str, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-1.5 rounded bg-slate-900 text-xs text-slate-300 font-mono"
                  >
                    <span className="truncate">• {str}</span>
                    <button
                      type="button"
                      onClick={() => setStrengths(strengths.filter((_, i) => i !== idx))}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newStrength}
                  onChange={(e) => setNewStrength(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddStrength();
                    }
                  }}
                  placeholder="Add strength..."
                  className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono focus:border-emerald-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddStrength}
                  className="px-2.5 py-1.5 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-mono font-bold"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Weaknesses */}
            <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30">
              <label className="text-xs font-mono uppercase text-rose-400 font-bold block mb-2">
                Weaknesses ({weaknesses.length})
              </label>
              <div className="space-y-1.5 mb-3 max-h-28 overflow-y-auto">
                {weaknesses.map((weak, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-1.5 rounded bg-slate-900 text-xs text-slate-300 font-mono"
                  >
                    <span className="truncate">• {weak}</span>
                    <button
                      type="button"
                      onClick={() => setWeaknesses(weaknesses.filter((_, i) => i !== idx))}
                      className="text-rose-400 hover:text-rose-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newWeakness}
                  onChange={(e) => setNewWeakness(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddWeakness();
                    }
                  }}
                  placeholder="Add weakness..."
                  className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono focus:border-rose-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddWeakness}
                  className="px-2.5 py-1.5 rounded bg-rose-950 border border-rose-500 text-rose-300 text-xs font-mono font-bold"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-mono text-xs cursor-pointer transition-colors hover:bg-slate-800"
            >
              CANCEL
            </button>
            <button
              id="btn-save-player-modal"
              type="submit"
              className="px-6 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] text-cyan-300 font-mono text-xs font-bold tracking-wider cursor-pointer transition-colors"
            >
              SAVE ATHLETE PROFILE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// SUB-COMPONENT: Newspaper Create/Edit Modal
// ==========================================
interface NewspaperFormModalProps {
  initialNewspaper: NewspaperEdition | null;
  onClose: () => void;
  onSave: (newspaper: NewspaperEdition) => void;
}

const NewspaperFormModal: React.FC<NewspaperFormModalProps> = ({
  initialNewspaper,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(initialNewspaper?.title || '');
  const [date, setDate] = useState(
    initialNewspaper?.date || new Date().toISOString().split('T')[0]
  );
  const [editionNumber, setEditionNumber] = useState<number>(
    initialNewspaper?.editionNumber || 1
  );

  const [articles, setArticles] = useState<
    Array<{ id: string; heading: string; body: string; category?: string }>
  >(
    initialNewspaper?.articles || [
      {
        id: 'art-1',
        heading: 'Tournament Results & Match Analysis',
        body: 'Provide complete details of latest tactical matches and player performance here.',
        category: 'Match Report',
      },
    ]
  );

  const handleAddArticle = () => {
    setArticles([
      ...articles,
      {
        id: 'art-' + Date.now(),
        heading: 'New Headline Report',
        body: 'Main article body content...',
        category: 'Analysis',
      },
    ]);
  };

  const handleArticleChange = (index: number, field: 'heading' | 'body' | 'category', value: string) => {
    setArticles((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a))
    );
  };

  const handleRemoveArticle = (index: number) => {
    if (articles.length <= 1) return;
    setArticles(articles.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const saved: NewspaperEdition = {
      id: initialNewspaper?.id || 'news-' + Date.now(),
      title: title.trim(),
      date,
      editionNumber,
      volume: editionNumber,
      editionCode: `OEL-${date.substring(0, 7)}-${editionNumber}`,
      articles,
    };

    onSave(saved);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-950 border border-cyan-400 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-[0_0_35px_rgba(6,182,212,0.25)] relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-700 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-display font-bold text-xl text-white tracking-wide">
          {initialNewspaper ? 'EDIT CHRONICLE DISPATCH' : 'PUBLISH CHRONICLE DISPATCH'}
        </h3>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Configure title, release date, edition volume, and article sections
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div>
            <label className="text-xs font-mono uppercase text-cyan-400 font-bold block mb-1">
              Newspaper Edition Title *
            </label>
            <input
              id="input-newspaper-title"
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. GRAND FINALS: TACTICAL MASTERY & SPEED"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-display focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono uppercase text-cyan-400 font-bold block mb-1">
                Release Date *
              </label>
              <input
                id="input-newspaper-date"
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-cyan-400 font-bold block mb-1">
                Edition Volume (Number)
              </label>
              {/* Theme-based stepper control instead of browser slider or raw spinner */}
              <ThemeStepper
                id="stepper-newspaper-edition"
                value={editionNumber}
                onChange={setEditionNumber}
                min={1}
                max={999}
                label="Vol."
              />
            </div>
          </div>

          {/* Articles Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase text-cyan-400 font-bold">
                Articles & Sections ({articles.length})
              </label>
              <button
                type="button"
                onClick={handleAddArticle}
                className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Article</span>
              </button>
            </div>

            <div className="space-y-3">
              {articles.map((art, idx) => (
                <div
                  key={art.id || idx}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="text"
                      value={art.heading}
                      onChange={(e) => handleArticleChange(idx, 'heading', e.target.value)}
                      placeholder="Headline..."
                      className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs font-bold text-white focus:border-cyan-400 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={art.category || ''}
                      onChange={(e) => handleArticleChange(idx, 'category', e.target.value)}
                      placeholder="Category"
                      className="w-28 px-2 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-cyan-300 font-mono focus:border-cyan-400 focus:outline-none"
                    />
                    {articles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveArticle(idx)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={3}
                    value={art.body}
                    onChange={(e) => handleArticleChange(idx, 'body', e.target.value)}
                    placeholder="Article body copy..."
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-300 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-mono text-xs cursor-pointer hover:bg-slate-800 transition-colors"
            >
              CANCEL
            </button>
            <button
              id="btn-save-newspaper-modal"
              type="submit"
              className="px-6 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] text-cyan-300 font-mono text-xs font-bold tracking-wider cursor-pointer transition-colors"
            >
              PUBLISH EDITION
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// SUB-COMPONENT: Confirmation Modal
// ==========================================
interface ConfirmationModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-950 border border-red-500/80 rounded-2xl w-full max-w-md p-6 shadow-[0_0_30px_rgba(239,68,68,0.3)] text-center">
        <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-500 flex items-center justify-center mx-auto text-red-400 mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="font-display font-bold text-lg text-white mb-2">{title}</h3>
        <p className="text-xs font-mono text-slate-300 mb-6 leading-relaxed">{message}</p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-mono text-xs cursor-pointer hover:bg-slate-800 transition-colors"
          >
            CANCEL
          </button>
          <button
            id="btn-modal-confirm-delete"
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl bg-red-950 hover:bg-red-900 border border-red-500 text-red-300 font-mono text-xs font-bold tracking-wider cursor-pointer transition-colors shadow-[0_0_15px_rgba(239,68,68,0.4)]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

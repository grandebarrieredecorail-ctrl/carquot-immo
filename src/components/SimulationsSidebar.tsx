import { useState } from 'react';
import {
  FolderOpen,
  X,
  Trash2,
  Pencil,
  Folder,
  ChevronRight,
  Check,
  Plus,
  FolderInput,
} from 'lucide-react';
import type { SavedSimulation } from '../types';
import { formatEuro, formatPercent } from '../calculations';

interface Props {
  simulations: SavedSimulation[];
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onMoveToFolder: (id: string, folder: string) => void;
  onLoad: (sim: SavedSimulation) => void;
  onClose: () => void;
}

const statusDot = {
  positive: 'bg-emerald-500',
  balanced: 'bg-amber-500',
  negative: 'bg-rose-500',
};

export function SimulationsSidebar({
  simulations,
  onDelete,
  onRename,
  onMoveToFolder,
  onLoad,
  onClose,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [movingFolderId, setMovingFolderId] = useState<string | null>(null);
  const [moveTarget, setMoveTarget] = useState('');

  const folders = [...new Set(simulations.map((s) => s.folder).filter(Boolean))] as string[];
  const unfiled = simulations.filter((s) => !s.folder);

  const startRename = (sim: SavedSimulation) => {
    setEditingId(sim.id);
    setEditName(sim.name);
  };

  const confirmRename = () => {
    if (editingId && editName.trim()) {
      onRename(editingId, editName.trim());
    }
    setEditingId(null);
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      setShowFolderInput(false);
      setNewFolderName('');
    }
  };

  const startMoveFolder = (sim: SavedSimulation) => {
    setMovingFolderId(sim.id);
    setMoveTarget(sim.folder || '');
  };

  const confirmMoveFolder = () => {
    if (movingFolderId) {
      onMoveToFolder(movingFolderId, moveTarget.trim());
    }
    setMovingFolderId(null);
    setMoveTarget('');
  };

  const renderSim = (sim: SavedSimulation) => (
    <div
      key={sim.id}
      className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 transition-all hover:border-teal-300 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-teal-700"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {editingId === sim.id ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && confirmRename()}
              autoFocus
              className="flex-1 rounded border border-teal-300 bg-white px-2 py-1 text-sm text-slate-800 outline-none dark:border-teal-600 dark:bg-slate-700 dark:text-slate-100"
            />
            <button onClick={confirmRename} className="rounded p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700">
              <Check size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 shrink-0 rounded-full ${statusDot[sim.results.cashFlowStatus]}`} />
            <span className="truncate font-medium text-slate-800 dark:text-slate-200">{sim.name}</span>
          </div>
        )}
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {new Date(sim.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
        <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>{formatEuro(sim.results.rentabiliteNette)} net</span>
          <span>{formatPercent(sim.results.tri)} TRI</span>
          {sim.folder && <span className="flex items-center gap-1 text-amber-600 dark:text-amber-500"><Folder size={10} />{sim.folder}</span>}
        </div>
        {movingFolderId === sim.id && (
          <div className="mt-1.5 flex items-center gap-1">
            <select
              value={moveTarget}
              onChange={(e) => setMoveTarget(e.target.value)}
              className="flex-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
            >
              <option value="">— Non classée —</option>
              {folders.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
              {newFolderName.trim() && <option value={newFolderName.trim()}>{newFolderName.trim()} (nouveau)</option>}
            </select>
            <button onClick={confirmMoveFolder} className="rounded p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700">
              <Check size={14} />
            </button>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => onLoad(sim)}
          className="rounded-lg bg-teal-500 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-teal-600"
        >
          Ouvrir
        </button>
        <button
          onClick={() => startRename(sim)}
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          title="Renommer"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => startMoveFolder(sim)}
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          title="Déplacer vers un dossier"
        >
          <FolderInput size={14} />
        </button>
        <button
          onClick={() => onDelete(sim.id)}
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-slate-700"
          title="Supprimer"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-sm flex-col bg-white shadow-2xl dark:bg-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <FolderOpen size={22} className="text-teal-600 dark:text-teal-400" />
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">Simulations</h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-400">
              {simulations.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {simulations.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-400 dark:text-slate-500">Aucune simulation sauvegardée.</p>
              <p className="mt-1 text-xs text-slate-300 dark:text-slate-600">Utilisez le bouton Sauvegarder pour en créer une.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Dossiers */}
              {folders.map((folder) => (
                <div key={folder}>
                  <div className="mb-2 flex items-center gap-2">
                    <Folder size={16} className="text-amber-500" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{folder}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      ({simulations.filter((s) => s.folder === folder).length})
                    </span>
                  </div>
                  <div className="ml-4 flex flex-col gap-2 border-l-2 border-slate-100 pl-3 dark:border-slate-700">
                    {simulations.filter((s) => s.folder === folder).map(renderSim)}
                  </div>
                </div>
              ))}

              {/* Non classées */}
              {unfiled.length > 0 && (
                <div>
                  {folders.length > 0 && (
                    <div className="mb-2 flex items-center gap-2">
                      <ChevronRight size={16} className="text-slate-400" />
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Non classées</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    {unfiled.map(renderSim)}
                  </div>
                </div>
              )}

              {/* Quick folder move actions */}
              {simulations.length > 0 && (
                <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-700">
                  {showFolderInput ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Nom du dossier"
                        autoFocus
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                      />
                      <button onClick={handleCreateFolder} className="rounded-lg bg-teal-500 px-3 py-2 text-xs font-medium text-white hover:bg-teal-600">
                        <Check size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowFolderInput(true)}
                      className="flex items-center gap-1.5 text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      <Plus size={14} />
                      Créer un dossier
                    </button>
                  )}
                  <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">Astuce : utilisez l'icône dossier sur une simulation pour la classer.</p>
                  {folders.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {folders.map((f) => (
                        <span key={f} className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                          <Folder size={12} className="text-amber-500" />
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

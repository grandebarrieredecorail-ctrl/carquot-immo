import { useState } from 'react';
import {
  FolderOpen,
  X,
  Trash2,
  Pencil,
  Folder,
  FolderPlus,
  Check,
  FolderInput,
  GripVertical,
} from 'lucide-react';
import type { SavedSimulation } from '../types';
import { formatEuro, formatPercent } from '../calculations';

interface Props {
  simulations: SavedSimulation[];
  folders: string[];
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (name: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onMoveToFolder: (id: string, folder: string) => void;
  onLoad: (sim: SavedSimulation) => void;
  onClose: () => void;
}

const statusDot: Record<string, string> = {
  positive: 'bg-emerald-500',
  balanced: 'bg-amber-500',
  negative: 'bg-rose-500',
};

export function SimulationsSidebar({
  simulations,
  folders,
  onCreateFolder,
  onDeleteFolder,
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
  const [draggedSimId, setDraggedSimId] = useState<string | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);

  const simFolderMap = new Map<string, SavedSimulation[]>();
  for (const f of folders) simFolderMap.set(f, []);
  for (const s of simulations) {
    const list = simFolderMap.get(s.folder || '') || [];
    list.push(s);
    if (s.folder) {
      if (!simFolderMap.has(s.folder)) simFolderMap.set(s.folder, []);
      simFolderMap.get(s.folder)!.push(s);
    }
  }
  const unfiled = simulations.filter((s) => !s.folder || !folders.includes(s.folder));

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
      onCreateFolder(newFolderName.trim());
      setShowFolderInput(false);
      setNewFolderName('');
    }
  };

  const handleDropOnFolder = (folderName: string) => {
    if (draggedSimId) {
      onMoveToFolder(draggedSimId, folderName);
    }
    setDraggedSimId(null);
    setDragOverFolder(null);
  };

  const handleDropOnUnfiled = () => {
    if (draggedSimId) {
      onMoveToFolder(draggedSimId, '');
    }
    setDraggedSimId(null);
    setDragOverFolder(null);
  };

  const renderSim = (sim: SavedSimulation) => (
    <div
      key={sim.id}
      draggable
      onDragStart={() => setDraggedSimId(sim.id)}
      onDragEnd={() => { setDraggedSimId(null); setDragOverFolder(null); }}
      className={`group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 transition-all hover:border-teal-300 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-teal-700 ${draggedSimId === sim.id ? 'opacity-40' : ''}`}
    >
      <div className="flex min-w-0 flex-1 items-start gap-2">
        <GripVertical size={14} className="mt-0.5 shrink-0 cursor-grab text-slate-300 dark:text-slate-600" />
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
              <span className={`h-2 w-2 shrink-0 rounded-full ${statusDot[sim.results.cashFlowStatus] || 'bg-slate-400'}`} />
              <span className="truncate font-medium text-slate-800 dark:text-slate-200">{sim.name}</span>
            </div>
          )}
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {new Date(sim.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
          <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span>{formatEuro(sim.results.rentabiliteNette)} net</span>
            <span>{formatPercent(sim.results.tri)} TRI</span>
          </div>
        </div>
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
          onClick={() => onDelete(sim.id)}
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-slate-700"
          title="Supprimer"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );

  const renderFolderDropZone = (folderName: string, isUnfiled = false) => {
    const isDragOver = dragOverFolder === (isUnfiled ? '__unfiled__' : folderName);
    return (
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOverFolder(isUnfiled ? '__unfiled__' : folderName); }}
        onDragLeave={() => setDragOverFolder(null)}
        onDrop={() => isUnfiled ? handleDropOnUnfiled() : handleDropOnFolder(folderName)}
        className={`rounded-xl border-2 border-dashed p-2 transition-all ${
          isDragOver
            ? 'border-teal-500 bg-teal-50 dark:border-teal-400 dark:bg-slate-700'
            : 'border-transparent'
        }`}
      >
        <div className="mb-2 flex items-center gap-2">
          {isUnfiled ? (
            <>
              <FolderOpen size={16} className="text-slate-400" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Non classées</span>
            </>
          ) : (
            <>
              <Folder size={16} className="text-amber-500" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{folderName}</span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                ({simFolderMap.get(folderName)?.length || 0})
              </span>
              <button
                onClick={() => onDeleteFolder(folderName)}
                className="ml-auto rounded p-0.5 text-slate-300 transition-colors hover:text-rose-500 dark:text-slate-600"
                title="Supprimer le dossier"
              >
                <Trash2 size={12} />
              </button>
            </>
          )}
        </div>
        <div className="flex flex-col gap-2 pl-1">
          {(isUnfiled ? unfiled : simFolderMap.get(folderName) || []).map(renderSim)}
          {isDragOver && (
            <div className="rounded-lg border-2 border-dashed border-teal-400 bg-teal-50 p-3 text-center text-xs text-teal-600 dark:bg-slate-700 dark:text-teal-400">
              <FolderInput size={16} className="mx-auto mb-1" />
              Déposer ici
            </div>
          )}
        </div>
      </div>
    );
  };

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
          {simulations.length === 0 && folders.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-400 dark:text-slate-500">Aucune simulation sauvegardée.</p>
              <p className="mt-1 text-xs text-slate-300 dark:text-slate-600">Utilisez le bouton Sauvegarder pour en créer une.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Dossiers persistés */}
              {folders.map((folder) => (
                <div key={folder}>
                  {renderFolderDropZone(folder)}
                </div>
              ))}

              {/* Non classées */}
              {unfiled.length > 0 && (
                <div>
                  {folders.length > 0 && renderFolderDropZone('', true)}
                  {folders.length === 0 && (
                    <div className="flex flex-col gap-2">
                      {unfiled.map(renderSim)}
                    </div>
                  )}
                </div>
              )}

              {/* Create folder */}
              <div className="mt-2 border-t border-slate-100 pt-4 dark:border-slate-700">
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
                    <FolderPlus size={14} />
                    Créer un dossier
                  </button>
                )}
                <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
                  Glissez-déposez une simulation vers un dossier pour la classer.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

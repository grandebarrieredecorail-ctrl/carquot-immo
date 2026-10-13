import { useState, useCallback } from 'react';
import type { SavedSimulation, SimulationInput, SimulationResults } from '../types';

const STORAGE_KEY = 'carquot_saved_simulations';
const FOLDERS_KEY = 'carquot_folders';

function loadSimulations(): SavedSimulation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSimulations(sims: SavedSimulation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sims));
  } catch {
    // ignore quota errors
  }
}

function loadFolders(): string[] {
  try {
    const raw = localStorage.getItem(FOLDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveFolders(folders: string[]): void {
  try {
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
  } catch {
    // ignore quota errors
  }
}

export function useSavedSimulations() {
  const [simulations, setSimulations] = useState<SavedSimulation[]>(loadSimulations);
  const [folders, setFolders] = useState<string[]>(loadFolders);

  const createFolder = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setFolders((prev) => {
      if (prev.includes(trimmed)) return prev;
      const next = [...prev, trimmed];
      saveFolders(next);
      return next;
    });
  }, []);

  const deleteFolder = useCallback((name: string) => {
    setFolders((prev) => {
      const next = prev.filter((f) => f !== name);
      saveFolders(next);
      return next;
    });
    setSimulations((prev) => {
      const next = prev.map((s) => (s.folder === name ? { ...s, folder: undefined } : s));
      saveSimulations(next);
      return next;
    });
  }, []);

  const saveSimulation = useCallback(
    (name: string, input: SimulationInput, results: SimulationResults, folder?: string) => {
      const sim: SavedSimulation = {
        id: crypto.randomUUID(),
        name: name || `Simulation ${new Date().toLocaleDateString('fr-FR')}`,
        date: new Date().toISOString(),
        input,
        results,
        folder,
      };
      setSimulations((prev) => {
        const next = [...prev, sim];
        saveSimulations(next);
        return next;
      });
    },
    []
  );

  const deleteSimulation = useCallback((id: string) => {
    setSimulations((prev) => {
      const next = prev.filter((s) => s.id !== id);
      saveSimulations(next);
      return next;
    });
  }, []);

  const renameSimulation = useCallback((id: string, name: string) => {
    setSimulations((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, name } : s));
      saveSimulations(next);
      return next;
    });
  }, []);

  const moveSimulationToFolder = useCallback((id: string, folder: string) => {
    setSimulations((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, folder: folder || undefined } : s));
      saveSimulations(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSimulations([]);
    saveSimulations([]);
    setFolders([]);
    saveFolders([]);
  }, []);

  return { simulations, folders, createFolder, deleteFolder, saveSimulation, deleteSimulation, renameSimulation, moveSimulationToFolder, clearAll };
}

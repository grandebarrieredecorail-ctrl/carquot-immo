import { Link2, ExternalLink } from 'lucide-react';
import type { SimulationInput } from '../types';

interface Props {
  input: SimulationInput;
  onChange: (patch: Partial<SimulationInput>) => void;
}

export function AnnonceImport({ input, onChange }: Props) {
  const url = input.lienAnnonce ?? '';
  const isHttp = url.trim().startsWith('http');

  return (
    <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-5 print:hidden dark:border-teal-800 dark:from-slate-800 dark:to-slate-800">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
          <Link2 size={18} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Lien de l'annonce</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">Répertoriez l'URL de référence de cette simulation</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Link2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={url}
            onChange={(e) => onChange({ lienAnnonce: e.target.value })}
            placeholder="https://www.leboncoin.fr/... ou https://www.seloger.com/..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
        {isHttp && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-teal-700"
          >
            <ExternalLink size={16} />
            Ouvrir
          </a>
        )}
      </div>
    </div>
  );
}

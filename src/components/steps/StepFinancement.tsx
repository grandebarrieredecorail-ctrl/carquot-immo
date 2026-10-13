import { Landmark, RefreshCw } from 'lucide-react';
import type { SimulationInput } from '../../types';
import { NumberField, SectionCard } from '../ui/FormField';
import { formatEuro } from '../../calculations';
import { getTauxSuggere } from '../../constants';

interface Props {
  input: SimulationInput;
  onChange: (patch: Partial<SimulationInput>) => void;
  montantEmprunte: number;
}

export function StepFinancement({ input, onChange, montantEmprunte }: Props) {
  const tauxSuggere = getTauxSuggere(input.dureeCredit);

  return (
    <SectionCard title="Financement bancaire" icon={<Landmark size={20} />}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField
          label="Apport personnel"
          value={input.apport}
          onChange={(v) => onChange({ apport: v })}
          suffix="€"
          step={1000}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Montant emprunté (auto)</label>
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200">
            {formatEuro(montantEmprunte)}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Calculé automatiquement</p>
        </div>
        <NumberField
          label="Durée du crédit"
          value={input.dureeCredit}
          onChange={(v) => onChange({ dureeCredit: Math.round(v) })}
          suffix="ans"
          step={1}
          min={1}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Taux d'intérêt annuel</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                value={Number.isNaN(input.tauxInteret) ? '' : input.tauxInteret}
                onChange={(e) => onChange({ tauxInteret: parseFloat(e.target.value) || 0 })}
                step={0.05}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-10 text-sm text-slate-900 outline-none transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm dark:text-slate-500">%</span>
            </div>
            <button
              type="button"
              onClick={() => onChange({ tauxInteret: tauxSuggere })}
              title={`Taux marché ${input.dureeCredit} ans : ${tauxSuggere}%`}
              className="flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2.5 text-xs font-medium text-teal-600 transition-all hover:bg-teal-100 whitespace-nowrap dark:border-teal-700 dark:bg-slate-700 dark:text-teal-400"
            >
              <RefreshCw size={14} />
              {tauxSuggere}%
            </button>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Taux marché {input.dureeCredit} ans : ~{tauxSuggere}%</p>
        </div>
        <NumberField
          label="Taux d'assurance emprunteur"
          value={input.tauxAssurance}
          onChange={(v) => onChange({ tauxAssurance: v })}
          suffix="%"
          step={0.05}
        />
      </div>
    </SectionCard>
  );
}

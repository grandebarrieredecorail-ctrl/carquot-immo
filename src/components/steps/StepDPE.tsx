import { Gauge, TrendingUp } from 'lucide-react';
import type { SimulationInput, DPELabel } from '../../types';
import { NumberField, SectionCard } from '../ui/FormField';
import { dpeLabels, dpeColors, dpeImpact } from '../../constants';
import { formatEuro } from '../../calculations';

interface Props {
  input: SimulationInput;
  onChange: (patch: Partial<SimulationInput>) => void;
  gainValorisation: number;
  valeurRevalorisee: number;
}

export function StepDPE({ input, onChange, gainValorisation, valeurRevalorisee }: Props) {
  const decoteActuelle = input.prixAchat * dpeImpact[input.dpeActuel];
  const surcoteCible = input.prixAchat * dpeImpact[input.dpeCible];

  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="Diagnostic DPE & valorisation verte" icon={<Gauge size={20} />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">DPE actuel du bien</label>
            <div className="flex gap-1.5">
              {dpeLabels.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => onChange({ dpeActuel: label as DPELabel })}
                  className={`flex h-11 w-11 items-center justify-center rounded-lg text-sm font-bold transition-all ${dpeColors[label]} ${
                    input.dpeActuel === label ? 'ring-2 ring-slate-800 ring-offset-2 dark:ring-slate-200 dark:ring-offset-slate-800' : 'opacity-60 hover:opacity-100'
                  } text-white`}
                >
                  {label}
                </button>
              ))}
            </div>
            {decoteActuelle !== 0 && (
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Impact estimé : {decoteActuelle > 0 ? '+' : ''}{formatEuro(decoteActuelle)} sur la valeur
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">DPE cible après travaux</label>
            <div className="flex gap-1.5">
              {dpeLabels.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => onChange({ dpeCible: label as DPELabel })}
                  className={`flex h-11 w-11 items-center justify-center rounded-lg text-sm font-bold transition-all ${dpeColors[label]} ${
                    input.dpeCible === label ? 'ring-2 ring-slate-800 ring-offset-2 dark:ring-slate-200 dark:ring-offset-slate-800' : 'opacity-60 hover:opacity-100'
                  } text-white`}
                >
                  {label}
                </button>
              ))}
            </div>
            {surcoteCible !== 0 && (
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Impact estimé : {surcoteCible > 0 ? '+' : ''}{formatEuro(surcoteCible)} sur la valeur
              </p>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Valorisation verte" icon={<TrendingUp size={20} />}>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-700">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Prix d'achat initial</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">{formatEuro(input.prixAchat)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Impact DPE actuel ({input.dpeActuel})</span>
              <span className={`font-medium ${decoteActuelle < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {decoteActuelle > 0 ? '+' : ''}{formatEuro(decoteActuelle)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Impact DPE cible ({input.dpeCible})</span>
              <span className={`font-medium ${surcoteCible < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {surcoteCible > 0 ? '+' : ''}{formatEuro(surcoteCible)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Montant des travaux</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">{formatEuro(input.montantTravaux)}</span>
            </div>
            <div className="my-1 border-t border-slate-200 dark:border-slate-600" />
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-600 dark:text-slate-300">Gain de valorisation verte</span>
              <span className={`font-bold ${gainValorisation >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {gainValorisation > 0 ? '+' : ''}{formatEuro(gainValorisation)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-600 dark:text-slate-300">Valeur revalorisée après travaux</span>
              <span className="font-bold text-teal-700 dark:text-teal-400">{formatEuro(valeurRevalorisee)}</span>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

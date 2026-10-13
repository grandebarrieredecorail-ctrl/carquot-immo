import { Clock, TrendingUp, Calendar } from 'lucide-react';
import type { SimulationInput } from '../../types';
import { NumberField, SectionCard } from '../ui/FormField';

interface Props {
  input: SimulationInput;
  onChange: (patch: Partial<SimulationInput>) => void;
}

export function StepRevente({ input, onChange }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="Paramètres de projection" icon={<TrendingUp size={20} />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField
            label="Croissance annuelle de la valeur"
            value={input.croissanceAnnuelle}
            onChange={(v) => onChange({ croissanceAnnuelle: v })}
            suffix="%/an"
            step={0.5}
            hint="Appréciation ou dépréciation du bien par an"
          />
          <NumberField
            label="Croissance annuelle des loyers"
            value={input.croissanceLoyer}
            onChange={(v) => onChange({ croissanceLoyer: v })}
            suffix="%/an"
            step={0.5}
            hint="Indexation annuelle des loyers"
          />
        </div>
      </SectionCard>

      <SectionCard title="Horizon de détention" icon={<Clock size={20} />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField
            label="Durée de détention avant revente"
            value={input.dureeDetention}
            onChange={(v) => onChange({ dureeDetention: Math.round(v) })}
            suffix="ans"
            step={1}
            min={1}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[5, 10, 15, 20, 30].map((duree) => (
            <button
              key={duree}
              type="button"
              onClick={() => onChange({ dureeDetention: duree })}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                input.dureeDetention === duree
                  ? 'border-teal-500 bg-teal-50 text-teal-700 dark:border-teal-400 dark:bg-slate-700 dark:text-teal-300'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              <Calendar size={14} />
              {duree} ans
            </button>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

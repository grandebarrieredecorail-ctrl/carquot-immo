import { Clock, TrendingUp, Calendar } from 'lucide-react';
import type { SimulationInput } from '../../types';
import { NumberField, SectionCard } from '../ui/FormField';
import { InfoTooltip } from '../ui/InfoTooltip';
import { infoLinks } from '../../constants';

interface Props {
  input: SimulationInput;
  onChange: (patch: Partial<SimulationInput>) => void;
}

export function StepRevente({ input, onChange }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="Paramètres de projection" icon={<TrendingUp size={20} />} badge={<InfoTooltip url={infoLinks.croissanceBien} label="Indice des prix immobilier — INSEE" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Croissance annuelle de la valeur</label>
              <InfoTooltip url={infoLinks.croissanceBien} label="Indice des prix immobilier — INSEE" />
            </div>
            <NumberField
              label=""
              value={input.croissanceAnnuelle}
              onChange={(v) => onChange({ croissanceAnnuelle: v })}
              suffix="%/an"
              step={0.5}
              hint="Appréciation ou dépréciation du bien par an"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Croissance annuelle des loyers</label>
              <InfoTooltip url={infoLinks.irl} label="Indice de Référence des Loyers (IRL) — INSEE" />
            </div>
            <NumberField
              label=""
              value={input.croissanceLoyer}
              onChange={(v) => onChange({ croissanceLoyer: v })}
              suffix="%/an"
              step={0.5}
              hint="Indexation annuelle des loyers (IRL)"
            />
          </div>
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

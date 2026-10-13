import { Scale, FileText } from 'lucide-react';
import type { SimulationInput, StructureJuridique, TypeLocation, RegimeFiscal } from '../../types';
import { SegmentedControl, SectionCard } from '../ui/FormField';
import { structureOptions, typeLocationOptions, regimeFiscalOptions, tmiOptions, infoLinks } from '../../constants';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  input: SimulationInput;
  onChange: (patch: Partial<SimulationInput>) => void;
}

export function StepJuridique({ input, onChange }: Props) {
  const regimes = regimeFiscalOptions[input.typeLocation];

  const handleTypeLocationChange = (v: TypeLocation) => {
    const newRegimes = regimeFiscalOptions[v];
    const firstRegime = newRegimes[0].value as RegimeFiscal;
    onChange({ typeLocation: v, regimeFiscal: firstRegime });
  };

  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="Structure juridique" icon={<Scale size={20} />}>
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">En savoir plus sur les structures</span>
          <InfoTooltip url={infoLinks.sciIr} label="SCI - service-public.fr" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {structureOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ structureJuridique: opt.value as StructureJuridique })}
              className={`flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all ${
                input.structureJuridique === opt.value
                  ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500/20 dark:border-teal-400 dark:bg-slate-700'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-slate-500'
              }`}
            >
              <span className={`text-sm font-semibold ${input.structureJuridique === opt.value ? 'text-teal-700 dark:text-teal-300' : 'text-slate-700 dark:text-slate-200'}`}>
                {opt.label}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">{opt.description}</span>
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Régime fiscal" icon={<FileText size={20} />}>
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">En savoir plus sur la fiscalité locative</span>
          <InfoTooltip url={infoLinks.lmnp} label="LMNP - impots.gouv.fr" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SegmentedControl
            label="Type de location"
            value={input.typeLocation}
            onChange={(v) => handleTypeLocationChange(v)}
            options={typeLocationOptions}
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3">
          {regimes.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ regimeFiscal: opt.value as RegimeFiscal })}
              className={`flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all ${
                input.regimeFiscal === opt.value
                  ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500/20 dark:border-teal-400 dark:bg-slate-700'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-slate-500'
              }`}
            >
              <span className={`text-sm font-semibold ${input.regimeFiscal === opt.value ? 'text-teal-700 dark:text-teal-300' : 'text-slate-700 dark:text-slate-200'}`}>
                {opt.label}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">{opt.description}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">TMI (Tranche Marginale d'Imposition)</label>
              <InfoTooltip url={infoLinks.tmi} label="TMI - impots.gouv.fr" />
            </div>
            <select
              value={String(input.tmi)}
              onChange={(e) => onChange({ tmi: parseFloat(e.target.value) })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              {tmiOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <p className="text-xs text-slate-400 dark:text-slate-500">Votre tranche d'imposition la plus élevée</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

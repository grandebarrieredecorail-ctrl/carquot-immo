import { Users, Home, Euro } from 'lucide-react';
import type { SimulationInput, MaPrimeRenovColor } from '../../types';
import { NumberField, SegmentedControl, Toggle, SectionCard } from '../ui/FormField';
import { profilColors, infoLinks } from '../../constants';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  input: SimulationInput;
  onChange: (patch: Partial<SimulationInput>) => void;
  profilAide: MaPrimeRenovColor;
}

export function StepProfil({ input, onChange, profilAide }: Props) {
  const colors = profilColors[profilAide];

  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="Profil investisseur" icon={<Users size={20} />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <NumberField
            label="Revenu Fiscal de Référence (RFR)"
            value={input.revenuFiscalReference}
            onChange={(v) => onChange({ revenuFiscalReference: v })}
            suffix="€"
            step={500}
          />
          <NumberField
            label="Personnes au foyer"
            value={input.nombrePersonnes}
            onChange={(v) => onChange({ nombrePersonnes: Math.round(v) })}
            min={1}
          />
          <SegmentedControl
            label="Région"
            value={input.region}
            onChange={(v) => onChange({ region: v })}
            options={[
              { value: 'idf', label: 'Île-de-France' },
              { value: 'province', label: 'Province' },
            ]}
          />
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-600 dark:bg-slate-700">
          <Euro size={18} className="text-slate-400 dark:text-slate-500" />
          <span className="text-sm text-slate-500 dark:text-slate-400">Profil MaPrimeRénov' détecté :</span>
          <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${colors.bg} ${colors.text} ${colors.border}`}>
            {colors.label}
          </span>
        </div>
      </SectionCard>

      <SectionCard title="Subventions & aides" icon={<Home size={20} />}>
        <div className="mb-3 flex items-center gap-2">
          <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300">Aides financières</h4>
          <InfoTooltip url={infoLinks.maPrimeRenov} label="MaPrimeRénov' - france-renov.gouv.fr" />
        </div>
        <div className="flex flex-col gap-4">
          <Toggle
            label="Simuler les subventions MaPrimeRénov'"
            description="Calcule automatiquement l'aide selon votre profil"
            checked={input.simulerSubventions}
            onChange={(v) => onChange({ simulerSubventions: v })}
          />
          {input.simulerSubventions && (
            <SegmentedControl
              label="Type de rénovation"
              value={input.typeRenovation}
              onChange={(v) => onChange({ typeRenovation: v })}
              options={[
                { value: 'globale', label: 'Rénovation globale' },
                { value: 'geste', label: 'Par geste' },
              ]}
            />
          )}
          <div className="flex items-center gap-2">
            <Toggle
              label="Éco-PTZ (prêt à taux zéro)"
              description="Prêt sans intérêt pour financer des travaux de rénovation"
              checked={input.simulerEcoPTZ}
              onChange={(v) => onChange({ simulerEcoPTZ: v })}
            />
            <InfoTooltip url={infoLinks.ecoPTZ} label="Éco-PTZ - france-renov.gouv.fr" />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

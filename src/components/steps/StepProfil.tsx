import { Users, Home, Euro, Gauge } from 'lucide-react';
import type { SimulationInput, MaPrimeRenovColor } from '../../types';
import { NumberField, SegmentedControl, Toggle, SectionCard } from '../ui/FormField';
import { profilColors, infoLinks } from '../../constants';
import { InfoTooltip } from '../ui/InfoTooltip';
import { formatEuro } from '../../calculations';

interface Props {
  input: SimulationInput;
  onChange: (patch: Partial<SimulationInput>) => void;
  profilAide: MaPrimeRenovColor;
}

export function StepProfil({ input, onChange, profilAide }: Props) {
  const colors = profilColors[profilAide];

  const revenusPondérés = input.revenusMensuels + input.loyersPercusMensuels * 0.7;
  const totalChargesMensuel = input.creditsEnCours;
  const tauxEndettement = revenusPondérés > 0
    ? (totalChargesMensuel / revenusPondérés) * 100
    : 0;

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

      <SectionCard
        title="Taux d'endettement actuel"
        icon={<Gauge size={20} />}
        badge={
          <span className={`rounded-full px-3 py-1 text-sm font-bold ${
            tauxEndettement > 35
              ? 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300'
              : tauxEndettement > 30
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
          }`}>
            {tauxEndettement.toFixed(1)}%
          </span>
        }
      >
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Renseignez vos revenus et charges actuels pour calculer votre taux d'endettement avant cet investissement.
          Les banques recommandent généralement de ne pas dépasser 35%.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <NumberField
            label="Revenus mensuels nets"
            value={input.revenusMensuels}
            onChange={(v) => onChange({ revenusMensuels: v })}
            suffix="€"
            step={100}
            hint="Salaires, revenus non salariés..."
          />
          <NumberField
            label="Crédits en cours (mensuel)"
            value={input.creditsEnCours}
            onChange={(v) => onChange({ creditsEnCours: v })}
            suffix="€"
            step={50}
            hint="Tous crédits confondus"
          />
          <NumberField
            label="Loyers perçus (mensuel)"
            value={input.loyersPercusMensuels}
            onChange={(v) => onChange({ loyersPercusMensuels: v })}
            suffix="€"
            step={50}
            hint="Autres biens locatifs"
          />
        </div>

        {input.revenusMensuels > 0 && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-700">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Revenus mensuels</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">{formatEuro(input.revenusMensuels)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Charges mensuelles (crédits)</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">{formatEuro(totalChargesMensuel)}</span>
              </div>
              <div className="my-1 border-t border-slate-200 dark:border-slate-600" />
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-600 dark:text-slate-300">Taux d'endettement actuel</span>
                <span className={`font-bold ${
                  tauxEndettement > 35
                    ? 'text-rose-600 dark:text-rose-400'
                    : tauxEndettement > 30
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {tauxEndettement.toFixed(1)}%
                </span>
              </div>
              {tauxEndettement > 35 && (
                <p className="text-xs text-rose-500 dark:text-rose-400">
                  Au-delà du seuil de 35% recommandé par les banques. L'ajout d'un nouveau crédit pourrait être refusé.
                </p>
              )}
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

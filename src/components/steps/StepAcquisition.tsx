import { Building2, Hammer, Search, FileSearch } from 'lucide-react';
import type { SimulationInput } from '../../types';
import { NumberField, SegmentedControl, SectionCard, Toggle } from '../ui/FormField';
import { formatEuro } from '../../calculations';
import { InfoTooltip } from '../ui/InfoTooltip';
import { infoLinks } from '../../constants';

interface Props {
  input: SimulationInput;
  onChange: (patch: Partial<SimulationInput>) => void;
  fraisAgenceCalcule: number;
}

export function StepAcquisition({ input, onChange, fraisAgenceCalcule }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="Acquisition & frais" icon={<Building2 size={20} />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField
            label="Prix d'achat du bien"
            value={input.prixAchat}
            onChange={(v) => onChange({ prixAchat: v })}
            suffix="€"
            step={1000}
          />
          <SegmentedControl
            label="État du bien"
            value={input.etatBien}
            onChange={(v) => onChange({ etatBien: v, tauxNotaire: v === 'neuf' ? 2.5 : 7.5 })}
            options={[
              { value: 'ancien', label: 'Ancien' },
              { value: 'neuf', label: 'Neuf' },
            ]}
          />
          <NumberField
            label="Taux des frais de notaire"
            value={input.tauxNotaire}
            onChange={(v) => onChange({ tauxNotaire: v })}
            suffix="%"
            step={0.1}
            hint="Ancien ≈ 7,5 % · Neuf ≈ 2,5 %"
          />
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-700">
          <SegmentedControl
            label="Frais d'agence / d'annonce"
            value={input.fraisAgenceMode}
            onChange={(v) => onChange({ fraisAgenceMode: v })}
            options={[
              { value: 'fixed', label: 'Montant fixe (€)' },
              { value: 'percentage', label: 'Pourcentage (%)' },
            ]}
          />
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {input.fraisAgenceMode === 'fixed' ? (
              <NumberField
                label="Frais d'agence (montant)"
                value={input.fraisAgence}
                onChange={(v) => onChange({ fraisAgence: v })}
                suffix="€"
                step={100}
              />
            ) : (
              <NumberField
                label="Frais d'agence (pourcentage du prix)"
                value={input.fraisAgencePourcentage}
                onChange={(v) => onChange({ fraisAgencePourcentage: v })}
                suffix="%"
                step={0.5}
                hint="Typiquement 4 à 7 % du prix net vendeur"
              />
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Montant calculé</label>
              <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200">
                {formatEuro(fraisAgenceCalcule)}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <NumberField
            label="Frais de dossier / garantie bancaire"
            value={input.fraisDossier}
            onChange={(v) => onChange({ fraisDossier: v })}
            suffix="€"
            step={100}
          />
        </div>
      </SectionCard>

      <SectionCard title="Chasseur de biens" icon={<Search size={20} />}>
        <Toggle
          label="Utiliser un chasseur immobilier"
          description="Intégrer les honoraires du chasseur dans le coût du projet"
          checked={input.chasseurActif}
          onChange={(v) => onChange({ chasseurActif: v })}
        />
        {input.chasseurActif && (
          <div className="mt-4">
            <SegmentedControl
              label="Mode de calcul des honoraires"
              value={input.chasseurMode}
              onChange={(v) => onChange({ chasseurMode: v })}
              options={[
                { value: 'percentage', label: 'Pourcentage du prix' },
                { value: 'fixed', label: 'Montant forfaitaire' },
              ]}
            />
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {input.chasseurMode === 'percentage' ? (
                <NumberField
                  label="Honoraires chasseur (%)"
                  value={input.chasseurPourcentage}
                  onChange={(v) => onChange({ chasseurPourcentage: v })}
                  suffix="%"
                  step={0.5}
                  hint="Typiquement 2 à 5 % du prix d'achat"
                />
              ) : (
                <NumberField
                  label="Honoraires chasseur (forfait)"
                  value={input.chasseurForfait}
                  onChange={(v) => onChange({ chasseurForfait: v })}
                  suffix="€"
                  step={500}
                />
              )}
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Travaux de rénovation" icon={<Hammer size={20} />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField
            label="Travaux de rénovation globaux / esthétiques"
            value={input.montantTravaux}
            onChange={(v) => onChange({ montantTravaux: v })}
            suffix="€"
            step={500}
            hint="Cuisine, salle de bain, décoration..."
          />
          <NumberField
            label="Travaux de rénovation énergétique"
            value={input.travauxEnergetiques}
            onChange={(v) => onChange({ travauxEnergetiques: v })}
            suffix="€"
            step={500}
            hint="Éligibles MaPrimeRénov' & Éco-PTZ"
          />
        </div>
      </SectionCard>

      <SectionCard title="Audit énergétique & Maître d'Œuvre" icon={<FileSearch size={20} />}>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Audit énergétique</label>
            <InfoTooltip url={infoLinks.dpe} label="Diagnostic de performance énergétique" />
          </div>
          <NumberField
            label=""
            value={input.auditEnergetique}
            onChange={(v) => onChange({ auditEnergetique: v })}
            suffix="€"
            step={100}
            hint="Bureau d'études — estimé 800 à 1500 €"
          />
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-700">
          <SegmentedControl
            label="Mode de calcul MOE"
            value={input.moeMode}
            onChange={(v) => onChange({ moeMode: v })}
            options={[
              { value: 'percentage', label: 'Pourcentage des travaux' },
              { value: 'flat', label: 'Montant forfaitaire' },
            ]}
          />
          {input.moeMode === 'percentage' ? (
            <div className="mt-4">
              <NumberField
                label="Pourcentage MOE"
                value={input.moePourcentage}
                onChange={(v) => onChange({ moePourcentage: v })}
                suffix="%"
                step={1}
                hint="10 % par défaut"
              />
            </div>
          ) : (
            <div className="mt-4">
              <NumberField
                label="Montant forfaitaire MOE"
                value={input.moeForfait}
                onChange={(v) => onChange({ moeForfait: v })}
                suffix="€"
                step={100}
              />
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

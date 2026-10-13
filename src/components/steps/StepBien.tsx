import {
  Building2,
  Landmark,
  Hammer,
  Search,
  Gauge,
  TrendingUp,
  RefreshCw,
  Home,
  Percent,
} from 'lucide-react';
import type { SimulationInput, DPELabel, TypeBien } from '../../types';
import { NumberField, SegmentedControl, SectionCard, Toggle } from '../ui/FormField';
import { formatEuro } from '../../calculations';
import { dpeLabels, dpeColors, dpeImpact, getTauxSuggere, infoLinks } from '../../constants';
import { InfoTooltip } from '../ui/InfoTooltip';

interface Props {
  input: SimulationInput;
  onChange: (patch: Partial<SimulationInput>) => void;
  fraisAgenceCalcule: number;
  montantEmprunte: number;
  gainValorisation: number;
  valeurRevalorisee: number;
}

export function StepBien({
  input,
  onChange,
  fraisAgenceCalcule,
  montantEmprunte,
  gainValorisation,
  valeurRevalorisee,
}: Props) {
  const tauxSuggere = getTauxSuggere(input.dureeCredit);
  const decoteActuelle = input.prixAchat * dpeImpact[input.dpeActuel];
  const surcoteCible = input.prixAchat * dpeImpact[input.dpeCible];
  const prixAchatNegocie = input.prixAchat * (1 - input.negociationPct / 100);

  return (
    <div className="flex flex-col gap-5">
      {/* --- Caractéristiques du bien --- */}
      <SectionCard title="Caractéristiques du bien" icon={<Home size={20} />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SegmentedControl
            label="Type de bien"
            value={input.typeBien}
            onChange={(v) => onChange({ typeBien: v as TypeBien })}
            options={[
              { value: 'appartement', label: 'Appartement' },
              { value: 'maison', label: 'Maison' },
            ]}
          />
          <NumberField
            label="Surface"
            value={input.surface}
            onChange={(v) => onChange({ surface: v })}
            suffix="m²"
            step={1}
            min={1}
          />
          <NumberField
            label="Nombre de chambres"
            value={input.nombreChambres}
            onChange={(v) => onChange({ nombreChambres: Math.round(v) })}
            min={0}
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField
            label="Prix d'achat (prix affiché)"
            value={input.prixAchat}
            onChange={(v) => onChange({ prixAchat: v })}
            suffix="€"
            step={1000}
          />
          <NumberField
            label="Négociation espérée"
            value={input.negociationPct}
            onChange={(v) => onChange({ negociationPct: v })}
            suffix="%"
            step={0.5}
            hint="Pourcentage de remise sur le prix affiché"
          />
        </div>

        {input.negociationPct > 0 && (
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-teal-200 bg-teal-50/50 px-4 py-3 dark:border-teal-800 dark:bg-slate-700/50">
            <Percent size={18} className="text-teal-600 dark:text-teal-400" />
            <span className="text-sm text-slate-600 dark:text-slate-300">
              Prix après négociation : <strong className="text-teal-700 dark:text-teal-300">{formatEuro(prixAchatNegocie)}</strong>
            </span>
          </div>
        )}

        <div className="mt-4">
          <SegmentedControl
            label="État du bien"
            value={input.etatBien}
            onChange={(v) => onChange({ etatBien: v, tauxNotaire: v === 'neuf' ? 2.5 : 7.5 })}
            options={[
              { value: 'ancien', label: 'Ancien' },
              { value: 'neuf', label: 'Neuf' },
            ]}
          />
        </div>

        <div className="mt-4 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">DPE actuel du bien</label>
            <InfoTooltip url={infoLinks.dpe} label="DPE — ecologie.gouv.fr" />
          </div>
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

        <div className="mt-4 flex flex-col gap-1.5">
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
      </SectionCard>

      {/* --- Frais d'acquisition --- */}
      <SectionCard title="Frais d'acquisition" icon={<Building2 size={20} />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Taux des frais de notaire</label>
              <InfoTooltip url={infoLinks.tauxNotaire} label="Frais de notaire — notaires.fr" />
            </div>
            <NumberField
              label=""
              value={input.tauxNotaire}
              onChange={(v) => onChange({ tauxNotaire: v })}
              suffix="%"
              step={0.1}
              hint="Ancien ≈ 7,5 % · Neuf ≈ 2,5 %"
            />
          </div>
          <NumberField
            label="Frais de dossier / garantie bancaire"
            value={input.fraisDossier}
            onChange={(v) => onChange({ fraisDossier: v })}
            suffix="€"
            step={100}
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

        <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-700">
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
        </div>
      </SectionCard>

      {/* --- Travaux --- */}
      <SectionCard title="Travaux & rénovation" icon={<Hammer size={20} />}>
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

        <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-700">
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

          <div className="mt-4">
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
                <NumberField label="Pourcentage MOE" value={input.moePourcentage} onChange={(v) => onChange({ moePourcentage: v })} suffix="%" step={1} hint="10 % par défaut" />
              </div>
            ) : (
              <div className="mt-4">
                <NumberField label="Montant forfaitaire MOE" value={input.moeForfait} onChange={(v) => onChange({ moeForfait: v })} suffix="€" step={100} />
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      {/* --- Financement --- */}
      <SectionCard title="Financement bancaire" icon={<Landmark size={20} />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField label="Apport personnel" value={input.apport} onChange={(v) => onChange({ apport: v })} suffix="€" step={1000} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Montant emprunté (auto)</label>
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200">
              {formatEuro(montantEmprunte)}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">Calculé automatiquement</p>
          </div>
          <NumberField label="Durée du crédit" value={input.dureeCredit} onChange={(v) => onChange({ dureeCredit: Math.round(v) })} suffix="ans" step={1} min={1} />
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
          <NumberField label="Taux d'assurance emprunteur" value={input.tauxAssurance} onChange={(v) => onChange({ tauxAssurance: v })} suffix="%" step={0.05} />
        </div>
      </SectionCard>

      {/* --- Valorisation verte --- */}
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

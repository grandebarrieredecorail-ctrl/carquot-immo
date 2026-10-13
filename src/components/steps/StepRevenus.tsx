import { Wallet, Lightbulb, Sparkles, MapPin } from 'lucide-react';
import type { SimulationInput } from '../../types';
import { NumberField, SegmentedControl, SectionCard, SelectField } from '../ui/FormField';
import { villeOptions, getQuartiers, regionFranceOptions } from '../../constants';
import { formatEuro } from '../../calculations';

interface Props {
  input: SimulationInput;
  onChange: (patch: Partial<SimulationInput>) => void;
  loyerMinSuggere: number;
  loyerMaxSuggere: number;
  loyerEstimeQuartier: number;
  loyerM2Quartier: number;
}

export function StepRevenus({
  input,
  onChange,
  loyerMinSuggere,
  loyerMaxSuggere,
  loyerEstimeQuartier,
  loyerM2Quartier,
}: Props) {
  const quartiers = getQuartiers(input.ville);
  const quartierOptions = quartiers.map((q) => ({ value: q.nom, label: q.nom }));
  const hasSuggestion = loyerMinSuggere > 0 && loyerMaxSuggere > 0;

  const handleVilleChange = (ville: string) => {
    const quarts = getQuartiers(ville);
    const firstQuartier = quarts[0]?.nom ?? '';
    onChange({ ville, quartier: firstQuartier, loyerM2Personnalise: 0 });
  };

  return (
    <SectionCard title="Revenus & charges locatives" icon={<Wallet size={20} />}>
      <div className="mb-5 rounded-xl border border-teal-200 bg-teal-50/50 p-4 dark:border-teal-800 dark:bg-slate-700/50">
        <div className="mb-3 flex items-center gap-2">
          <MapPin size={18} className="text-teal-600 dark:text-teal-400" />
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Géolocalisation du bien</h4>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SelectField
            label="Ville"
            value={input.ville}
            onChange={(v) => handleVilleChange(v)}
            options={villeOptions}
          />
          {quartierOptions.length > 0 ? (
            <SelectField
              label="Quartier"
              value={input.quartier}
              onChange={(v) => onChange({ quartier: v, loyerM2Personnalise: 0 })}
              options={quartierOptions}
            />
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Quartier</label>
              <input
                type="text"
                value={input.quartier}
                onChange={(e) => onChange({ quartier: e.target.value })}
                placeholder="Saisir un quartier"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          )}
          <NumberField
            label="Surface du bien"
            value={input.surface}
            onChange={(v) => onChange({ surface: v })}
            suffix="m²"
            step={1}
            min={1}
          />
        </div>

        {loyerM2Quartier > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg bg-white border border-teal-100 px-4 py-3 dark:bg-slate-800 dark:border-teal-800">
            <Sparkles size={16} className="text-teal-500 dark:text-teal-400" />
            <span className="text-sm text-slate-600 dark:text-slate-300">
              Loyer estimé {input.quartier}, {input.ville} ({loyerM2Quartier.toFixed(0)} €/m² pour un bien {input.typeLocation === 'meublee' ? 'meublé' : 'nu'}) :
            </span>
            <span className="rounded-lg bg-teal-100 px-3 py-1 text-sm font-semibold text-teal-700 dark:bg-teal-900 dark:text-teal-300">
              {formatEuro(loyerEstimeQuartier)}/mois
            </span>
            <button
              type="button"
              onClick={() => onChange({ loyerMensuel: loyerEstimeQuartier })}
              className="rounded-lg border border-teal-300 bg-white px-3 py-1 text-xs font-medium text-teal-600 transition-all hover:bg-teal-50 dark:border-teal-700 dark:bg-slate-800 dark:text-teal-400 dark:hover:bg-slate-700"
            >
              Utiliser
            </button>
          </div>
        )}

        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField
            label="Loyer au m² personnalisé (0 = suggestion auto)"
            value={input.loyerM2Personnalise}
            onChange={(v) => onChange({ loyerM2Personnalise: v })}
            suffix="€/m²"
            step={0.5}
            min={0}
            hint="Saisissez votre propre estimation pour ce quartier"
          />
        </div>

        {hasSuggestion && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 border border-slate-100 px-4 py-2 dark:bg-slate-800 dark:border-slate-700">
            <Lightbulb size={14} className="text-slate-400 dark:text-slate-500" />
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Fourchette régionale ({regionFranceOptions.find((r) => r.value === input.regionLoyer)?.label}) : {formatEuro(loyerMinSuggere)} – {formatEuro(loyerMaxSuggere)}/mois
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField label="Loyer mensuel hors charges" value={input.loyerMensuel} onChange={(v) => onChange({ loyerMensuel: v })} suffix="€" step={10} />
        <NumberField label="Charges non récupérables (mensuel)" value={input.chargesNonRecuperables} onChange={(v) => onChange({ chargesNonRecuperables: v })} suffix="€" step={10} hint="Copropriété, etc." />
        <NumberField label="Taxe foncière (annuelle)" value={input.taxeFonciere} onChange={(v) => onChange({ taxeFonciere: v })} suffix="€" step={50} />
        <NumberField label="Assurance PNO (annuelle)" value={input.assurancePNO} onChange={(v) => onChange({ assurancePNO: v })} suffix="€" step={10} hint="Propriétaire Non Occupant" />
        <NumberField label="Frais de gestion locative" value={input.fraisGestion} onChange={(v) => onChange({ fraisGestion: v })} suffix="%" step={1} hint="Pourcentage du loyer perçu" />
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-700">
        <SegmentedControl
          label="Mode de calcul de la vacance locative"
          value={input.vacanceMode}
          onChange={(v) => onChange({ vacanceMode: v })}
          options={[
            { value: 'percentage', label: 'En pourcentage' },
            { value: 'weeks', label: 'En semaines/an' },
          ]}
        />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {input.vacanceMode === 'percentage' ? (
            <NumberField label="Vacance locative" value={input.vacancePourcentage} onChange={(v) => onChange({ vacancePourcentage: v })} suffix="%" step={0.5} hint="8,33 % ≈ 1 mois/an" />
          ) : (
            <NumberField label="Semaines de vacance par an" value={input.vacanceSemaines} onChange={(v) => onChange({ vacanceSemaines: Math.round(v) })} suffix="sem." step={1} />
          )}
        </div>
      </div>
    </SectionCard>
  );
}

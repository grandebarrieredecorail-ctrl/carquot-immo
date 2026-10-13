import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Building2,
  Home,
  Landmark,
  Wallet,
  Save,
  FolderOpen,
  Printer,
  CheckCircle2,
  Scale,
  Gauge,
  Clock,
  RotateCcw,
  Moon,
  Sun,
  FileSpreadsheet,
  BarChart3,
  Percent,
  TrendingUp,
  X,
} from 'lucide-react';
import type { SimulationInput, SavedSimulation } from './types';
import { defaultInput } from './constants';
import { computeResults, formatEuro, formatPercent } from './calculations';
import { useSavedSimulations } from './hooks/useSavedSimulations';
import { StepProfil } from './components/steps/StepProfil';
import { StepAcquisition } from './components/steps/StepAcquisition';
import { StepFinancement } from './components/steps/StepFinancement';
import { StepRevenus } from './components/steps/StepRevenus';
import { StepJuridique } from './components/steps/StepJuridique';
import { StepDPE } from './components/steps/StepDPE';
import { StepRevente } from './components/steps/StepRevente';
import { ResultsDashboard } from './components/ResultsDashboard';
import { SimulationsSidebar } from './components/SimulationsSidebar';
import { AnnonceImport } from './components/AnnonceImport';
import { CarquotImmoLogo } from './components/CarquotImmoLogo';

type TabId = 'profil' | 'acquisition' | 'financement' | 'revenus' | 'juridique' | 'dpe' | 'revente' | 'resultats';

const TABS: { id: TabId; label: string; short: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'profil', label: 'Profil', short: 'Profil', icon: Home },
  { id: 'acquisition', label: 'Acquisition', short: 'Achat', icon: Building2 },
  { id: 'financement', label: 'Financement', short: 'Prêt', icon: Landmark },
  { id: 'revenus', label: 'Revenus', short: 'Loyers', icon: Wallet },
  { id: 'juridique', label: 'Juridique', short: 'Fiscal', icon: Scale },
  { id: 'dpe', label: 'DPE', short: 'DPE', icon: Gauge },
  { id: 'revente', label: 'Revente', short: 'Sortie', icon: Clock },
  { id: 'resultats', label: 'Résultats Détaillés', short: 'Résultats', icon: BarChart3 },
];

function App() {
  const [input, setInput] = useState<SimulationInput>(defaultInput);
  const [activeTab, setActiveTab] = useState<TabId>('profil');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [simName, setSimName] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const { simulations, saveSimulation, deleteSimulation, renameSimulation, moveSimulationToFolder } = useSavedSimulations();

  const results = useMemo(() => computeResults(input), [input]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const updateInput = useCallback((patch: Partial<SimulationInput>) => {
    setInput((prev) => ({ ...prev, ...patch }));
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleSave = useCallback(() => {
    saveSimulation(simName, input, results);
    setSimName('');
    setShowSavePrompt(false);
  }, [simName, input, results, saveSimulation]);

  const handleLoad = useCallback((sim: SavedSimulation) => {
    setInput(sim.input);
    setSidebarOpen(false);
    setActiveTab('profil');
  }, []);

  const handleReset = useCallback(() => {
    setInput(defaultInput);
    setActiveTab('profil');
  }, []);

  const handleExportExcel = useCallback(() => {
    const rows: string[][] = [
      ['IMMOPRO — Export Simulation'],
      [''],
      ['INFORMATIONS GENERALES'],
      ['Lien annonce', input.lienAnnonce || 'N/A'],
      ['Ville', input.ville],
      ['Quartier', input.quartier],
      ['Surface', `${input.surface} m²`],
      [''],
      ['ACQUISITION'],
      ['Prix d\'achat', formatEuro(input.prixAchat)],
      ['État du bien', input.etatBien],
      ['Frais de notaire', formatEuro(results.fraisNotaire)],
      ['Frais d\'agence', formatEuro(results.fraisAgenceCalcule)],
      ['Frais de dossier', formatEuro(input.fraisDossier)],
      ['Honoraires chasseur', formatEuro(results.chasseurHonoraires)],
      ['Audit énergétique', formatEuro(input.auditEnergetique)],
      [''],
      ['TRAVAUX'],
      ['Travaux rénovation globale', formatEuro(input.montantTravaux)],
      ['Travaux énergétiques', formatEuro(input.travauxEnergetiques)],
      ['Coût MOE', formatEuro(results.coutMoe)],
      ['Subventions', formatEuro(results.montantSubventions)],
      ['Éco-PTZ', formatEuro(results.montantEcoPTZ)],
      [''],
      ['FINANCEMENT'],
      ['Apport personnel', formatEuro(input.apport)],
      ['Montant emprunté', formatEuro(results.montantEmprunte)],
      ['Durée crédit', `${input.dureeCredit} ans`],
      ['Taux d\'intérêt', `${input.tauxInteret}%`],
      ['Taux assurance', `${input.tauxAssurance}%`],
      ['Mensualité crédit', formatEuro(results.mensualiteCredit)],
      ['Mensualité assurance', formatEuro(results.mensualiteAssurance)],
      ['Mensualité totale', formatEuro(results.mensualiteTotale)],
      [''],
      ['REVENUS'],
      ['Loyer mensuel', formatEuro(input.loyerMensuel)],
      ['Charges non récupérables', formatEuro(input.chargesNonRecuperables)],
      ['Taxe foncière', formatEuro(input.taxeFonciere)],
      ['Assurance PNO', formatEuro(input.assurancePNO)],
      [''],
      ['FISCALITE'],
      ['Structure juridique', input.structureJuridique],
      ['Type location', input.typeLocation],
      ['Régime fiscal', input.regimeFiscal],
      ['TMI', `${input.tmi}%`],
      ['Revenu imposable', formatEuro(results.revenuImposableAnnuel)],
      ['Impôt annuel', formatEuro(results.impotAnnuel)],
      ['Prélèvements sociaux', formatEuro(results.prelevementsSociaux)],
      ['Total fiscalité', formatEuro(results.totalFiscaliteAnnuelle)],
      [''],
      ['DPE'],
      ['DPE actuel', input.dpeActuel],
      ['DPE cible', input.dpeCible],
      ['Gain valorisation verte', formatEuro(results.gainValorisationVerte)],
      ['Valeur revalorisée', formatEuro(results.valeurBienRevalorisee)],
      [''],
      ['RESULTATS'],
      ['Coût total projet', formatEuro(results.coutTotalProjet)],
      ['Cash-flow mensuel net', formatEuro(results.cashFlowMensuelNet)],
      ['Cash-flow après impôt', formatEuro(results.cashFlowApresImpot)],
      ['Rentabilité brute', formatPercent(results.rentabiliteBrute)],
      ['Rentabilité nette', formatPercent(results.rentabiliteNette)],
      ['Rentabilité nette-nette', formatPercent(results.rentabiliteApresImpot)],
      ['TRI', formatPercent(results.tri)],
      ['TRI à 5 ans', formatPercent(results.tri5)],
      ['TRI à 10 ans', formatPercent(results.tri10)],
      ['TRI à 15 ans', formatPercent(results.tri15)],
      [''],
      ['PROJECTION REVENTE'],
      ['Durée détention', `${input.dureeDetention} ans`],
      ['Plus-value brute', formatEuro(results.plusValueBruteRevente)],
      ['Plus-value nette', formatEuro(results.plusValueNetteRevente)],
      ['Patrimoine final', formatEuro(results.patrimoineFinal)],
    ];

    const csvContent = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulation-carquot-immo-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [input, results]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profil':
        return <StepProfil input={input} onChange={updateInput} profilAide={results.profilAide} />;
      case 'acquisition':
        return <StepAcquisition input={input} onChange={updateInput} fraisAgenceCalcule={results.fraisAgenceCalcule} />;
      case 'financement':
        return <StepFinancement input={input} onChange={updateInput} montantEmprunte={results.montantEmprunte} />;
      case 'revenus':
        return (
          <StepRevenus
            input={input}
            onChange={updateInput}
            loyerMinSuggere={results.loyerMinSuggere}
            loyerMaxSuggere={results.loyerMaxSuggere}
            loyerEstimeQuartier={results.loyerEstimeQuartier}
            loyerM2Quartier={results.loyerM2Quartier}
          />
        );
      case 'juridique':
        return <StepJuridique input={input} onChange={updateInput} />;
      case 'dpe':
        return (
          <StepDPE
            input={input}
            onChange={updateInput}
            gainValorisation={results.gainValorisationVerte}
            valeurRevalorisee={results.valeurBienRevalorisee}
          />
        );
      case 'revente':
        return <StepRevente input={input} onChange={updateInput} />;
      case 'resultats':
        return <ResultsDashboard results={results} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 dark:bg-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-lg print:hidden dark:border-slate-700 dark:bg-slate-800/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center">
              <CarquotImmoLogo size={40} />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-800 dark:text-slate-100">Carquot Immo</h1>
              <p className="hidden text-xs text-slate-400 sm:block dark:text-slate-400">Simulation d'investissement immobilier locatif</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:border-teal-300 hover:text-teal-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
              title={darkMode ? 'Mode clair' : 'Mode sombre'}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={() => setShowSavePrompt(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:border-teal-300 hover:text-teal-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
            >
              <Save size={16} />
              <span className="hidden sm:inline">Sauvegarder</span>
            </button>
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:border-teal-300 hover:text-teal-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
            >
              <FolderOpen size={16} />
              <span className="hidden sm:inline">Simulations</span>
              {simulations.length > 0 && (
                <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-700 dark:bg-teal-900 dark:text-teal-300">{simulations.length}</span>
              )}
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-medium text-emerald-600 transition-all hover:bg-emerald-50 dark:border-emerald-700 dark:bg-slate-700 dark:text-emerald-400"
            >
              <FileSpreadsheet size={16} />
              <span className="hidden sm:inline">Excel</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:border-teal-300 hover:text-teal-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
            >
              <Printer size={16} />
              <span className="hidden sm:inline">PDF</span>
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-600 transition-all hover:bg-rose-50 dark:border-rose-700 dark:bg-slate-700 dark:text-rose-400"
            >
              <RotateCcw size={16} />
              <span className="hidden sm:inline">Réinitialiser</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-5">
          {/* Lien annonce (always visible, compact) */}
          {activeTab === 'acquisition' && (
            <AnnonceImport input={input} onImport={updateInput} />
          )}

          {/* Tab navigation */}
          <nav className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 print:hidden dark:border-slate-700 dark:bg-slate-800">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? 'bg-teal-500 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden md:inline">{tab.label}</span>
                  <span className="md:hidden">{tab.short}</span>
                </button>
              );
            })}
          </nav>

          {/* Tab content */}
          <div className="print:block">{renderTabContent()}</div>
        </div>
      </main>

      {/* Persistent bottom indicator bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-lg print:hidden dark:border-slate-700 dark:bg-slate-800/95">
        <div className="mx-auto flex max-w-5xl items-stretch divide-x divide-slate-200 dark:divide-slate-700">
          <IndicatorItem
            icon={<Percent size={15} />}
            label="R. Brut"
            value={formatPercent(results.rentabiliteBrute)}
            positive={results.rentabiliteBrute > 0}
          />
          <IndicatorItem
            icon={<Percent size={15} />}
            label="R. Net"
            value={formatPercent(results.rentabiliteNette)}
            positive={results.rentabiliteNette > 0}
          />
          <IndicatorItem
            icon={<Wallet size={15} />}
            label="Cash-flow"
            value={formatEuro(results.cashFlowMensuelNet) + '/mo'}
            positive={results.cashFlowMensuelNet > 0}
          />
          <IndicatorItem
            icon={<TrendingUp size={15} />}
            label="TRI"
            value={formatPercent(results.tri)}
            positive={results.tri > 0}
          />
          {activeTab !== 'resultats' && (
            <button
              onClick={() => setActiveTab('resultats')}
              className="flex items-center gap-2 px-4 text-sm font-medium text-teal-600 transition-colors hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-slate-700"
            >
              <BarChart3 size={18} />
              <span className="hidden sm:inline">Détails</span>
            </button>
          )}
        </div>
      </div>

      {/* Save prompt modal */}
      {showSavePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm print:hidden">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Sauvegarder la simulation</h3>
              <button onClick={() => setShowSavePrompt(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                <X size={18} />
              </button>
            </div>
            <input
              type="text"
              value={simName}
              onChange={(e) => setSimName(e.target.value)}
              placeholder="Nom de la simulation (ex : Studio Lyon 3)"
              autoFocus
              className="mb-4 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowSavePrompt(false)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">Annuler</button>
              <button onClick={handleSave} className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-teal-600">Sauvegarder</button>
            </div>
          </div>
        </div>
      )}

      {/* Collapsible sidebar */}
      {sidebarOpen && (
        <SimulationsSidebar
          simulations={simulations}
          onDelete={deleteSimulation}
          onRename={renameSimulation}
          onMoveToFolder={moveSimulationToFolder}
          onLoad={handleLoad}
          onClose={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

function IndicatorItem({
  icon,
  label,
  value,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  positive: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-0.5 px-2 py-2.5">
      <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <span className={`text-sm font-bold tabular-nums ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
        {value}
      </span>
    </div>
  );
}

export default App;

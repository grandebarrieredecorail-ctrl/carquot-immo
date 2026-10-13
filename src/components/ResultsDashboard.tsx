import { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Banknote,
  Percent,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  CircleDot,
  Receipt,
  Leaf,
  LineChart as LineChartIcon,
  ChevronDown,
  ChevronUp,
  Receipt as ReceiptIcon,
  BarChart3,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { SimulationResults, ProjectionAnnee } from '../types';
import { formatEuro, formatPercent } from '../calculations';

interface Props {
  results: SimulationResults;
}

type TabId = 'synthese' | 'fiscalite' | 'projection';

export function ResultsDashboard({ results }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('synthese');

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'synthese', label: 'Synthèse', icon: <Wallet size={15} /> },
    { id: 'fiscalite', label: 'Fiscalité', icon: <ReceiptIcon size={15} /> },
    { id: 'projection', label: 'Projection', icon: <LineChartIcon size={15} /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-teal-500 text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'synthese' && <SyntheseTab results={results} />}
      {activeTab === 'fiscalite' && <FiscaliteTab results={results} />}
      {activeTab === 'projection' && <ProjectionTab results={results} />}
    </div>
  );
}

function SyntheseTab({ results }: { results: SimulationResults }) {
  const statusConfig = {
    positive: { icon: <CheckCircle2 size={20} />, label: 'Cash-flow positif', desc: "L'investissement génère un surplus mensuel", color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    balanced: { icon: <CircleDot size={20} />, label: 'Équilibré', desc: 'Le cash-flow est proche de zéro', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    negative: { icon: <AlertCircle size={20} />, label: "Effort d'épargne requis", desc: "Vous devez apporter de l'argent chaque mois", color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
  };

  const status = statusConfig[results.cashFlowStatus];
  const cfColor = results.cashFlowMensuelNet > 0 ? 'text-emerald-600' : results.cashFlowMensuelNet >= -50 ? 'text-amber-600' : 'text-rose-600';

  return (
    <>
      <div className={`flex items-center gap-3 rounded-2xl border px-5 py-4 ${status.bg} ${status.border}`}>
        <span className={status.color}>{status.icon}</span>
        <div>
          <p className={`text-sm font-semibold ${status.color}`}>{status.label}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{status.desc}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="Coût total projet" value={formatEuro(results.coutTotalProjet)} icon={<Wallet size={18} />} accent="slate" />
        <MetricCard label="Reste à financer" value={formatEuro(results.resteAFinancer)} icon={<Banknote size={18} />} accent="slate" sub={`Aides : ${formatEuro(results.montantSubventions + results.montantEcoPTZ)}`} />
        <MetricCard label="Cash-flow brut/mois" value={formatEuro(results.cashFlowMensuelBrut)} icon={results.cashFlowMensuelBrut >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />} accent={results.cashFlowMensuelBrut > 0 ? 'emerald' : results.cashFlowMensuelBrut >= -50 ? 'amber' : 'rose'} />
        <MetricCard label="Cash-flow net/mois" value={formatEuro(results.cashFlowMensuelNet)} icon={results.cashFlowMensuelNet >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />} accent={results.cashFlowMensuelNet > 0 ? 'emerald' : results.cashFlowMensuelNet >= -50 ? 'amber' : 'rose'} />
        <MetricCard label="Cash-flow après impôt" value={formatEuro(results.cashFlowApresImpot)} icon={results.cashFlowApresImpot >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />} accent={results.cashFlowApresImpot > 0 ? 'emerald' : 'amber'} />
        <MetricCard label="TRI (Taux de rendement)" value={formatPercent(results.tri)} icon={<Percent size={18} />} accent={results.tri > 5 ? 'emerald' : results.tri > 0 ? 'amber' : 'rose'} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-teal-50 to-white p-5 dark:border-slate-700 dark:from-slate-800 dark:to-slate-800">
          <div className="mb-2 flex items-center gap-2 text-slate-500 dark:text-slate-400"><Percent size={16} /><span className="text-xs font-medium uppercase tracking-wide">R. brute</span></div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{formatPercent(results.rentabiliteBrute)}</p>
          <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">Loyer annuel HC ÷ Prix d'achat</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-white p-5 dark:border-slate-700 dark:from-slate-800 dark:to-slate-800">
          <div className="mb-2 flex items-center gap-2 text-slate-500 dark:text-slate-400"><Percent size={16} /><span className="text-xs font-medium uppercase tracking-wide">R. nette</span></div>
          <p className={`text-2xl font-bold ${cfColor}`}>{formatPercent(results.rentabiliteNette)}</p>
          <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">(Loyer - charges) ÷ Coût total projet</p>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 dark:border-emerald-800 dark:from-slate-800 dark:to-slate-800">
        <div className="mb-3 flex items-center gap-2">
          <Leaf size={18} className="text-emerald-600 dark:text-emerald-400" />
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Impact DPE & valorisation verte</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500">Gain de valorisation</p>
            <p className={`text-lg font-bold ${results.gainValorisationVerte >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{results.gainValorisationVerte > 0 ? '+' : ''}{formatEuro(results.gainValorisationVerte)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500">Valeur revalorisée</p>
            <p className="text-lg font-bold text-teal-700 dark:text-teal-400">{formatEuro(results.valeurBienRevalorisee)}</p>
          </div>
        </div>
      </div>
    </>
  );
}

function FiscaliteTab({ results }: { results: SimulationResults }) {
  const [showDetail, setShowDetail] = useState(false);
  const comparatif = results.comparatifFiscal;
  const maxImpot = Math.max(...comparatif.map((c) => c.impotAnnuel), 1);

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-teal-600 dark:text-teal-400" />
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Comparateur de régimes fiscaux</h4>
        </div>
        <div className="space-y-4">
          {comparatif.map((c) => (
            <div key={c.regime} className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">{c.regime}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{formatEuro(c.impotAnnuel)}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                <div className={`h-full rounded-full transition-all ${c.impotAnnuel === Math.max(...comparatif.map(r => r.impotAnnuel)) ? 'bg-rose-400' : 'bg-teal-400'}`} style={{ width: `${(c.impotAnnuel / maxImpot) * 100}%` }} />
              </div>
              <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500">
                <span>Impôt annuel</span>
                <span>Cash-flow net : <span className={c.cashFlowNet > 0 ? 'text-emerald-600 font-medium' : 'text-rose-600 font-medium'}>{formatEuro(c.cashFlowNet)}</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <button onClick={() => setShowDetail(!showDetail)} className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <Receipt size={16} className="text-teal-600 dark:text-teal-400" />
            Fiscalité annuelle (régime actuel)
          </div>
          {showDetail ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
        </button>
        {showDetail && (
          <div className="mt-4 space-y-2.5">
            <DetailRow label="Revenu imposable annuel" value={formatEuro(results.revenuImposableAnnuel)} />
            {results.amortissementAnnuel > 0 && <DetailRow label="Amortissement déduit" value={formatEuro(results.amortissementAnnuel)} positive />}
            <DetailRow label="Impôt sur le revenu (TMI)" value={formatEuro(results.impotAnnuel)} negative />
            <DetailRow label="Prélèvements sociaux (17,2%)" value={formatEuro(results.prelevementsSociaux)} negative />
            <div className="border-t border-slate-100 pt-2.5 dark:border-slate-700" />
            <DetailRow label="Total fiscalité annuelle" value={formatEuro(results.totalFiscaliteAnnuelle)} bold negative />
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-white p-5 dark:border-slate-700 dark:from-slate-800 dark:to-slate-800">
        <div className="mb-2 flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <Percent size={16} />
          <span className="text-xs font-medium uppercase tracking-wide">R. nette-nette (après impôt)</span>
        </div>
        <p className={`text-2xl font-bold ${results.rentabiliteApresImpot > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatPercent(results.rentabiliteApresImpot)}</p>
        <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">(Loyer net - impôt - prélèvements sociaux) ÷ Coût total projet</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-4 flex items-center gap-2">
          <ArrowRightLeft size={16} className="text-teal-600 dark:text-teal-400" />
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Détail du financement</h4>
        </div>
        <div className="space-y-2.5">
          <DetailRow label="Frais de notaire" value={formatEuro(results.fraisNotaire)} />
          <DetailRow label="Coût MOE" value={formatEuro(results.coutMoe)} />
          {results.coutAudit > 0 && <DetailRow label="Audit énergétique" value={formatEuro(results.coutAudit)} />}
          {results.chasseurHonoraires > 0 && <DetailRow label="Honoraires chasseur" value={formatEuro(results.chasseurHonoraires)} />}
          <DetailRow label="Subventions" value={formatEuro(results.montantSubventions)} positive />
          {results.montantEcoPTZ > 0 && <DetailRow label="Éco-PTZ" value={formatEuro(results.montantEcoPTZ)} positive />}
          <div className="border-t border-slate-100 pt-2.5 dark:border-slate-700" />
          <DetailRow label="Mensualité crédit" value={formatEuro(results.mensualiteCredit)} />
          <DetailRow label="Mensualité assurance" value={formatEuro(results.mensualiteAssurance)} />
          <DetailRow label="Mensualité totale" value={formatEuro(results.mensualiteTotale)} bold />
        </div>
      </div>
    </>
  );
}

type CurveKey = 'patrimoine' | 'capitalRestant' | 'cashFlow' | 'fiscalite' | 'loyerAnnuel';

const curveConfig: { key: CurveKey; label: string; color: string }[] = [
  { key: 'patrimoine', label: 'Patrimoine net', color: '#14b8a6' },
  { key: 'capitalRestant', label: 'Capital restant dû', color: '#f59e0b' },
  { key: 'cashFlow', label: 'Cash-flow annuel', color: '#3b82f6' },
  { key: 'fiscalite', label: 'Fiscalité', color: '#ef4444' },
  { key: 'loyerAnnuel', label: 'Loyer annuel', color: '#8b5cf6' },
];

function ProjectionTab({ results }: { results: SimulationResults }) {
  const [showTable, setShowTable] = useState(false);
  const [visibleCurves, setVisibleCurves] = useState<Set<CurveKey>>(new Set(['patrimoine']));
  const projection = results.projection;

  const toggleCurve = (key: CurveKey) => {
    setVisibleCurves((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const chartData = useMemo(() => {
    if (projection.length === 0) return null;

    const activeCurves = curveConfig.filter((c) => visibleCurves.has(c.key));
    if (activeCurves.length === 0) return null;

    const width = 600;
    const height = 240;
    const padding = { top: 20, right: 20, bottom: 30, left: 60 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const allValues: number[] = [];
    for (const p of projection) {
      for (const c of activeCurves) {
        const val = c.key === 'fiscalite' ? results.totalFiscaliteAnnuelle : c.key === 'capitalRestant' ? p.capitalRestantDu : c.key === 'cashFlow' ? p.cashFlowAnnuel : p[c.key];
        allValues.push(val);
      }
    }

    const minVal = Math.min(...allValues, 0);
    const maxVal = Math.max(...allValues, 1);
    const range = Math.max(maxVal - minVal, 1);

    const xStep = chartW / Math.max(projection.length - 1, 1);

    const toX = (i: number) => padding.left + i * xStep;
    const toY = (val: number) => padding.top + chartH - ((val - minVal) / range) * chartH;

    const lines = activeCurves.map((curve) => {
      const points = projection.map((p, i) => {
        const val = curve.key === 'fiscalite' ? results.totalFiscaliteAnnuelle : curve.key === 'capitalRestant' ? p.capitalRestantDu : curve.key === 'cashFlow' ? p.cashFlowAnnuel : p[curve.key];
        return `${toX(i)},${toY(val)}`;
      });
      return {
        ...curve,
        pathD: `M ${points.join(' L ')}`,
        areaPathD: `M ${toX(0)},${toY(0)} L ${points.join(' L ')} L ${toX(projection.length - 1)},${toY(0)} Z`,
      };
    });

    const yTicks = [minVal, minVal + range * 0.25, minVal + range * 0.5, minVal + range * 0.75, maxVal];

    return { width, height, padding, chartW, chartH, lines, xStep, toX, toY, yTicks, minVal, maxVal };
  }, [projection, visibleCurves, results.totalFiscaliteAnnuelle]);

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-4 flex items-center gap-2">
          <Percent size={18} className="text-teal-600 dark:text-teal-400" />
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">TRI selon l'horizon de détention</h4>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <TriCard label="5 ans" value={results.tri5} />
          <TriCard label="10 ans" value={results.tri10} />
          <TriCard label="15 ans" value={results.tri15} />
        </div>
      </div>

      {projection.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Évolution du patrimoine net</h4>
            </div>

            {/* Curve toggle buttons */}
            <div className="flex flex-wrap gap-2">
              {curveConfig.map((curve) => {
                const active = visibleCurves.has(curve.key);
                return (
                  <button
                    key={curve.key}
                    onClick={() => toggleCurve(curve.key)}
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
                      active
                        ? 'border-transparent text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400'
                    }`}
                    style={active ? { backgroundColor: curve.color } : undefined}
                  >
                    {active ? <Eye size={12} /> : <EyeOff size={12} />}
                    {curve.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SVG Chart */}
          {chartData ? (
            <div className="overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartData.width} ${chartData.height}`}
                className="w-full"
                style={{ minWidth: 400 }}
              >
                {/* Grid lines + Y labels */}
                {chartData.yTicks.map((tick, i) => {
                  const y = chartData.toY(tick);
                  return (
                    <g key={i}>
                      <line
                        x1={chartData.padding.left}
                        y1={y}
                        x2={chartData.width - chartData.padding.right}
                        y2={y}
                        stroke="currentColor"
                        strokeWidth="0.5"
                        className="text-slate-200 dark:text-slate-700"
                        strokeDasharray="3,3"
                      />
                      <text
                        x={chartData.padding.left - 8}
                        y={y + 3}
                        textAnchor="end"
                        fontSize="10"
                        className="fill-slate-400 dark:fill-slate-500"
                      >
                        {tick >= 1000 ? `${(tick / 1000).toFixed(0)}k` : tick.toFixed(0)}
                      </text>
                    </g>
                  );
                })}

                {/* X labels */}
                {projection.map((p, i) => {
                  if (projection.length > 15 && i % 5 !== 0 && i !== projection.length - 1) return null;
                  return (
                    <text
                      key={i}
                      x={chartData.toX(i)}
                      y={chartData.height - 8}
                      textAnchor="middle"
                      fontSize="10"
                      className="fill-slate-400 dark:fill-slate-500"
                    >
                      An {p.annee}
                    </text>
                  );
                })}

                {/* Lines */}
                {chartData.lines.map((line) => (
                  <g key={line.key}>
                    {line.key === 'patrimoine' && (
                      <path
                        d={line.areaPathD}
                        fill={line.color}
                        opacity="0.08"
                      />
                    )}
                    <path
                      d={line.pathD}
                      fill="none"
                      stroke={line.color}
                      strokeWidth="2"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  </g>
                ))}

                {/* Zero line */}
                {chartData.minVal < 0 && (
                  <line
                    x1={chartData.padding.left}
                    y1={chartData.toY(0)}
                    x2={chartData.width - chartData.padding.right}
                    y2={chartData.toY(0)}
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-slate-300 dark:text-slate-600"
                  />
                )}
              </svg>
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-700">
              <p className="text-sm text-slate-400 dark:text-slate-500">
                {visibleCurves.size === 0 ? 'Sélectionnez au moins une courbe à afficher' : 'Aucune donnée disponible'}
              </p>
            </div>
          )}

          {/* Legend */}
          {chartData && (
            <div className="mt-3 flex flex-wrap gap-3">
              {chartData.lines.map((line) => (
                <div key={line.key} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: line.color }} />
                  {line.label}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">À la revente (année {projection.length})</h4>
          <button onClick={() => setShowTable(!showTable)} className="text-xs text-teal-600 dark:text-teal-400 hover:underline">
            {showTable ? 'Masquer le tableau' : 'Voir le tableau'}
          </button>
        </div>
        <div className="space-y-2.5 rounded-xl bg-slate-50 p-4 dark:bg-slate-700">
          <DetailRow label="Plus-value brute" value={formatEuro(results.plusValueBruteRevente)} />
          <DetailRow label="Plus-value imposable" value={formatEuro(results.plusValueImposeeRevente)} />
          <DetailRow label="Impôt sur plus-value" value={formatEuro(results.impotPlusValueRevente)} negative />
          <div className="border-t border-slate-200 pt-2.5 dark:border-slate-600" />
          <DetailRow label="Plus-value nette" value={formatEuro(results.plusValueNetteRevente)} bold positive />
          <DetailRow label="Patrimoine final" value={formatEuro(results.patrimoineFinal)} bold />
        </div>
      </div>

      {showTable && projection.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 overflow-x-auto dark:border-slate-700 dark:bg-slate-800">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 dark:border-slate-600 dark:text-slate-500">
                <th className="py-2 text-left font-medium">Année</th>
                <th className="py-2 text-right font-medium">Loyer/an</th>
                <th className="py-2 text-right font-medium">Cash-flow</th>
                <th className="py-2 text-right font-medium">Valeur bien</th>
                <th className="py-2 text-right font-medium">+Value nette</th>
              </tr>
            </thead>
            <tbody>
              {projection.filter((_, i) => i < 3 || i === projection.length - 1 || (i + 1) % 5 === 0).map((p) => (
                <tr key={p.annee} className="border-b border-slate-50 dark:border-slate-700">
                  <td className="py-2 font-medium text-slate-600 dark:text-slate-300">An {p.annee}</td>
                  <td className="py-2 text-right tabular-nums text-slate-600 dark:text-slate-300">{formatEuro(p.loyerAnnuel)}</td>
                  <td className={`py-2 text-right tabular-nums ${p.cashFlowAnnuel >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatEuro(p.cashFlowAnnuel)}</td>
                  <td className="py-2 text-right tabular-nums text-slate-600 dark:text-slate-300">{formatEuro(p.valeurBien)}</td>
                  <td className={`py-2 text-right tabular-nums font-medium ${p.plusValueNette >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatEuro(p.plusValueNette)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

const accentMap = {
  slate: { border: 'border-slate-200', icon: 'text-slate-400', value: 'text-slate-800', darkBorder: 'dark:border-slate-700', darkIcon: 'dark:text-slate-500', darkValue: 'dark:text-slate-100' },
  emerald: { border: 'border-emerald-200', icon: 'text-emerald-500', value: 'text-emerald-700', darkBorder: 'dark:border-emerald-700', darkIcon: 'dark:text-emerald-400', darkValue: 'dark:text-emerald-400' },
  amber: { border: 'border-amber-200', icon: 'text-amber-500', value: 'text-amber-700', darkBorder: 'dark:border-amber-700', darkIcon: 'dark:text-amber-400', darkValue: 'dark:text-amber-400' },
  rose: { border: 'border-rose-200', icon: 'text-rose-500', value: 'text-rose-700', darkBorder: 'dark:border-rose-700', darkIcon: 'dark:text-rose-400', darkValue: 'dark:text-rose-400' },
};

function MetricCard({ label, value, icon, accent, sub }: { label: string; value: string; icon: React.ReactNode; accent: keyof typeof accentMap; sub?: string }) {
  const a = accentMap[accent];
  return (
    <div className={`rounded-2xl border bg-white p-4 ${a.border} ${a.darkBorder} dark:bg-slate-800`}>
      <div className="mb-2 flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <span className={`${a.icon} ${a.darkIcon}`}>{icon}</span>
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className={`text-base font-bold ${a.value} ${a.darkValue}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{sub}</p>}
    </div>
  );
}

function DetailRow({ label, value, bold, positive, negative }: { label: string; value: string; bold?: boolean; positive?: boolean; negative?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={`${bold ? 'font-semibold text-slate-700 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>{label}</span>
      <span className={`tabular-nums ${bold ? 'font-bold text-slate-800 dark:text-slate-100' : positive ? 'font-medium text-emerald-600' : negative ? 'text-rose-600' : 'text-slate-600 dark:text-slate-300'}`}>{value}</span>
    </div>
  );
}

function TriCard({ label, value }: { label: string; value: number }) {
  const color = value > 5 ? 'text-emerald-600' : value > 0 ? 'text-amber-600' : 'text-rose-600';
  const bg = value > 5 ? 'bg-emerald-50 border-emerald-200 dark:bg-slate-700 dark:border-emerald-800' : value > 0 ? 'bg-amber-50 border-amber-200 dark:bg-slate-700 dark:border-amber-800' : 'bg-rose-50 border-rose-200 dark:bg-slate-700 dark:border-rose-800';
  return (
    <div className={`rounded-xl border p-3 text-center ${bg}`}>
      <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{formatPercent(value)}</p>
    </div>
  );
}

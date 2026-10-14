import type { SimulationInput, SimulationResults, CashFlowStatus, ProjectionAnnee } from './types';
import {
  getMaPrimeRenovProfil,
  subventionGlobale,
  subventionGeste,
  dpeImpact,
  PRELEVEMENTS_SOCIAUX,
  TAUX_IS,
  getAbattementIR,
  getAbattementPS,
  getLoyerSuggere,
  getLoyerM2Quartier,
  getRegionFromVille,
} from './constants';

export function computeResults(input: SimulationInput): SimulationResults {
  const prixAchatEffectif = input.prixAchat * (1 - input.negociationPct / 100);
  const inputEff = { ...input, prixAchat: prixAchatEffectif };

  // === Frais de notaire ===
  const fraisNotaire = (prixAchatEffectif * input.tauxNotaire) / 100;

  // === Frais d'agence (montant fixe ou pourcentage) ===
  const fraisAgenceCalcule =
    input.fraisAgenceMode === 'percentage'
      ? (prixAchatEffectif * input.fraisAgencePourcentage) / 100
      : input.fraisAgence;

  // === Chasseur de biens ===
  const chasseurHonoraires = input.chasseurActif
    ? input.chasseurMode === 'percentage'
      ? (prixAchatEffectif * input.chasseurPourcentage) / 100
      : input.chasseurForfait
    : 0;

  // === Coût MOE ===
  const coutMoe =
    input.moeMode === 'percentage'
      ? (input.montantTravaux * input.moePourcentage) / 100
      : input.moeForfait;

  // === Coût total du projet ===
  const coutTotalProjet =
    prixAchatEffectif +
    fraisNotaire +
    fraisAgenceCalcule +
    chasseurHonoraires +
    input.auditEnergetique +
    input.fraisDossier +
    input.montantTravaux +
    input.travauxEnergetiques +
    coutMoe;

  // === Profil MaPrimeRénov' ===
  const profilAide = getMaPrimeRenovProfil(
    input.revenuFiscalReference,
    input.nombrePersonnes,
    input.region
  );

  // === Subventions ===
  let montantSubventions = 0;
  let montantEcoPTZ = 0;

  if (input.simulerSubventions && input.travauxEnergetiques > 0) {
    const tauxSubvention =
      input.typeRenovation === 'globale'
        ? subventionGlobale[profilAide]
        : subventionGeste[profilAide];
    montantSubventions = input.travauxEnergetiques * tauxSubvention;
  }

  if (input.simulerEcoPTZ) {
    montantEcoPTZ = input.typeRenovation === 'globale' ? 30000 : 15000;
    montantEcoPTZ = Math.min(montantEcoPTZ, input.travauxEnergetiques);
  }

  // === Financement ===
  const resteAFinancer = Math.max(
    0,
    coutTotalProjet - montantSubventions - montantEcoPTZ - input.apport
  );
  const montantEmprunte = resteAFinancer;

  const tauxMensuel = input.tauxInteret / 100 / 12;
  const nombreMois = input.dureeCredit * 12;

  let mensualiteCapitalInteret = 0;
  if (montantEmprunte > 0 && nombreMois > 0) {
    if (tauxMensuel === 0) {
      mensualiteCapitalInteret = montantEmprunte / nombreMois;
    } else {
      mensualiteCapitalInteret =
        (montantEmprunte * tauxMensuel * Math.pow(1 + tauxMensuel, nombreMois)) /
        (Math.pow(1 + tauxMensuel, nombreMois) - 1);
    }
  }

  const mensualiteAssurance = (montantEmprunte * (input.tauxAssurance / 100)) / 12;
  const mensualiteTotale = mensualiteCapitalInteret + mensualiteAssurance;

  // === Revenus locatifs ===
  const loyerAnnuelBrut = input.loyerMensuel * 12;

  let tauxVacance = 0;
  if (input.vacanceMode === 'percentage') {
    tauxVacance = input.vacancePourcentage / 100;
  } else {
    tauxVacance = input.vacanceSemaines / 52;
  }

  const loyerAnnuelAvecVacance = loyerAnnuelBrut * (1 - tauxVacance);
  const vacanceLocativeAnnuelle = loyerAnnuelBrut - loyerAnnuelAvecVacance;
  const fraisGestionAnnuel = (loyerAnnuelAvecVacance * input.fraisGestion) / 100;

  // Charges déductibles pour la rentabilité nette (aucune charge comptée en double)
  const chargesCoproprieteAnnuelles = input.chargesNonRecuperables * 12;
  const chargesAnnuellesTotales =
    chargesCoproprieteAnnuelles +
    input.taxeFonciere +
    input.assurancePNO +
    fraisGestionAnnuel;

  // Revenu net = loyer HC - vacance - charges (pour rentabilité nette, avant financier)
  const loyerAnnuelNet = loyerAnnuelAvecVacance - chargesAnnuellesTotales;

  // === Cash-flow ===
  const cashFlowMensuelBrut = (loyerAnnuelAvecVacance / 12) - mensualiteCapitalInteret;
  const cashFlowMensuelNet = (loyerAnnuelNet / 12) - mensualiteTotale;

  // === Rentabilités — méthodologie standard ===
  // BRUTE : (Loyer Annuel HC / Prix d'achat net vendeur) × 100
  const rentabiliteBrute = prixAchatEffectif > 0 ? (loyerAnnuelBrut / prixAchatEffectif) * 100 : 0;

  // NETTE : ((Loyer HC - Vacance - Charges non récupérables - Taxe foncière - PNO - Gestion) / Coût total projet) × 100
  // Coût total = Prix + Notaire + Agence + Travaux + MOE + Chasseur + Audit
  const rentabiliteNette = coutTotalProjet > 0 ? (loyerAnnuelNet / coutTotalProjet) * 100 : 0;

  let cashFlowStatus: CashFlowStatus = 'negative';
  if (cashFlowMensuelNet > 50) cashFlowStatus = 'positive';
  else if (cashFlowMensuelNet >= -50) cashFlowStatus = 'balanced';

  // === FISCALITÉ ANNUELLE ===
  const { revenuImposableAnnuel, impotAnnuel, prelevementsSociaux, totalFiscaliteAnnuelle, amortissementAnnuel } =
    computeFiscaliteAnnuelle(inputEff, loyerAnnuelAvecVacance, loyerAnnuelNet, chargesAnnuellesTotales);

  // NETTE-NETTE : Rentabilité nette après impôt et prélèvements sociaux
  const cashFlowApresImpot = cashFlowMensuelNet * 12 - totalFiscaliteAnnuelle;
  const cashFlowAnnuelApresImpot = loyerAnnuelNet - totalFiscaliteAnnuelle;
  const rentabiliteApresImpot =
    coutTotalProjet > 0
      ? (cashFlowAnnuelApresImpot / coutTotalProjet) * 100
      : 0;

  // === DPE & VALORISATION VERTE ===
  const dpeDecoteActuelle = prixAchatEffectif * dpeImpact[input.dpeActuel];
  const dpeSurcoteCible = prixAchatEffectif * dpeImpact[input.dpeCible];
  // Gain = différence entre valeur avec DPE cible et valeur avec DPE actuel
  const gainValorisationVerte = dpeSurcoteCible - dpeDecoteActuelle;
  // Valeur revalorisée = prix d'achat + gain vert (après travaux)
  const valeurBienRevalorisee = prixAchatEffectif + gainValorisationVerte + input.montantTravaux;

  // === PROJECTION MULTI-ANNÉES + REVENTE ===
  const projection = computeProjection(inputEff, loyerAnnuelAvecVacance, chargesAnnuellesTotales, mensualiteTotale, montantEmprunte, valeurBienRevalorisee, fraisAgenceCalcule + chasseurHonoraires + input.auditEnergetique);

  const derniereAnnee = projection[projection.length - 1];
  const plusValueBruteRevente = derniereAnnee?.plusValueBrute ?? 0;
  const plusValueImposeeRevente = derniereAnnee?.plusValueImposee ?? 0;
  const impotPlusValueRevente = derniereAnnee?.impotPlusValue ?? 0;
  const plusValueNetteRevente = derniereAnnee?.plusValueNette ?? 0;
  const patrimoineFinal = derniereAnnee?.patrimoine ?? 0;

  // === TRI multi-horizons ===
  const tri = computeTRI(inputEff, projection, montantEmprunte);
  const tri5 = computeTRIAtYear(inputEff, projection, montantEmprunte, 5);
  const tri10 = computeTRIAtYear(inputEff, projection, montantEmprunte, 10);
  const tri15 = computeTRIAtYear(inputEff, projection, montantEmprunte, 15);

  // === Comparateur fiscal ===
  const comparatifFiscal = computeComparatifFiscal(inputEff, loyerAnnuelAvecVacance, chargesAnnuellesTotales);

  // === AIDE LOYERS — quartier ou région ===
  const loyerM2Quartier = input.loyerM2Personnalise > 0
    ? input.loyerM2Personnalise
    : getLoyerM2Quartier(input.ville, input.quartier, input.typeLocation);
  const loyerEstimeQuartier = Math.round(loyerM2Quartier * input.surface);
  const suggestion = getLoyerSuggere(input.regionLoyer, input.typeLocation, input.surface);

  return {
    fraisNotaire,
    coutTotalProjet,
    coutMoe,
    montantSubventions,
    montantEcoPTZ,
    resteAFinancer,
    montantEmprunte,
    mensualiteCredit: mensualiteCapitalInteret,
    mensualiteAssurance,
    mensualiteTotale,
    loyerAnnuelBrut,
    loyerAnnuelNet,
    chargesAnnuellesTotales,
    cashFlowMensuelBrut,
    cashFlowMensuelNet,
    rentabiliteBrute,
    rentabiliteNette,
    cashFlowStatus,
    profilAide,
    revenuImposableAnnuel,
    impotAnnuel,
    prelevementsSociaux,
    totalFiscaliteAnnuelle,
    cashFlowApresImpot: cashFlowApresImpot / 12,
    rentabiliteApresImpot,
    amortissementAnnuel,
    dpeDecoteActuelle,
    dpeSurcoteCible,
    gainValorisationVerte,
    valeurBienRevalorisee,
    projection,
    plusValueBruteRevente,
    plusValueImposeeRevente,
    impotPlusValueRevente,
    plusValueNetteRevente,
    patrimoineFinal,
    tri,
    loyerMinSuggere: suggestion.min,
    loyerMaxSuggere: suggestion.max,
    loyerEstimeQuartier,
    loyerM2Quartier,
    fraisAgenceCalcule,
    coutAudit: input.auditEnergetique,
    chasseurHonoraires,
    comparatifFiscal,
    tri5,
    tri10,
    tri15,
  };
}

// === Fiscalité annuelle selon régime ===
function computeFiscaliteAnnuelle(
  input: SimulationInput,
  loyerAnnuelPercu: number,
  _loyerAnnuelNet: number,
  chargesAnnuelles: number
): {
  revenuImposableAnnuel: number;
  impotAnnuel: number;
  prelevementsSociaux: number;
  totalFiscaliteAnnuelle: number;
  amortissementAnnuel: number;
} {
  const tmi = input.tmi / 100;
  const ps = PRELEVEMENTS_SOCIAUX / 100;

  // Amortissement (LMNP Réel uniquement) — simplifié : bâtiment 80% du prix sur 30 ans + travaux sur 10 ans
  let amortissementAnnuel = 0;
  if (input.regimeFiscal === 'lmnp_reel') {
    const amortissementBatiment = (input.prixAchat * 0.8) / 30;
    const amortissementTravaux = input.montantTravaux / 10;
    amortissementAnnuel = amortissementBatiment + amortissementTravaux;
  }

  switch (input.regimeFiscal) {
    case 'micro_bic': {
      // Abattement 50%, minimum 305€ de revenu imposable
      const abattement = 0.50;
      const revenuImposable = Math.max(305, loyerAnnuelPercu * (1 - abattement));
      const impot = revenuImposable * tmi;
      const prelevements = revenuImposable * ps;
      return {
        revenuImposableAnnuel: revenuImposable,
        impotAnnuel: impot,
        prelevementsSociaux: prelevements,
        totalFiscaliteAnnuelle: impot + prelevements,
        amortissementAnnuel: 0,
      };
    }
    case 'lmnp_reel': {
      // Revenu = loyers perçus - charges - amortissement
      const revenuImposable = Math.max(0, loyerAnnuelPercu - chargesAnnuelles - amortissementAnnuel);
      const impot = revenuImposable * tmi;
      const prelevements = revenuImposable * ps;
      return {
        revenuImposableAnnuel: revenuImposable,
        impotAnnuel: impot,
        prelevementsSociaux: prelevements,
        totalFiscaliteAnnuelle: impot + prelevements,
        amortissementAnnuel,
      };
    }
    case 'micro_foncier': {
      // Abattement 30%, réservé aux revenus fonciers annuels ≤ 15 000 €
      if (loyerAnnuelPercu > 15000) {
        const revenuImposable = Math.max(0, loyerAnnuelPercu - chargesAnnuelles);
        const impot = revenuImposable * tmi;
        const prelevements = revenuImposable * ps;
        return {
          revenuImposableAnnuel: revenuImposable,
          impotAnnuel: impot,
          prelevementsSociaux: prelevements,
          totalFiscaliteAnnuelle: impot + prelevements,
          amortissementAnnuel: 0,
        };
      }
      const abattement = 0.30;
      const revenuImposable = loyerAnnuelPercu * (1 - abattement);
      const impot = revenuImposable * tmi;
      const prelevements = revenuImposable * ps;
      return {
        revenuImposableAnnuel: revenuImposable,
        impotAnnuel: impot,
        prelevementsSociaux: prelevements,
        totalFiscaliteAnnuelle: impot + prelevements,
        amortissementAnnuel: 0,
      };
    }
    case 'foncier_reel': {
      // Revenu = loyers - charges (foncier réel)
      const revenuImposable = Math.max(0, loyerAnnuelPercu - chargesAnnuelles);
      const impot = revenuImposable * tmi;
      const prelevements = revenuImposable * ps;
      return {
        revenuImposableAnnuel: revenuImposable,
        impotAnnuel: impot,
        prelevementsSociaux: prelevements,
        totalFiscaliteAnnuelle: impot + prelevements,
        amortissementAnnuel: 0,
      };
    }
    default:
      return { revenuImposableAnnuel: 0, impotAnnuel: 0, prelevementsSociaux: 0, totalFiscaliteAnnuelle: 0, amortissementAnnuel: 0 };
  }
}

// === Tableau d'amortissement du prêt : capital restant dû à la fin de l'année n ===
function capitalRestantDu(montantEmprunte: number, tauxAnnuel: number, dureeAns: number, annee: number): number {
  if (montantEmprunte <= 0) return 0;
  const tauxMensuel = tauxAnnuel / 100 / 12;
  const nbMois = dureeAns * 12;
  const moisEcoules = annee * 12;

  if (moisEcoules >= nbMois) return 0;
  if (tauxMensuel === 0) return Math.max(0, montantEmprunte * (1 - moisEcoules / nbMois));

  const mensualite =
    (montantEmprunte * tauxMensuel * Math.pow(1 + tauxMensuel, nbMois)) /
    (Math.pow(1 + tauxMensuel, nbMois) - 1);

  const reste =
    (montantEmprunte * Math.pow(1 + tauxMensuel, moisEcoules)) -
    (mensualite * (Math.pow(1 + tauxMensuel, moisEcoules) - 1) / tauxMensuel);

  return Math.max(0, reste);
}

// === Projection multi-années ===
function computeProjection(
  input: SimulationInput,
  loyerAnnuelInitial: number,
  chargesAnnuellesInitiales: number,
  mensualiteTotale: number,
  montantEmprunte: number,
  valeurBienRevalorisee: number,
  fraisAgenceCalcule: number
): ProjectionAnnee[] {
  const projection: ProjectionAnnee[] = [];
  const tauxCroissanceBien = input.croissanceAnnuelle / 100;
  const tauxCroissanceLoyer = input.croissanceLoyer / 100;
  const annees = input.dureeDetention;
  const dureeCredit = input.dureeCredit;

  // Valeur de base pour la revente = prix d'achat (pour calcul plus-value des particuliers)
  // ou prix d'achat + travaux (pour valorisation IS)
  const prixAcquisition = input.prixAchat + fraisAgenceCalcule + input.fraisDossier + fraisNotaireValue(input);
  const valeurAcquisitionIS = input.prixAchat + fraisAgenceCalcule + input.fraisDossier + fraisNotaireValue(input);

  let cashFlowCumule = 0;

  for (let annee = 1; annee <= annees; annee++) {
    // Loyer avec croissance
    const loyerAnnuel = loyerAnnuelInitial * Math.pow(1 + tauxCroissanceLoyer, annee - 1);
    const charges = chargesAnnuellesInitiales * Math.pow(1 + tauxCroissanceLoyer * 0.5, annee - 1);

    // Mensualité de crédit (0 si prêt terminé)
    const mensualite = annee <= dureeCredit ? mensualiteTotale * 12 : 0;

    // Fiscalité recalculée chaque année (loyers et charges évoluent)
    const { totalFiscaliteAnnuelle: fiscaliteAnnee } = computeFiscaliteAnnuelle(input, loyerAnnuel, loyerAnnuel - charges, charges);
    const cashFlowAnnuel = loyerAnnuel - charges - mensualite - fiscaliteAnnee;
    cashFlowCumule += cashFlowAnnuel;

    // Valeur du bien avec croissance
    const valeurBien = valeurBienRevalorisee * Math.pow(1 + tauxCroissanceBien, annee);

    // Capital restant dû
    const capitalRestant = capitalRestantDu(montantEmprunte, input.tauxInteret, dureeCredit, annee);

    // Plus-value brute
    const plusValueBrute = valeurBien - prixAcquisition - capitalRestant;

    // Fiscalité à la revente
    let plusValueImposee = 0;
    let impotPlusValue = 0;

    if (input.structureJuridique === 'sci_is' || input.structureJuridique === 'sarl_famille') {
      // Plus-value professionnelle IS : (valeur de vente - VNC)
      // VNC = prix d'achat + travaux - amortissements cumulés
      const amortissementCumule = input.regimeFiscal === 'lmnp_reel'
        ? ((input.prixAchat * 0.8) / 30 + input.montantTravaux / 10) * Math.min(annee, 30)
        : 0;
      const vnc = Math.max(0, valeurAcquisitionIS + input.montantTravaux - amortissementCumule);
      plusValueImposee = Math.max(0, valeurBien - vnc);
      impotPlusValue = plusValueImposee * (TAUX_IS / 100);
    } else {
      // Plus-value des particuliers (nom propre, SCI IR)
      const abattementIR = getAbattementIR(annee);
      const abattementPS = getAbattementPS(annee);

      // Plus-value imposable IR
      const pvImpIR = Math.max(0, plusValueBrute * (1 - abattementIR));
      // Plus-value imposable PS
      const pvImpPS = Math.max(0, plusValueBrute * (1 - abattementPS));

      const impotIR = pvImpIR * (input.tmi / 100);
      const impotPS = pvImpPS * (PRELEVEMENTS_SOCIAUX / 100);

      plusValueImposee = pvImpIR;
      impotPlusValue = impotIR + impotPS;
    }

    const plusValueNette = plusValueBrute - impotPlusValue;

    // Patrimoine net = valeur bien - capital restant dû + cash-flow cumulé + plus-value nette (si revente)
    const patrimoine = valeurBien - capitalRestant + cashFlowCumule;

    projection.push({
      annee,
      loyerAnnuel,
      mensualiteCredit: mensualite,
      cashFlowAnnuel,
      cashFlowCumule,
      valeurBien,
      capitalRestantDu: capitalRestant,
      plusValueBrute,
      plusValueImposee,
      impotPlusValue,
      plusValueNette,
      patrimoine,
    });
  }

  return projection;
}

function fraisNotaireValue(input: SimulationInput): number {
  return (input.prixAchat * input.tauxNotaire) / 100;
}

// === Tri (Taux de Rendement Interne) simplifié ===
// Calcule le TRI sur la durée de détention en considérant :
// - Investissement initial négatif (apport + frais)
// - Cash-flows annuels
// - Valeur de revente nette à la fin
function computeTRI(input: SimulationInput, projection: ProjectionAnnee[], _montantEmprunte: number): number {
  const apportTotal = input.apport + input.fraisDossier;
  if (apportTotal <= 0 || projection.length === 0) return 0;

  const derniere = projection[projection.length - 1];
  const valeurReventeNette = derniere.valeurBien - derniere.capitalRestantDu - derniere.impotPlusValue;

  // Flux : -apport initial, puis cash-flows annuels, puis valeur de revente à la fin
  const flux: number[] = [-apportTotal];
  for (const p of projection) {
    if (p.annee === derniere.annee) {
      flux.push(p.cashFlowAnnuel + valeurReventeNette);
    } else {
      flux.push(p.cashFlowAnnuel);
    }
  }

  // Vérification de cohérence : si tous les flux sont positifs ou tous négatifs, pas de TRI valide
  const hasPositive = flux.some((f) => f > 0);
  const hasNegative = flux.some((f) => f < 0);
  if (!hasPositive || !hasNegative) return 0;

  // Calcul du TRI par méthode bisection — robuste, ne diverge jamais
  // On cherche r tel que NPV(flux, r) = 0, avec r dans [-0.99, 10]
  const npv = (r: number): number => {
    let sum = 0;
    for (let t = 0; t < flux.length; t++) {
      sum += flux[t] / Math.pow(1 + r, t);
    }
    return sum;
  };

  let lo = -0.99;
  let hi = 10;
  let tri = 0;

  for (let iter = 0; iter < 200; iter++) {
    tri = (lo + hi) / 2;
    const val = npv(tri);
    if (Math.abs(val) < 0.01) break;
    if (val > 0) {
      lo = tri;
    } else {
      hi = tri;
    }
  }

  // Clamp final : un TRI réaliste pour de l'immobilier est entre -99% et 1000%
  const triPct = tri * 100;
  if (!isFinite(triPct) || Math.abs(triPct) > 1000) return 0;
  return triPct;
}

// === TRI à une année donnée (pour les horizons 5, 10, 15 ans) ===
function computeTRIAtYear(input: SimulationInput, projection: ProjectionAnnee[], _montantEmprunte: number, horizon: number): number {
  if (projection.length === 0) return 0;
  const subProjection = projection.filter((p) => p.annee <= horizon);
  if (subProjection.length === 0) return 0;
  return computeTRI(input, subProjection, _montantEmprunte);
}

// === Comparateur fiscal entre régimes ===
function computeComparatifFiscal(
  input: SimulationInput,
  loyerAnnuelPercu: number,
  chargesAnnuelles: number
): { regime: string; impotAnnuel: number; cashFlowNet: number }[] {
  const tmi = input.tmi / 100;
  const ps = PRELEVEMENTS_SOCIAUX / 100;
  const loyerNetAvantImpot = loyerAnnuelPercu - chargesAnnuelles;

  const regimes: { regime: string; impotAnnuel: number; cashFlowNet: number }[] = [];

  // Micro-BIC (meublé)
  {
    const revenuImposable = Math.max(305, loyerAnnuelPercu * 0.5);
    const impot = revenuImposable * tmi + revenuImposable * ps;
    regimes.push({ regime: 'Micro-BIC', impotAnnuel: impot, cashFlowNet: loyerNetAvantImpot - impot });
  }

  // LMNP Réel (meublé)
  {
    const amort = (input.prixAchat * 0.8) / 30 + input.montantTravaux / 10;
    const revenuImposable = Math.max(0, loyerAnnuelPercu - chargesAnnuelles - amort);
    const impot = revenuImposable * tmi + revenuImposable * ps;
    regimes.push({ regime: 'LMNP Réel', impotAnnuel: impot, cashFlowNet: loyerNetAvantImpot - impot });
  }

  // Micro-Foncier (nu) — plafonné à 15 000 € de revenus fonciers annuels
  {
    const revenuImposable = loyerAnnuelPercu > 15000
      ? Math.max(0, loyerAnnuelPercu - chargesAnnuelles)
      : loyerAnnuelPercu * 0.7;
    const impot = revenuImposable * tmi + revenuImposable * ps;
    regimes.push({ regime: loyerAnnuelPercu > 15000 ? 'Micro-Foncier (bascule foncier réel)' : 'Micro-Foncier', impotAnnuel: impot, cashFlowNet: loyerNetAvantImpot - impot });
  }

  // Foncier Réel (nu)
  {
    const revenuImposable = Math.max(0, loyerAnnuelPercu - chargesAnnuelles);
    const impot = revenuImposable * tmi + revenuImposable * ps;
    regimes.push({ regime: 'Foncier Réel', impotAnnuel: impot, cashFlowNet: loyerNetAvantImpot - impot });
  }

  return regimes;
}

// === Formatage ===
export function formatEuro(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value) + ' %';
}

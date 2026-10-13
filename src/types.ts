export type MaPrimeRenovColor = 'Bleu' | 'Jaune' | 'Violet' | 'Rose';

export type PropertyState = 'ancien' | 'neuf';

export type MoeMode = 'percentage' | 'flat';

export type FraisAgenceMode = 'fixed' | 'percentage';

export type ChasseurMode = 'fixed' | 'percentage';

export type VacancyMode = 'percentage' | 'weeks';

export type CashFlowStatus = 'positive' | 'balanced' | 'negative';

// Nouveaux types pour les fonctionnalités avancées

export type StructureJuridique = 'nom_propre' | 'sci_ir' | 'sci_is' | 'sarl_famille';

export type TypeLocation = 'meublee' | 'nue';

export type RegimeFiscal =
  | 'micro_bic'
  | 'lmnp_reel'
  | 'micro_foncier'
  | 'foncier_reel';

export type DPELabel = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export type RegionFrance = string;

export type TypeBien = 'appartement' | 'maison';

export interface ProjectionAnnee {
  annee: number;
  loyerAnnuel: number;
  mensualiteCredit: number;
  cashFlowAnnuel: number;
  cashFlowCumule: number;
  valeurBien: number;
  capitalRestantDu: number;
  plusValueBrute: number;
  plusValueImposee: number;
  impotPlusValue: number;
  plusValueNette: number;
  patrimoine: number;
}

export interface SimulationInput {
  // Profil investisseur
  revenuFiscalReference: number;
  nombrePersonnes: number;
  region: 'idf' | 'province';
  simulerSubventions: boolean;
  typeRenovation: 'geste' | 'globale';
  simulerEcoPTZ: boolean;

  // Endettement actuel
  revenusMensuels: number;
  creditsEnCours: number;
  loyersPercusMensuels: number;

  // Bien
  typeBien: TypeBien;
  nombreChambres: number;
  negociationPct: number;

  // Acquisition & travaux
  prixAchat: number;
  etatBien: PropertyState;
  tauxNotaire: number;
  fraisAgence: number;
  fraisDossier: number;
  montantTravaux: number;
  travauxEnergetiques: number;
  auditEnergetique: number;
  moeMode: MoeMode;
  moePourcentage: number;
  moeForfait: number;

  // Chasseur de biens
  chasseurActif: boolean;
  chasseurMode: ChasseurMode;
  chasseurPourcentage: number;
  chasseurForfait: number;

  // Financement
  apport: number;
  dureeCredit: number;
  tauxInteret: number;
  tauxAssurance: number;

  // Revenus & charges
  loyerMensuel: number;
  chargesNonRecuperables: number;
  taxeFonciere: number;
  assurancePNO: number;
  vacanceMode: VacancyMode;
  vacancePourcentage: number;
  vacanceSemaines: number;
  fraisGestion: number;

  // Structure juridique & fiscalité
  structureJuridique: StructureJuridique;
  typeLocation: TypeLocation;
  regimeFiscal: RegimeFiscal;
  tmi: number;
  surface: number;

  // DPE & valorisation verte
  dpeActuel: DPELabel;
  dpeCible: DPELabel;

  // Revente & projection
  croissanceAnnuelle: number;
  dureeDetention: number;
  croissanceLoyer: number;

  // Aide au calcul des loyers
  regionLoyer: RegionFrance;
  ville: string;
  quartier: string;
  loyerM2Personnalise: number;

  // Frais d'agence
  fraisAgenceMode: FraisAgenceMode;
  fraisAgencePourcentage: number;

  // Importation annonce
  lienAnnonce: string;
  folder?: string;
}

export interface SimulationResults {
  fraisNotaire: number;
  coutTotalProjet: number;
  coutMoe: number;
  montantSubventions: number;
  montantEcoPTZ: number;
  resteAFinancer: number;
  montantEmprunte: number;
  mensualiteCredit: number;
  mensualiteAssurance: number;
  mensualiteTotale: number;
  loyerAnnuelBrut: number;
  loyerAnnuelNet: number;
  chargesAnnuellesTotales: number;
  cashFlowMensuelBrut: number;
  cashFlowMensuelNet: number;
  rentabiliteBrute: number;
  rentabiliteNette: number;
  cashFlowStatus: CashFlowStatus;
  profilAide: MaPrimeRenovColor;

  // Fiscalité
  revenuImposableAnnuel: number;
  impotAnnuel: number;
  prelevementsSociaux: number;
  totalFiscaliteAnnuelle: number;
  cashFlowApresImpot: number;
  rentabiliteApresImpot: number;
  amortissementAnnuel: number;

  // DPE & valorisation
  dpeDecoteActuelle: number;
  dpeSurcoteCible: number;
  gainValorisationVerte: number;
  valeurBienRevalorisee: number;

  // Projection revente
  projection: ProjectionAnnee[];
  plusValueBruteRevente: number;
  plusValueImposeeRevente: number;
  impotPlusValueRevente: number;
  plusValueNetteRevente: number;
  patrimoineFinal: number;
  tri: number;

  // Aide loyers
  loyerMinSuggere: number;
  loyerMaxSuggere: number;
  loyerEstimeQuartier: number;
  loyerM2Quartier: number;
  fraisAgenceCalcule: number;
  coutAudit: number;
  chasseurHonoraires: number;

  // Comparateur fiscal
  comparatifFiscal: { regime: string; impotAnnuel: number; cashFlowNet: number }[];

  // TRI multi-horizons
  tri5: number;
  tri10: number;
  tri15: number;
}

export interface SavedSimulation {
  id: string;
  name: string;
  date: string;
  input: SimulationInput;
  results: SimulationResults;
  folder?: string;
}

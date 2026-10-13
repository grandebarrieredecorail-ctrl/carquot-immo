import type { MaPrimeRenovColor, DPELabel, StructureJuridique, TypeLocation, RegimeFiscal, RegionFrance, SimulationInput, FraisAgenceMode, ChasseurMode } from './types';

// Barèmes MaPrimeRénov' 2024 — seuils de RFR selon la composition du foyer
type Thresholds = {
  Bleu: number;
  Jaune: number;
  Violet: number;
  Rose: number;
};

const thresholdsIDF: Record<number, Thresholds> = {
  1: { Bleu: 28473, Jaune: 36977, Violet: 46664, Rose: Infinity },
  2: { Bleu: 41745, Jaune: 54133, Violet: 67746, Rose: Infinity },
  3: { Bleu: 50235, Jaune: 65159, Violet: 81597, Rose: Infinity },
  4: { Bleu: 58725, Jaune: 76184, Violet: 95449, Rose: Infinity },
  5: { Bleu: 67215, Jaune: 87210, Violet: 109300, Rose: Infinity },
};

const thresholdsProvince: Record<number, Thresholds> = {
  1: { Bleu: 19307, Jaune: 25005, Violet: 29148, Rose: Infinity },
  2: { Bleu: 28275, Jaune: 36570, Violet: 42571, Rose: Infinity },
  3: { Bleu: 33995, Jaune: 44040, Violet: 51281, Rose: Infinity },
  4: { Bleu: 39715, Jaune: 51511, Violet: 59991, Rose: Infinity },
  5: { Bleu: 45435, Jaune: 58981, Violet: 68700, Rose: Infinity },
};

function getThresholds(region: 'idf' | 'province', personnes: number): Thresholds {
  const table = region === 'idf' ? thresholdsIDF : thresholdsProvince;
  const n = Math.min(Math.max(personnes, 1), 5);
  return table[n] ?? table[5];
}

export function getMaPrimeRenovProfil(
  rfr: number,
  personnes: number,
  region: 'idf' | 'province'
): MaPrimeRenovColor {
  const t = getThresholds(region, personnes);
  if (rfr <= t.Bleu) return 'Bleu';
  if (rfr <= t.Jaune) return 'Jaune';
  if (rfr <= t.Violet) return 'Violet';
  return 'Rose';
}

export const subventionGlobale: Record<MaPrimeRenovColor, number> = {
  Bleu: 0.6,
  Jaune: 0.4,
  Violet: 0.25,
  Rose: 0.15,
};

export const subventionGeste: Record<MaPrimeRenovColor, number> = {
  Bleu: 0.35,
  Jaune: 0.25,
  Violet: 0.15,
  Rose: 0.1,
};

export const profilColors: Record<MaPrimeRenovColor, { bg: string; text: string; border: string; label: string }> = {
  Bleu: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', label: 'Bleu' },
  Jaune: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', label: 'Jaune' },
  Violet: { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-300', label: 'Violet' },
  Rose: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-300', label: 'Rose' },
};

// === DPE : décotes/surcotes par label ===
// Valeur d'impact relative au prix de marché (estimations moyennes 2024)
export const dpeImpact: Record<DPELabel, number> = {
  A: 0.05,   // +5 % surcote
  B: 0.03,   // +3 %
  C: 0.01,   // +1 %
  D: 0,      // neutre
  E: -0.03,  // -3 % décote
  F: -0.07,  // -7 %
  G: -0.12,  // -12 %
};

export const dpeColors: Record<DPELabel, string> = {
  A: 'bg-emerald-500',
  B: 'bg-emerald-400',
  C: 'bg-lime-400',
  D: 'bg-yellow-400',
  E: 'bg-orange-400',
  F: 'bg-orange-500',
  G: 'bg-red-500',
};

export const dpeLabels: DPELabel[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

// === TMI (Tranche Marginale d'Imposition) ===
export const tmiOptions = [
  { value: '0', label: '0 % — TMI non imposable' },
  { value: '11', label: '11 %' },
  { value: '30', label: '30 %' },
  { value: '41', label: '41 %' },
  { value: '45', label: '45 %' },
];

export const PRELEVEMENTS_SOCIAUX = 17.2; // %
export const TAUX_IS = 25; // % (IS 2024 simplifié)

// === Liens d'information officiels ===
export const infoLinks = {
  maPrimeRenov: 'https://france-renov.gouv.fr/aides-financieres/ma-prime-renov',
  ecoPTZ: 'https://france-renov.gouv.fr/aides-financieres/eco-pret-taux-zero',
  dpe: 'https://www.ecologie.gouv.fr/diagnostic-performance-energetique-dpe',
  dpeObs: 'https://www.observatoires-dpe.fr/',
  lmnp: 'https://www.impots.gouv.fr/particulier/loueur-meuble-non-professionnel-lmnp',
  microBic: 'https://www.impots.gouv.fr/professionnel/entreprise/luh-micro-bic',
  sciIr: 'https://www.service-public.fr/particuliers/vosdroits/F31816',
  sciIs: 'https://www.service-public.fr/professionnels-entreprises/vosdroits/F31816',
  sarlFamille: 'https://www.service-public.fr/professionnels-entreprises/vosdroits/F31493',
  foncierReel: 'https://www.impots.gouv.fr/particulier/regime-du-reel-foncier',
  plusValue: 'https://www.impots.gouv.fr/particulier/plus-value-immobiliere',
  tmi: 'https://www.economie.gouv.fr/particuliers/tranches-imposition-revenu-2024',
  tauxNotaire: 'https://www.notaires.fr/immobilier-fiscalit%C3%A9/frais-de-notaire-et-droits-de-mutation',
  croissanceBien: 'https://www.insee.fr/fr/statistiques/serie/001530391',
  croissanceLoyer: 'https://www.service-public.fr/particuliers/vosdroits/F1314',
  irl: 'https://www.insee.fr/fr/statistiques/serie/001530391',
};

// === Taux de crédit immobilier par durée (moyennes marché 2024) ===
export const tauxCreditParDuree: Record<number, number> = {
  10: 3.15,
  12: 3.30,
  15: 3.50,
  18: 3.58,
  20: 3.66,
  22: 3.70,
  25: 3.75,
  30: 3.95,
};

export function getTauxSuggere(duree: number): number {
  if (tauxCreditParDuree[duree] !== undefined) return tauxCreditParDuree[duree];
  const durees = Object.keys(tauxCreditParDuree).map(Number).sort((a, b) => a - b);
  const lo = durees.filter((d) => d <= duree).pop() ?? durees[0];
  const hi = durees.find((d) => d > duree) ?? durees[durees.length - 1];
  const tLo = tauxCreditParDuree[lo];
  const tHi = tauxCreditParDuree[hi];
  const ratio = hi === lo ? 0 : (duree - lo) / (hi - lo);
  return Math.round((tLo + (tHi - tLo) * ratio) * 100) / 100;
}

// === Structures juridiques ===
export const structureOptions: { value: StructureJuridique; label: string; description: string }[] = [
  { value: 'nom_propre', label: 'Nom Propre / Particulier', description: 'Achat en direct à titre personnel' },
  { value: 'sci_ir', label: "SCI à l'IR", description: "Société Civile Immobilière, imposition à l'IR" },
  { value: 'sci_is', label: "SCI à l'IS", description: "Société Civile Immobilière, imposition à l'IS" },
  { value: 'sarl_famille', label: 'SARL de Famille', description: 'SARL entre membres de la famille' },
];

export const typeLocationOptions: { value: TypeLocation; label: string }[] = [
  { value: 'meublee', label: 'Location meublée' },
  { value: 'nue', label: 'Location nue' },
];

// Régimes fiscaux disponibles selon le type de location
export const regimeFiscalOptions: Record<TypeLocation, { value: RegimeFiscal; label: string; description: string }[]> = {
  meublee: [
    { value: 'micro_bic', label: 'LMNP Micro-BIC', description: 'Abattement forfaitaire de 50 %' },
    { value: 'lmnp_reel', label: 'LMNP Réel', description: 'Déduction charges réelles + amortissement' },
  ],
  nue: [
    { value: 'micro_foncier', label: 'Micro-Foncier', description: 'Abattement forfaitaire de 30 %' },
    { value: 'foncier_reel', label: 'Foncier Réel', description: 'Déduction charges + déficit foncier' },
  ],
};

// === Loyer moyen par m² par région (estimations 2024) ===
// Loyers mensuels hors charges au m², pour appartement
export const loyerParRegion: Record<string, { nu: { min: number; max: number }; meuble: { min: number; max: number } }> = {
  'auvergne-rhone-alpes': { nu: { min: 10, max: 15 }, meuble: { min: 12, max: 18 } },
  'bourgogne-franche-comte': { nu: { min: 8, max: 12 }, meuble: { min: 10, max: 14 } },
  'bretagne': { nu: { min: 9, max: 13 }, meuble: { min: 11, max: 16 } },
  'centre-val-de-loire': { nu: { min: 9, max: 12 }, meuble: { min: 11, max: 15 } },
  'corse': { nu: { min: 10, max: 16 }, meuble: { min: 12, max: 20 } },
  'grand-est': { nu: { min: 9, max: 13 }, meuble: { min: 11, max: 16 } },
  'hauts-de-france': { nu: { min: 9, max: 13 }, meuble: { min: 11, max: 16 } },
  'ile-de-france': { nu: { min: 18, max: 30 }, meuble: { min: 22, max: 36 } },
  'normandie': { nu: { min: 9, max: 12 }, meuble: { min: 11, max: 15 } },
  'nouvelle-aquitaine': { nu: { min: 10, max: 15 }, meuble: { min: 12, max: 18 } },
  'occitanie': { nu: { min: 10, max: 15 }, meuble: { min: 12, max: 18 } },
  'pays-de-la-loire': { nu: { min: 10, max: 14 }, meuble: { min: 12, max: 17 } },
  'provence-alpes-cote-azur': { nu: { min: 12, max: 20 }, meuble: { min: 15, max: 24 } },
  'outre-mer': { nu: { min: 10, max: 16 }, meuble: { min: 12, max: 20 } },
};

export const regionFranceOptions: { value: RegionFrance; label: string }[] = [
  { value: 'auvergne-rhone-alpes', label: 'Auvergne-Rhône-Alpes' },
  { value: 'bourgogne-franche-comte', label: 'Bourgogne-Franche-Comté' },
  { value: 'bretagne', label: 'Bretagne' },
  { value: 'centre-val-de-loire', label: 'Centre-Val de Loire' },
  { value: 'corse', label: 'Corse' },
  { value: 'grand-est', label: 'Grand Est' },
  { value: 'hauts-de-france', label: 'Hauts-de-France' },
  { value: 'ile-de-france', label: 'Île-de-France' },
  { value: 'normandie', label: 'Normandie' },
  { value: 'nouvelle-aquitaine', label: 'Nouvelle-Aquitaine' },
  { value: 'occitanie', label: 'Occitanie' },
  { value: 'pays-de-la-loire', label: 'Pays de la Loire' },
  { value: 'provence-alpes-cote-azur', label: "Provence-Alpes-Côte d'Azur" },
  { value: 'outre-mer', label: 'Outre-Mer (DROM)' },
];

export function getLoyerSuggere(region: RegionFrance, typeLocation: TypeLocation, surface: number): { min: number; max: number } {
  const data = loyerParRegion[region] ?? loyerParRegion['auvergne-rhone-alpes'];
  const fourchette = typeLocation === 'meublee' ? data.meuble : data.nu;
  return {
    min: Math.round(fourchette.min * surface),
    max: Math.round(fourchette.max * surface),
  };
}

// === Villes et quartiers avec loyers au m² ===
export interface QuartierData {
  nom: string;
  loyerM2Nu: number;
  loyerM2Meuble: number;
}

export interface VilleData {
  nom: string;
  region: string;
  quartiers: QuartierData[];
}

export const villesData: VilleData[] = [
  {
    nom: 'Lyon',
    region: 'auvergne-rhone-alpes',
    quartiers: [
      { nom: 'Croix-Rousse', loyerM2Nu: 15, loyerM2Meuble: 18 },
      { nom: "Presqu'île", loyerM2Nu: 18, loyerM2Meuble: 22 },
      { nom: 'Confluence', loyerM2Nu: 16, loyerM2Meuble: 20 },
      { nom: 'Part-Dieu', loyerM2Nu: 14, loyerM2Meuble: 17 },
      { nom: 'Vaise', loyerM2Nu: 12, loyerM2Meuble: 15 },
      { nom: 'Gerland', loyerM2Nu: 13, loyerM2Meuble: 16 },
      { nom: 'Brotteaux', loyerM2Nu: 17, loyerM2Meuble: 21 },
    ],
  },
  {
    nom: 'Bordeaux',
    region: 'nouvelle-aquitaine',
    quartiers: [
      { nom: 'Chartrons', loyerM2Nu: 15, loyerM2Meuble: 18 },
      { nom: 'Centre-ville', loyerM2Nu: 17, loyerM2Meuble: 21 },
      { nom: 'Saint-Michel', loyerM2Nu: 13, loyerM2Meuble: 16 },
      { nom: 'Caudéran', loyerM2Nu: 14, loyerM2Meuble: 17 },
      { nom: 'Bastide', loyerM2Nu: 12, loyerM2Meuble: 15 },
      { nom: 'Mériadeck', loyerM2Nu: 15, loyerM2Meuble: 18 },
    ],
  },
  {
    nom: 'Marseille',
    region: 'provence-alpes-cote-azur',
    quartiers: [
      { nom: 'Le Panier', loyerM2Nu: 13, loyerM2Meuble: 16 },
      { nom: 'Castellane', loyerM2Nu: 14, loyerM2Meuble: 17 },
      { nom: 'Joliette', loyerM2Nu: 15, loyerM2Meuble: 18 },
      { nom: 'Endoume', loyerM2Nu: 16, loyerM2Meuble: 19 },
      { nom: 'La Joliette', loyerM2Nu: 15, loyerM2Meuble: 18 },
      { nom: 'Saint-Charles', loyerM2Nu: 12, loyerM2Meuble: 15 },
      { nom: 'Roucas-Blanc', loyerM2Nu: 16, loyerM2Meuble: 19 },
    ],
  },
  {
    nom: 'Paris',
    region: 'ile-de-france',
    quartiers: [
      { nom: '11e arr.', loyerM2Nu: 28, loyerM2Meuble: 33 },
      { nom: '18e arr.', loyerM2Nu: 24, loyerM2Meuble: 29 },
      { nom: '19e arr.', loyerM2Nu: 22, loyerM2Meuble: 27 },
      { nom: '20e arr.', loyerM2Nu: 23, loyerM2Meuble: 28 },
      { nom: '10e arr.', loyerM2Nu: 27, loyerM2Meuble: 32 },
      { nom: '13e arr.', loyerM2Nu: 23, loyerM2Meuble: 28 },
      { nom: '15e arr.', loyerM2Nu: 25, loyerM2Meuble: 30 },
    ],
  },
  {
    nom: 'Nantes',
    region: 'pays-de-la-loire',
    quartiers: [
      { nom: 'Centre-ville', loyerM2Nu: 14, loyerM2Meuble: 17 },
      { nom: 'Île de Nantes', loyerM2Nu: 13, loyerM2Meuble: 16 },
      { nom: 'Hauts-Pavés', loyerM2Nu: 13, loyerM2Meuble: 16 },
      { nom: 'Malakoff', loyerM2Nu: 12, loyerM2Meuble: 15 },
      { nom: 'Dervallières', loyerM2Nu: 11, loyerM2Meuble: 14 },
    ],
  },
  {
    nom: 'Toulouse',
    region: 'occitanie',
    quartiers: [
      { nom: 'Capitole', loyerM2Nu: 15, loyerM2Meuble: 18 },
      { nom: 'Saint-Cyprien', loyerM2Nu: 13, loyerM2Meuble: 16 },
      { nom: 'Les Carmes', loyerM2Nu: 16, loyerM2Meuble: 19 },
      { nom: 'Minimes', loyerM2Nu: 13, loyerM2Meuble: 16 },
      { nom: 'Rangueil', loyerM2Nu: 12, loyerM2Meuble: 15 },
    ],
  },
  {
    nom: 'Lille',
    region: 'hauts-de-france',
    quartiers: [
      { nom: 'Vieux-Lille', loyerM2Nu: 15, loyerM2Meuble: 18 },
      { nom: 'Wazemmes', loyerM2Nu: 13, loyerM2Meuble: 16 },
      { nom: 'Moulins', loyerM2Nu: 11, loyerM2Meuble: 14 },
      { nom: 'Bois-Blancs', loyerM2Nu: 12, loyerM2Meuble: 15 },
      { nom: 'Centre', loyerM2Nu: 14, loyerM2Meuble: 17 },
    ],
  },
  {
    nom: 'Montpellier',
    region: 'occitanie',
    quartiers: [
      { nom: 'Écusson', loyerM2Nu: 15, loyerM2Meuble: 18 },
      { nom: 'Antigone', loyerM2Nu: 14, loyerM2Meuble: 17 },
      { nom: 'Port Marianne', loyerM2Nu: 13, loyerM2Meuble: 16 },
      { nom: 'Les Cévennes', loyerM2Nu: 12, loyerM2Meuble: 15 },
    ],
  },
  {
    nom: 'Strasbourg',
    region: 'grand-est',
    quartiers: [
      { nom: 'Centre', loyerM2Nu: 14, loyerM2Meuble: 17 },
      { nom: 'Neudorf', loyerM2Nu: 12, loyerM2Meuble: 15 },
      { nom: 'Esplanade', loyerM2Nu: 13, loyerM2Meuble: 16 },
      { nom: 'Cronenbourg', loyerM2Nu: 11, loyerM2Meuble: 14 },
    ],
  },
  {
    nom: 'Rennes',
    region: 'bretagne',
    quartiers: [
      { nom: 'Centre', loyerM2Nu: 13, loyerM2Meuble: 16 },
      { nom: 'Sainte-Anne', loyerM2Nu: 12, loyerM2Meuble: 15 },
      { nom: 'Villejean', loyerM2Nu: 11, loyerM2Meuble: 14 },
      { nom: 'Thabor', loyerM2Nu: 14, loyerM2Meuble: 17 },
    ],
  },
  {
    nom: 'Nice',
    region: 'provence-alpes-cote-azur',
    quartiers: [
      { nom: 'Vieux-Nice', loyerM2Nu: 18, loyerM2Meuble: 22 },
      { nom: 'Cimiez', loyerM2Nu: 17, loyerM2Meuble: 21 },
      { nom: 'Liberation', loyerM2Nu: 15, loyerM2Meuble: 18 },
      { nom: 'Pasteur', loyerM2Nu: 14, loyerM2Meuble: 17 },
    ],
  },
];

export const villeOptions = villesData.map((v) => ({ value: v.nom, label: v.nom }));

export function getQuartiers(villeNom: string): QuartierData[] {
  const ville = villesData.find((v) => v.nom === villeNom);
  return ville?.quartiers ?? [];
}

export function getLoyerM2Quartier(villeNom: string, quartierNom: string, typeLocation: TypeLocation): number {
  const ville = villesData.find((v) => v.nom === villeNom);
  if (!ville) return 0;
  const quartier = ville.quartiers.find((q) => q.nom === quartierNom);
  if (!quartier) return 0;
  return typeLocation === 'meublee' ? quartier.loyerM2Meuble : quartier.loyerM2Nu;
}

export function getRegionFromVille(villeNom: string): string {
  const ville = villesData.find((v) => v.nom === villeNom);
  return ville?.region ?? 'auvergne-rhone-alpes';
}

// === Abattements pour durée de détention — plus-value des particuliers ===
// Sur l'IR : 6% par an à partir de la 5e année, 4% les 22 dernières années → 100% à 22 ans
// Sur les prélèvements sociaux : 1.65% par an à partir de la 5e année, 1.6% les 23 dernières, 9% les 5 dernières → 100% à 30 ans
export function getAbattementIR(anneesDetention: number): number {
  if (anneesDetention <= 5) return 0;
  if (anneesDetention >= 22) return 1;
  // 6% par an de l'année 6 à 21 (16 années × 6% = 96%), puis 4% les années suivantes
  const annees6pct = Math.min(anneesDetention - 5, 16);
  let abattement = annees6pct * 0.06;
  if (anneesDetention > 21) {
    abattement += (anneesDetention - 21) * 0.04;
  }
  return Math.min(abattement, 1);
}

export function getAbattementPS(anneesDetention: number): number {
  if (anneesDetention <= 5) return 0;
  if (anneesDetention >= 30) return 1;
  // 1.65% par an de l'année 6 à 21
  const annees1_65 = Math.min(anneesDetention - 5, 16);
  let abattement = annees1_65 * 0.0165;
  // 1.6% par an de l'année 22 à 24 (3 ans)
  if (anneesDetention >= 22) {
    const annees1_6 = Math.min(anneesDetention - 21, 3);
    abattement += annees1_6 * 0.016;
  }
  // 9% par an de l'année 25 à 30 (5 ans)
  if (anneesDetention >= 25) {
    const annees9 = Math.min(anneesDetention - 24, 5);
    abattement += annees9 * 0.09;
  }
  return Math.min(abattement, 1);
}

export const defaultInput: SimulationInput = {
  revenuFiscalReference: 0,
  nombrePersonnes: 1,
  region: 'province',
  simulerSubventions: false,
  typeRenovation: 'globale',
  simulerEcoPTZ: false,

  revenusMensuels: 0,
  creditsEnCours: 0,
  loyersPercusMensuels: 0,

  typeBien: 'appartement',
  nombreChambres: 0,
  negociationPct: 0,

  prixAchat: 0,
  etatBien: 'ancien',
  tauxNotaire: 7.5,
  fraisAgence: 0,
  fraisAgenceMode: 'fixed',
  fraisAgencePourcentage: 5,
  fraisDossier: 0,
  montantTravaux: 0,
  travauxEnergetiques: 0,
  auditEnergetique: 0,
  moeMode: 'percentage',
  moePourcentage: 10,
  moeForfait: 0,

  chasseurActif: false,
  chasseurMode: 'percentage',
  chasseurPourcentage: 3,
  chasseurForfait: 0,

  apport: 0,
  dureeCredit: 20,
  tauxInteret: 3.66,
  tauxAssurance: 0.3,

  loyerMensuel: 0,
  chargesNonRecuperables: 0,
  taxeFonciere: 0,
  assurancePNO: 0,
  vacanceMode: 'percentage',
  vacancePourcentage: 0,
  vacanceSemaines: 0,
  fraisGestion: 0,

  structureJuridique: 'nom_propre',
  typeLocation: 'meublee',
  regimeFiscal: 'micro_bic',
  tmi: 0,
  surface: 0,

  dpeActuel: 'D',
  dpeCible: 'D',

  croissanceAnnuelle: 2,
  dureeDetention: 10,
  croissanceLoyer: 1.5,

  regionLoyer: 'pays-de-la-loire',
  ville: 'Nantes',
  quartier: 'Centre',
  loyerM2Personnalise: 0,
  lienAnnonce: '',
};

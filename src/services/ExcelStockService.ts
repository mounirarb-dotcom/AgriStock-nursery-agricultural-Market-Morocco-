/**
 * ExcelStockService.ts
 * 
 * Service centralisé de gestion des bases de données Excel / Tableurs pour AgriStock Maroc.
 * Permet l'export de modèles types adaptés à chaque profil utilisateur, l'exportation
 * des stocks existants en fichier .xlsx, et l'analyse/insertion en lot (Bulk Import)
 * pour insérer des dizaines ou centaines de lots simultanément en toute conformité.
 */

import * as XLSX from 'xlsx';
import {
  sanitizeText,
  sanitizeNumber,
  globalClientRateLimiter,
} from '../utils/securityUtils';
import {
  NurseryLot,
  ProduceListing,
  FarmStandingListing,
  CarrierVehicle,
  MoroccanRegion,
  NurseryCategory,
  GrowthStage,
  ONSSAStatus,
  HealthStatus,
  ProduceCategory,
} from '../types';

export type ExcelStockType = 'nursery' | 'nursery_ornamental' | 'produce' | 'farm_standing' | 'carrier';

export interface ColumnDefinition {
  key: string;
  header: string;
  aliases: string[];
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'date';
  example: string | number;
  description: string;
  allowedValues?: string[];
}

export interface ParseResult<T> {
  type: ExcelStockType;
  totalRows: number;
  validCount: number;
  errorCount: number;
  items: T[];
  errors: { row: number; column?: string; message: string }[];
  warnings: { row: number; column?: string; message: string }[];
}

export const MOROCCAN_REGIONS_LIST: MoroccanRegion[] = [
  'Souss-Massa (Agadir, Taroudant, Chtouka)',
  'L\'Oriental (Berkane, Oujda, Nador)',
  'Gharb - Chrarda (Kénitra, Sidi Slimane)',
  'Fès - Meknès (Saïss, El Hajeb, Sefrou)',
  'Marrakech - Safi (Haouz, El Kelaâ)',
  'Béni Mellal - Khénifra (Tadla)',
  'Drâa - Tafilalet (Zagora, Errachidia)',
  'Tanger - Tétouan - Al Hoceïma (Loukkos, Larache)',
  'Casablanca - Settat & Doukkala',
];

// ---------------------------------------------------------------------------
// 1. Définition des schémas de variables par profil
// ---------------------------------------------------------------------------

export const NURSERY_COLUMNS: ColumnDefinition[] = [
  {
    key: 'batchNumber',
    header: 'Numéro de Lot',
    aliases: ['lot', 'n° lot', 'numéro lot', 'ref lot', 'code lot', 'batch'],
    required: true,
    type: 'string',
    example: 'LOT-2026-OLV-042',
    description: 'Identifiant unique du lot (ex: LOT-2026-OLV-042)',
  },
  {
    key: 'species',
    header: 'Espèce végétale',
    aliases: ['espece', 'espèce', 'culture', 'plante', 'type plante'],
    required: true,
    type: 'string',
    example: 'Olivier (Olea europaea)',
    description: 'Espèce botanique ou nom commun (ex: Olivier, Clémentinier, Palmier)',
  },
  {
    key: 'variety',
    header: 'Variété',
    aliases: ['variete', 'variété', 'cultivar'],
    required: true,
    type: 'string',
    example: 'Picholine Marocaine',
    description: 'Nom de la variété commerciale (ex: Picholine Marocaine, Nadorcott, Majhoul)',
  },
  {
    key: 'category',
    header: 'Catégorie Pépinière',
    aliases: ['categorie', 'catégorie', 'secteur'],
    required: false,
    type: 'string',
    example: 'Arbres Fruitiers (Agrumes, Olivier, Palmier...)',
    description: 'Arbres Fruitiers, Maraîchage, Ornementales, Petits Fruits, Porte-greffes...',
  },
  {
    key: 'rootstock',
    header: 'Porte-greffe',
    aliases: ['porte greffe', 'porte-greffe', 'sujet', 'pg'],
    required: false,
    type: 'string',
    example: 'Citrange Carrizo',
    description: 'Sujet ou porte-greffe utilisé (ex: Picholine franc, Carrizo, Volkameriana, M9)',
  },
  {
    key: 'propagationMethod',
    header: 'Mode de propagation',
    aliases: ['propagation', 'multiplication', 'methode propagation'],
    required: false,
    type: 'string',
    example: 'Bouturage',
    description: 'Semis, Bouturage, Greffage ou In Vitro',
    allowedValues: ['Semis', 'Bouturage', 'Greffage', 'In Vitro (Micropropagation)'],
  },
  {
    key: 'stage',
    header: 'Stade de croissance',
    aliases: ['stade', 'vegetation', 'etat croissance'],
    required: true,
    type: 'string',
    example: 'Prêt à la plantation (Commercialisable)',
    description: 'Semis / Germination, Greffage en cours, Sevrage & Élevage, Prêt à la plantation',
    allowedValues: [
      'Semis / Germination',
      'Greffage en cours',
      'Sevrage & Élevage',
      'Prêt à la plantation (Commercialisable)',
    ],
  },
  {
    key: 'quantityAvailable',
    header: 'Quantité Disponible',
    aliases: ['quantite disponible', 'qte dispo', 'stock disponible', 'quantité dispo', 'stock', 'qte'],
    required: true,
    type: 'number',
    example: 4500,
    description: 'Nombre de plants immédiatement commercialisables',
  },
  {
    key: 'quantityTotal',
    header: 'Quantité Totale',
    aliases: ['quantite totale', 'qte totale', 'total'],
    required: false,
    type: 'number',
    example: 5000,
    description: 'Nombre total de plants en pépinière (disponibles + réservés)',
  },
  {
    key: 'unitPriceMAD',
    header: 'Prix Unitaire (MAD)',
    aliases: ['prix unitaire', 'prix mad', 'prix', 'pu mad', 'prix / plant'],
    required: true,
    type: 'number',
    example: 18.5,
    description: 'Prix en Dirhams par plant individuel',
  },
  {
    key: 'containerType',
    header: 'Conteneur / Emballage',
    aliases: ['conteneur', 'support', 'pot', 'conditionnement', 'emballage'],
    required: false,
    type: 'string',
    example: 'Pots C3 (3 Litres)',
    description: 'Alvéoles 104 trous, Pots C3, Racines nues, Sachet polyéthylène, etc.',
  },
  {
    key: 'greenhouseLocation',
    header: 'Emplacement Serre / Parcelle',
    aliases: ['emplacement', 'serre', 'parcelle', 'bloc', 'localisation serre'],
    required: false,
    type: 'string',
    example: 'Serre 4 - Secteur Ombragé',
    description: 'Localisation physique dans l\'exploitation',
  },
  {
    key: 'seedingOrGraftDate',
    header: 'Date Semis ou Greffage',
    aliases: ['date semis', 'date greffage', 'date semis / greffage'],
    required: false,
    type: 'string',
    example: '2025-11-10',
    description: 'Format AAAA-MM-JJ (ex: 2025-11-10)',
  },
  {
    key: 'estimatedReadyDate',
    header: 'Date Disponibilité Estimée',
    aliases: ['date disponibilite', 'date pret', 'date livraison'],
    required: false,
    type: 'string',
    example: '2026-10-15',
    description: 'Format AAAA-MM-JJ (ex: 2026-10-15)',
  },
  {
    key: 'onssaStatus',
    header: 'Agrément ONSSA',
    aliases: ['onssa', 'statut onssa', 'agrement onssa', 'certification onssa', 'certificat onssa'],
    required: true,
    type: 'string',
    example: 'ONSSA Certifié (Catégorie Bleue)',
    description: 'ONSSA Certifié (Catégorie Bleue), ONSSA Standard Contrôlé (Catégorie Jaune), etc.',
    allowedValues: [
      'ONSSA Certifié (Catégorie Bleue)',
      'ONSSA Base (Catégorie Blanche)',
      'ONSSA Standard Contrôlé (Catégorie Jaune)',
      'En cours d\'homologation',
      'Conventionnel',
    ],
  },
  {
    key: 'phytosanitaryPassportNumber',
    header: 'N° Passeport Phytosanitaire',
    aliases: ['passeport', 'passeport phytosanitaire', 'n° passeport', 'code phytosanitaire'],
    required: false,
    type: 'string',
    example: 'ONSSA-MA-2026-PP-8842',
    description: 'Numéro officiel du passeport phytosanitaire ONSSA',
  },
  {
    key: 'healthStatus',
    header: 'État Sanitaire',
    aliases: ['etat sanitaire', 'sante', 'sanitaire'],
    required: false,
    type: 'string',
    example: 'Excellent',
    description: 'Excellent, Bon, À surveiller ou En traitement',
    allowedValues: ['Excellent', 'Bon', 'À surveiller', 'En traitement'],
  },
  {
    key: 'region',
    header: 'Région Maroc',
    aliases: ['region', 'région', 'zone', 'localisation'],
    required: true,
    type: 'string',
    example: 'Souss-Massa (Agadir, Taroudant, Chtouka)',
    description: 'Région agricole marocaine',
    allowedValues: MOROCCAN_REGIONS_LIST,
  },
  {
    key: 'lowStockThreshold',
    header: 'Seuil Alerte Stock Bas',
    aliases: ['seuil', 'seuil alerte', 'seuil stock bas', 'alerte stock'],
    required: false,
    type: 'number',
    example: 500,
    description: 'Déclenche une alerte quand le stock descend sous cette valeur',
  },
  {
    key: 'notes',
    header: 'Observations & Traçabilité',
    aliases: ['notes', 'observations', 'commentaire', 'details'],
    required: false,
    type: 'string',
    example: 'Plants vigoureux, lot indemne de Verticillium et Capnode.',
    description: 'Remarques techniques et observations agronomiques',
  },
];

// ---------------------------------------------------------------------------
// 1.1 Définition des variables spécifiques : PÉPINIÈRE ORNEMENTALE & PAYSAGE
// (Plantes d'ornement, Palmiers, Haies, Arbustes, Cactées, Grimpantes, Gazon)
// ---------------------------------------------------------------------------
export const NURSERY_ORNAMENTAL_COLUMNS: ColumnDefinition[] = [
  {
    key: 'batchNumber',
    header: 'N° de Lot (Traçabilité)',
    aliases: ['lot', 'n° lot', 'numéro lot', 'ref lot', 'code lot', 'batch', 'reference'],
    required: true,
    type: 'string',
    example: 'LOT-2026-ORN-015',
    description: 'Identifiant unique de traçabilité du lot ornemental',
  },
  {
    key: 'species',
    header: 'Espèce Botanique (Nom latin / commun)',
    aliases: ['espece', 'espèce', 'espece botanique', 'nom botanique', 'plante', 'culture'],
    required: true,
    type: 'string',
    example: 'Bougainvillea spectabilis (Bougainvillier)',
    description: 'Nom botanique scientifique et/ou nom commun usuel',
  },
  {
    key: 'variety',
    header: 'Variété / Cultivar / Teinte',
    aliases: ['variete', 'variété', 'cultivar', 'couleur', 'teinte', 'forme varietale'],
    required: true,
    type: 'string',
    example: 'Violet de San Diego / Pourpre',
    description: 'Nom du cultivar horticole ou nuance spécifique',
  },
  {
    key: 'ornamentalType',
    header: 'Catégorie Ornementale & Paysagère',
    aliases: ['type ornemental', 'type ornement', 'specialite', 'usage', 'categorie ornementale', 'type vegetal'],
    required: true,
    type: 'string',
    example: 'Plante grimpante',
    description: 'Arbre d\'alignement & ombrage, Arbuste & Haie décorative, Palmier, Yucca & Cycas, Cactée, Succulente & Agave, Plante grimpante, Vivace, Graminée & Couvre-sol, Gazon naturel en rouleaux',
    allowedValues: [
      'Arbre d\'alignement & ombrage',
      'Arbuste & Haie décorative',
      'Palmier, Yucca & Cycas',
      'Cactée, Succulente & Agave',
      'Plante grimpante',
      'Vivace, Graminée & Couvre-sol',
      'Gazon naturel en rouleaux',
    ],
  },
  {
    key: 'plantForm',
    header: 'Silhouette & Port de Plante',
    aliases: ['port', 'silhouette', 'forme', 'port plante', 'forme de conduite'],
    required: true,
    type: 'string',
    example: 'Grimpante sur tuteur / Bambou',
    description: 'Arbre Tige (tronc unique), Cépée (multi-troncs), Touffe / Buisson ramifié, Pyramide / Topiaire, Grimpante sur tuteur / Bambou, Rampant / Tapissant, Bonsaï d\'extérieur / Forme libre',
    allowedValues: [
      'Arbre Tige (tronc unique)',
      'Cépée (multi-troncs)',
      'Touffe / Buisson ramifié',
      'Pyramide / Topiaire',
      'Grimpante sur tuteur / Bambou',
      'Rampant / Tapissant',
      'Bonsaï d\'extérieur / Forme libre',
    ],
  },
  {
    key: 'plantHeight',
    header: 'Hauteur de la Plante (cm / m)',
    aliases: ['hauteur', 'taille', 'dimension', 'hauteur totale', 'ht'],
    required: true,
    type: 'string',
    example: '150-175 cm',
    description: 'Hauteur totale hors conteneur (ex: 40-60 cm, 80-100 cm, 125-150 cm, 150-175 cm, 2-2.5 m, 3-3.5 m, 4m+)',
  },
  {
    key: 'trunkCircumference',
    header: 'Calibre / Circonférence Tronc (si Arbre Tige)',
    aliases: ['calibre', 'circonference', 'force', 'tronc', 'calibre tige'],
    required: false,
    type: 'string',
    example: 'Calibre 12/14 cm',
    description: 'Circonférence en cm mesurée à 1m du sol pour arbres tiges (ex: Calibre 8/10, 10/12, 12/14, 14/16, 16/18, 20/25 cm)',
  },
  {
    key: 'palmStipeHeight',
    header: 'Hauteur du Stipe (si Palmier)',
    aliases: ['stipe', 'hauteur stipe', 'tronc palmier', 'bois palmier'],
    required: false,
    type: 'string',
    example: 'Stipe 1 m',
    description: 'Hauteur du stipe nettoyé sans les palmes (ex: Stipe 50 cm, Stipe 1 m, Stipe 1.5 m, Stipe 2 m+)',
  },
  {
    key: 'containerType',
    header: 'Conteneur & Conditionnement',
    aliases: ['conteneur', 'pot', 'conditionnement', 'litrage', 'support', 'contenance'],
    required: true,
    type: 'string',
    example: 'Conteneur C10 (10 Litres)',
    description: 'Volume du pot ou conditionnement : Godet, C3 (3L), C5 (5L), C10 (10L), C30 (30L), C70 (70L), C150, Motte grillagée, Racines nues, Rouleau m² (gazon)',
  },
  {
    key: 'quantityAvailable',
    header: 'Quantité Disponible (Unités/Pots)',
    aliases: ['quantite disponible', 'qte dispo', 'stock disponible', 'quantité dispo', 'stock', 'qte'],
    required: true,
    type: 'number',
    example: 450,
    description: 'Nombre de pots, sujets ou rouleaux immédiatement commercialisables',
  },
  {
    key: 'quantityTotal',
    header: 'Quantité Totale Élevée',
    aliases: ['quantite totale', 'qte totale', 'total'],
    required: false,
    type: 'number',
    example: 500,
    description: 'Quantité totale sous élevage dans l\'exploitation',
  },
  {
    key: 'unitPriceMAD',
    header: 'Prix Unitaire Vente (MAD HT)',
    aliases: ['prix unitaire', 'prix mad', 'prix', 'pu mad', 'prix / pot', 'prix / plant'],
    required: true,
    type: 'number',
    example: 65.0,
    description: 'Tarif unitaire professionnel en Dirhams (MAD)',
  },
  {
    key: 'sunExposure',
    header: 'Exposition Solaire Idéale',
    aliases: ['exposition', 'ensoleillement', 'soleil', 'exposition solaire'],
    required: false,
    type: 'string',
    example: 'Plein soleil',
    description: 'Plein soleil, Mi-ombre, Ombre',
    allowedValues: ['Plein soleil', 'Mi-ombre', 'Ombre'],
  },
  {
    key: 'waterRequirement',
    header: 'Besoin en Eau / Tolérance Sécheresse',
    aliases: ['besoin en eau', 'besoin eau', 'arrosage', 'secheresse', 'tolerance secheresse', 'xerophyte'],
    required: false,
    type: 'string',
    example: 'Faible (Xérophyte / Résistant sécheresse)',
    description: 'Faible (Xérophyte / Résistant sécheresse), Modéré, Élevé',
    allowedValues: [
      'Faible (Xérophyte / Résistant sécheresse)',
      'Modéré',
      'Élevé',
    ],
  },
  {
    key: 'foliageType',
    header: 'Type de Feuillage',
    aliases: ['feuillage', 'type feuillage', 'feuilles'],
    required: false,
    type: 'string',
    example: 'Persistant',
    description: 'Persistant (conserve ses feuilles en hiver), Caduc, Semi-persistant',
    allowedValues: ['Persistant', 'Caduc', 'Semi-persistant'],
  },
  {
    key: 'floweringSeason',
    header: 'Période de Floraison',
    aliases: ['floraison', 'periode floraison', 'saison floraison'],
    required: false,
    type: 'string',
    example: 'Presque toute l\'année (Mars à Novembre)',
    description: 'Période principale de floraison (ex: Printemps-Été, Toute l\'année, Automne, Hiver)',
  },
  {
    key: 'flowerColor',
    header: 'Couleur Florale Principale',
    aliases: ['couleur florale', 'couleur fleur', 'fleurs'],
    required: false,
    type: 'string',
    example: 'Violet Intense',
    description: 'Teinte dominante de la fleur (ex: Violet, Rose fuchsia, Blanc, Rouge, Jaune, Orange, Bleu lavande)',
  },
  {
    key: 'landscapeUsage',
    header: 'Utilisation Paysagère Recommandée',
    aliases: ['usage paysager', 'utilisation paysagere', 'destination', 'paysagiste', 'role paysager'],
    required: false,
    type: 'string',
    example: 'Habillage pergola, treillage, clôture fleurie, mur exposé sud',
    description: 'Conseil d\'aménagement : Haie brise-vue, Alignement voirie & avenues, Sujet spécimen isolé, Massif & rocaille, Bacs & terrasses, Talus couvre-sol',
  },
  {
    key: 'stage',
    header: 'Stade de Développement',
    aliases: ['stade', 'vegetation', 'etat', 'maturite'],
    required: false,
    type: 'string',
    example: 'Prêt à la plantation (Commercialisable)',
    description: 'Jeune plant / Enracinement, Élevage en pépinière / Rempoté, Prêt à la plantation (Commercialisable), Sujet d\'exception / Grand spécimen',
    allowedValues: [
      'Jeune plant / Enracinement',
      'Élevage en pépinière / Rempoté',
      'Prêt à la plantation (Commercialisable)',
      'Sujet d\'exception / Grand spécimen',
    ],
  },
  {
    key: 'region',
    header: 'Région de Culture (Pépinière)',
    aliases: ['region', 'région', 'zone', 'localisation', 'terroir'],
    required: false,
    type: 'string',
    example: 'Souss-Massa (Agadir, Taroudant, Chtouka)',
    description: 'Région marocaine de production (acclimatation locale garantie)',
    allowedValues: MOROCCAN_REGIONS_LIST,
  },
  {
    key: 'greenhouseLocation',
    header: 'Emplacement Pépinière / Aire d\'élevage',
    aliases: ['emplacement', 'serre', 'aire', 'parcelle', 'zone elevage'],
    required: false,
    type: 'string',
    example: 'Plateforme Conteneurs Plein Vent - Allée 3',
    description: 'Localisation physique des conteneurs dans l\'exploitation',
  },
  {
    key: 'onssaStatus',
    header: 'Statut Sanitaire & Agréments',
    aliases: ['onssa', 'statut onssa', 'statut sanitaire', 'agrement'],
    required: false,
    type: 'string',
    example: 'Pépinière Déclarée & Contrôlée',
    description: 'Pépinière Déclarée & Contrôlée, Contrôle phytosanitaire régulier, Certifié exempt ravageurs',
  },
  {
    key: 'phytosanitaryPassportNumber',
    header: 'N° Passeport Phytosanitaire / Registre',
    aliases: ['passeport', 'passeport phytosanitaire', 'numero passeport', 'n° passeport'],
    required: false,
    type: 'string',
    example: 'PASS-PP-ORN-2026-118',
    description: 'Numéro officiel de suivi phytosanitaire',
  },
  {
    key: 'lowStockThreshold',
    header: 'Seuil Alerte Stock Bas',
    aliases: ['seuil', 'seuil alerte', 'seuil stock bas', 'alerte stock'],
    required: false,
    type: 'number',
    example: 50,
    description: 'Déclenche une alerte quand le stock descend sous cette valeur',
  },
  {
    key: 'notes',
    header: 'Conseils Agronomiques & Entretien Paysager',
    aliases: ['notes', 'remarques', 'conseils', 'entretien', 'reprise'],
    required: false,
    type: 'string',
    example: 'Excellente reprise racinaire, pailler le pied lors des fortes chaleurs, résiste aux embruns.',
    description: 'Recommandations pour les paysagistes, promoteurs, architectes et jardiniers',
  },
];

export const PRODUCE_COLUMNS: ColumnDefinition[] = [
  {
    key: 'title',
    header: 'Titre de l\'Offre',
    aliases: ['titre', 'produit', 'designation', 'nom produit', 'libelle'],
    required: true,
    type: 'string',
    example: 'Tomates Rondes Grappe Export - Souss Primeurs',
    description: 'Description claire du lot de récolte ou produit',
  },
  {
    key: 'category',
    header: 'Catégorie Produit',
    aliases: ['categorie', 'catégorie', 'type produit'],
    required: true,
    type: 'string',
    example: 'Légume',
    description: 'Fruit, Légume, Plants & Pépinière, Élevage & Bétail, Fourrage & Intrants',
    allowedValues: [
      'Fruit',
      'Légume',
      'Plants & Pépinière',
      'Élevage & Bétail',
      'Fourrage & Intrants',
    ],
  },
  {
    key: 'variety',
    header: 'Variété',
    aliases: ['variete', 'variété', 'cultivar'],
    required: true,
    type: 'string',
    example: 'Tomate Ronde Reva / Beaufort',
    description: 'Variété agronomique précise',
  },
  {
    key: 'listingIntent',
    header: 'Sens de la Transaction',
    aliases: ['sens', 'type', 'vente ou achat', 'intention', 'mode', 'sens de l\'offre', 'offre ou demande'],
    required: false,
    type: 'string',
    example: 'Vente (Vendeur)',
    description: 'Vente (Vendeur) ou Achat (Acheteur)',
    allowedValues: ['Vente (Vendeur)', 'Achat (Acheteur)', 'Vente', 'Achat', 'Offre de Vente (Vendeur)', 'Demande d\'Achat (Acheteur)'],
  },
  {
    key: 'region',
    header: 'Région Maroc',
    aliases: ['region', 'région'],
    required: true,
    type: 'string',
    example: 'Souss-Massa (Agadir, Taroudant, Chtouka)',
    description: 'Bassin de production marocain',
    allowedValues: MOROCCAN_REGIONS_LIST,
  },
  {
    key: 'locationCity',
    header: 'Ville / Commune',
    aliases: ['ville', 'commune', 'localite', 'emplacement'],
    required: true,
    type: 'string',
    example: 'Chtouka Aït Baha',
    description: 'Ville ou commune de l\'exploitation ou entrepôt',
  },
  {
    key: 'quantityAvailable',
    header: 'Volume / Quantité en Stock',
    aliases: ['quantite', 'quantité', 'volume', 'stock', 'tonnage'],
    required: true,
    type: 'number',
    example: 25,
    description: 'Volume total disponible pour la transaction',
  },
  {
    key: 'unit',
    header: 'Unité de Mesure',
    aliases: ['unite', 'unité', 'mesure'],
    required: true,
    type: 'string',
    example: 'Tonnes',
    description: 'Tonnes, Kg, Caisses (10kg), Palettes, Plants, Têtes / Bêtes, Bottes',
    allowedValues: ['Tonnes', 'Kg', 'Caisses (10kg)', 'Palettes', 'Plants', 'Têtes / Bêtes', 'Bottes'],
  },
  {
    key: 'minOrderQuantity',
    header: 'Commande Minimum',
    aliases: ['commande min', 'min commande', 'qte min', 'minimum'],
    required: false,
    type: 'number',
    example: 2,
    description: 'Quantité minimale par commande',
  },
  {
    key: 'pricePerUnitMAD',
    header: 'Prix Unitaire (MAD)',
    aliases: ['prix', 'prix unitaire', 'pu', 'prix mad', 'prix unitaire mad'],
    required: true,
    type: 'number',
    example: 4800,
    description: 'Prix en Dirhams par unité choisie (ex: 4800 MAD/Tonne ou 4.80 MAD/kg)',
  },
  {
    key: 'priceType',
    header: 'Modalité de Prix',
    aliases: ['type prix', 'modalite prix', 'incoterm'],
    required: false,
    type: 'string',
    example: 'Départ ferme (Sortie de champ)',
    description: 'Départ ferme (Sortie de champ), Rendu marché de gros, Prix négociable',
    allowedValues: [
      'Départ ferme (Sortie de champ)',
      'Rendu marché de gros',
      'Prix négociable',
      'Budget max achat',
    ],
  },
  {
    key: 'calibre',
    header: 'Calibre / Classe',
    aliases: ['calibre', 'classe', 'triage'],
    required: false,
    type: 'string',
    example: 'Calibre 1 (54-58mm) Extra',
    description: 'Calibre, catégorie qualitative (ex: 54-58mm, Extra, Catégorie I)',
  },
  {
    key: 'packaging',
    header: 'Conditionnement',
    aliases: ['emballage', 'conditionnement', 'palettisation'],
    required: false,
    type: 'string',
    example: 'Caisses IFCO plastifiées',
    description: 'Caisses IFCO, Palettes Euro, Vrac benne, Bétaillère...',
  },
  {
    key: 'harvestDate',
    header: 'Date de Récolte',
    aliases: ['date recolte', 'recolte', 'date cueillette'],
    required: false,
    type: 'string',
    example: '2026-09-20',
    description: 'Format AAAA-MM-JJ',
  },
  {
    key: 'certifications',
    header: 'Certifications Sanitaires',
    aliases: ['certifications', 'labels', 'normes', 'agrements'],
    required: false,
    type: 'string',
    example: 'ONSSA Homologué, GlobalG.A.P, Export Ready',
    description: 'Séparer par virgules : ONSSA Homologué, GlobalG.A.P, Bio Maroc, IGP Maroc, Export Ready',
  },
  {
    key: 'batchNumber',
    header: 'N° Lot Traçabilité',
    aliases: ['lot', 'n° lot', 'traçabilite', 'code tracabilite'],
    required: false,
    type: 'string',
    example: 'LOT-PRD-2026-089',
    description: 'Numéro de lot ou d\'agrément station de conditionnement',
  },
  {
    key: 'sellerName',
    header: 'Nom Exploitation / Producteur',
    aliases: ['producteur', 'vendeur', 'exploitation', 'cooperative', 'nom vendeur'],
    required: true,
    type: 'string',
    example: 'Coopérative Maraîchère Chtouka Primeurs',
    description: 'Nom légal ou commercial de l\'exploitation',
  },
  {
    key: 'phone',
    header: 'Téléphone Mobile',
    aliases: ['telephone', 'phone', 'tel', 'mobile', 'gsm', 'whatsapp'],
    required: true,
    type: 'string',
    example: '+212 6 61 77 88 99',
    description: 'Numéro marocain avec indicatif (ex: +212 6 XX XX XX XX)',
  },
  {
    key: 'description',
    header: 'Description / Détails',
    aliases: ['description', 'details', 'commentaire'],
    required: false,
    type: 'string',
    example: 'Tomates fraîches cueillies au stade 3-4, idéales distribution ou export.',
    description: 'Informations complémentaires sur le lot',
  },
];

export const FARM_STANDING_COLUMNS: ColumnDefinition[] = [
  {
    key: 'title',
    header: 'Titre du Verger / Parcelle',
    aliases: ['titre', 'parcelle', 'verger', 'designation'],
    required: true,
    type: 'string',
    example: 'Verger Clémentiniers Nadorcott 12 Ha sur pied',
    description: 'Description claire de la culture sur pied',
  },
  {
    key: 'cropCategory',
    header: 'Catégorie Culture',
    aliases: ['categorie', 'culture', 'type culture'],
    required: true,
    type: 'string',
    example: 'Agrumes (Clémentines, Oranges...)',
    description: 'Agrumes, Olivier, Maraîchage Plein Champ, Rosacées, Céréales...',
    allowedValues: [
      'Agrumes (Clémentines, Oranges...)',
      'Olivier (Huile & Table)',
      'Maraîchage Plein Champ (Pastèque, Melon, Pomme de terre...)',
      'Rosacées (Pommiers, Pêchers, Abricotiers)',
      'Céréales & Légumineuses',
      'Autre culture',
    ],
  },
  {
    key: 'variety',
    header: 'Variété Principale',
    aliases: ['variete', 'variété'],
    required: true,
    type: 'string',
    example: 'Nadorcott Agréée',
    description: 'Variété plantée dans la parcelle',
  },
  {
    key: 'region',
    header: 'Région Maroc',
    aliases: ['region', 'région'],
    required: true,
    type: 'string',
    example: 'Souss-Massa (Agadir, Taroudant, Chtouka)',
    description: 'Région agricole',
    allowedValues: MOROCCAN_REGIONS_LIST,
  },
  {
    key: 'locationDetails',
    header: 'Localisation Précise',
    aliases: ['localisation', 'commune', 'adresse', 'situation'],
    required: true,
    type: 'string',
    example: 'Km 18 Route de Taroudant, Oulad Teïma',
    description: 'Accès et situation géographique de la ferme',
  },
  {
    key: 'surfaceHectares',
    header: 'Superficie (Hectares)',
    aliases: ['superficie', 'hectares', 'ha', 'surface'],
    required: true,
    type: 'number',
    example: 12,
    description: 'Nombre d\'hectares en culture',
  },
  {
    key: 'pricePerHectareMAD',
    header: 'Prix Forfait par Hectare (MAD/Ha)',
    aliases: ['prix par hectare', 'prix ha', 'prix/ha', 'prix mad/ha', 'forfait'],
    required: true,
    type: 'number',
    example: 45000,
    description: 'Prix forfaitaire par hectare en Dirhams',
  },
  {
    key: 'estimatedTotalYieldTonnes',
    header: 'Rendement Total Estimé (Tonnes)',
    aliases: ['rendement', 'tonnage total', 'estimation tonnes', 'rendement total'],
    required: false,
    type: 'number',
    example: 360,
    description: 'Volume total prévisionnel en tonnes',
  },
  {
    key: 'harvestReadyDate',
    header: 'Période / Date de Maturité',
    aliases: ['date maturite', 'maturite', 'date recolte', 'periode'],
    required: false,
    type: 'string',
    example: '2026-11-15',
    description: 'Date ou période d\'ouverture de cueillette (ex: 2026-11-15)',
  },
  {
    key: 'irrigationType',
    header: 'Système d\'Irrigation',
    aliases: ['irrigation', 'systeme irrigation', 'arrosage'],
    required: false,
    type: 'string',
    example: 'Goutte-à-goutte (Puits & Bassin)',
    description: 'Goutte-à-goutte, Gravitaire, Pivot, Pluvial',
    allowedValues: [
      'Goutte-à-goutte (Puits & Bassin)',
      'Gravitaire (Tour d\'eau)',
      'Pivot / Aspersion',
      'Bour (Pluvial)',
    ],
  },
  {
    key: 'pickingCondition',
    header: 'Conditions de Cueillette',
    aliases: ['conditions cueillette', 'conditions', 'cueillette'],
    required: false,
    type: 'string',
    example: 'Sur pied - Cueillette & transport à charge de l\'acheteur',
    description: 'Modalités de récolte négociées',
  },
  {
    key: 'sellerName',
    header: 'Propriétaire / Domaine',
    aliases: ['proprietaire', 'nom', 'domaine'],
    required: true,
    type: 'string',
    example: 'Domaine El Baraka Agricole',
    description: 'Nom du propriétaire ou de la société agricole',
  },
  {
    key: 'sellerPhone',
    header: 'Téléphone de Contact',
    aliases: ['telephone', 'phone', 'tel', 'mobile'],
    required: true,
    type: 'string',
    example: '+212 6 62 10 20 30',
    description: 'Contact direct pour visites de parcelles',
  },
  {
    key: 'description',
    header: 'Description & Visite',
    aliases: ['description', 'details'],
    required: false,
    type: 'string',
    example: 'Verger palissé, 800 arbres/ha, charge fruitière homogène, accès goudronné pour 38T.',
    description: 'Caractéristiques techniques et logistiques',
  },
];

export const CARRIER_COLUMNS: ColumnDefinition[] = [
  {
    key: 'plateNumber',
    header: 'Immatriculation Véhicule',
    aliases: ['immatriculation', 'matricule', 'plaque', 'camion'],
    required: true,
    type: 'string',
    example: '42-A-89211 (Agadir)',
    description: 'N° d\'immatriculation marocain officiel',
  },
  {
    key: 'vehicleType',
    header: 'Type de Véhicule',
    aliases: ['type', 'type vehicule', 'carrosserie'],
    required: true,
    type: 'string',
    example: 'camion_frigo_semi',
    description: 'camion_frigo_semi, camion_frigo_porteur, camion_plateau, camion_benne, fourgon_isotherme',
    allowedValues: [
      'camion_frigo_semi',
      'camion_frigo_porteur',
      'camion_plateau',
      'camion_benne',
      'fourgon_isotherme',
    ],
  },
  {
    key: 'capacityTonnes',
    header: 'Charge Utile (Tonnes)',
    aliases: ['charge utile', 'capacite', 'tonnage', 'capacite tonnes'],
    required: true,
    type: 'number',
    example: 24,
    description: 'Capacité de chargement maximale en tonnes',
  },
  {
    key: 'temperatureControlled',
    header: 'Contrôle Température (Oui/Non)',
    aliases: ['frigo', 'temperature', 'froid', 'temperature controlee'],
    required: false,
    type: 'boolean',
    example: 'Oui',
    description: 'Oui (Agrément ATP Frigorifique) ou Non',
  },
  {
    key: 'tempMinC',
    header: 'Température Min (°C)',
    aliases: ['temp min', 't min', 'degres min'],
    required: false,
    type: 'number',
    example: 2,
    description: 'Température minimale de consigne',
  },
  {
    key: 'tempMaxC',
    header: 'Température Max (°C)',
    aliases: ['temp max', 't max', 'degres max'],
    required: false,
    type: 'number',
    example: 12,
    description: 'Température maximale de consigne',
  },
  {
    key: 'driverName',
    header: 'Nom du Chauffeur',
    aliases: ['chauffeur', 'conducteur', 'nom chauffeur'],
    required: true,
    type: 'string',
    example: 'Mustapha El Amrani',
    description: 'Chauffeur titulaire',
  },
  {
    key: 'driverPhone',
    header: 'Téléphone Chauffeur',
    aliases: ['telephone chauffeur', 'tel chauffeur', 'gsm chauffeur'],
    required: true,
    type: 'string',
    example: '+212 6 61 23 45 67',
    description: 'Contact direct en cabine',
  },
  {
    key: 'gpsLocation',
    header: 'Base / Hub Logistique',
    aliases: ['base', 'hub', 'depot', 'ville attache'],
    required: false,
    type: 'string',
    example: 'Agadir Hub Logistique Chtouka',
    description: 'Ville ou plateforme d\'attache',
  },
  {
    key: 'availableRegions',
    header: 'Régions de Desserte Habituelle',
    aliases: ['regions', 'dessertes', 'lignes'],
    required: false,
    type: 'string',
    example: 'Souss-Massa, Casablanca, Marrakech, Tanger Med',
    description: 'Séparer par des virgules les régions desservies',
  },
];

// ---------------------------------------------------------------------------
// 2. Moteur d'exportation Excel (.xlsx) avec SheetJS
// ---------------------------------------------------------------------------

export class ExcelStockService {
  /**
   * Retourne la définition des colonnes pour un type de stock donné
   */
  public static getColumns(type: ExcelStockType): ColumnDefinition[] {
    switch (type) {
      case 'nursery_ornamental':
        return NURSERY_ORNAMENTAL_COLUMNS;
      case 'nursery':
        return NURSERY_COLUMNS;
      case 'produce':
        return PRODUCE_COLUMNS;
      case 'farm_standing':
        return FARM_STANDING_COLUMNS;
      case 'carrier':
        return CARRIER_COLUMNS;
      default:
        return PRODUCE_COLUMNS;
    }
  }

  /**
   * Titre lisible pour l'interface utilisateur
   */
  public static getTitle(type: ExcelStockType): string {
    switch (type) {
      case 'nursery_ornamental':
        return 'Pépinière Ornementale & Paysage (Plantes d\'Ornement, Palmiers, Arbustes & Gazon)';
      case 'nursery':
        return 'Pépinière Arboriculture & Fruitiers (Agrumes, Oliviers, Avocatiers & Porte-greffes)';
      case 'produce':
        return 'Récoltes & Maraîchage (Fruits, Légumes & Produits)';
      case 'farm_standing':
        return 'Vergers & Récoltes sur Pied (Vente par Hectares)';
      case 'carrier':
        return 'Logistique Fret & Flotte Frigorifique';
      default:
        return 'Base de données Stock';
    }
  }

  /**
   * Génère et télécharge un modèle Excel officiel pré-rempli avec des exemples réalistes
   */
  public static downloadTemplate(type: ExcelStockType, withSampleData = true): void {
    const columns = this.getColumns(type);

    // 1. Feuille principale de données
    const headers = columns.map(c => c.header);
    const dataRows: any[] = [headers];

    if (withSampleData) {
      const sampleRow1 = columns.map(c => c.example);
      dataRows.push(sampleRow1);

      // Deuxième ligne exemple réaliste supplémentaire
      if (type === 'nursery_ornamental') {
        dataRows.push([
          'LOT-2026-ORN-015',
          'Bougainvillea spectabilis (Bougainvillier)',
          'Violet de San Diego / Pourpre',
          'Plante grimpante',
          'Grimpante sur tuteur / Bambou',
          '150-175 cm',
          '',
          '',
          'Conteneur C10 (10 Litres)',
          450,
          500,
          65.0,
          'Plein soleil',
          'Faible (Xérophyte / Résistant sécheresse)',
          'Persistant',
          'Presque toute l\'année (Mars à Novembre)',
          'Violet Intense',
          'Habillage pergola, treillage, clôture fleurie, mur exposé sud',
          'Prêt à la plantation (Commercialisable)',
          'Souss-Massa (Agadir, Taroudant, Chtouka)',
          'Plateforme Conteneurs Plein Vent - Allée 3',
          'Pépinière Déclarée & Contrôlée',
          'PASS-PP-ORN-2026-118',
          50,
          'Excellente reprise racinaire, pailler le pied lors des fortes chaleurs, résiste aux embruns.',
        ]);
        dataRows.push([
          'LOT-2026-PLM-089',
          'Washingtonia robusta (Palmier du Mexique)',
          'Washingtonia Robusta Élevé',
          'Palmier, Yucca & Cycas',
          'Arbre Tige (tronc unique)',
          '3-3.5 m',
          '',
          'Stipe 1.5 m',
          'Conteneur C70 (70 Litres)',
          80,
          100,
          450.0,
          'Plein soleil',
          'Faible (Xérophyte / Résistant sécheresse)',
          'Persistant',
          'Été',
          'Crème',
          'Alignement grandes avenues, parcs hôteliers, villa haut standing',
          'Prêt à la plantation (Commercialisable)',
          'Marrakech - Safi (Haouz, El Kelaâ)',
          'Aire de Plein Vent Parcelle B2',
          'Contrôlé exempt Charançon Rouge (Rhynchophorus)',
          'PASS-ONSSA-PALM-MA-089',
          15,
          'Sujet acclimaté au climat chaud et aride, racines en motte conteneurisée.',
        ]);
        dataRows.push([
          'LOT-2026-ARB-044',
          'Jacaranda mimosifolia (Flamboyant bleu)',
          'Jacaranda Standard Tige',
          'Arbre d\'alignement & ombrage',
          'Arbre Tige (tronc unique)',
          '2.5-3 m',
          'Calibre 12/14 cm',
          '',
          'Conteneur C35 (35 Litres)',
          120,
          150,
          280.0,
          'Plein soleil',
          'Modéré',
          'Caduc',
          'Mai - Juin (Floraison spectaculaire mauve)',
          'Bleu Mauve / Lavande',
          'Arbre d\'ombrage voirie, parcs urbains, jardin d\'agrément',
          'Prêt à la plantation (Commercialisable)',
          'Gharb - Chrarda (Kénitra, Sidi Slimane)',
          'Allée Principale Pépinière Arbres Tiges',
          'Pépinière Agréée',
          'PASS-PP-ORN-2026-302',
          20,
          'Tuteurage quadripode obligatoire à la plantation.',
        ]);
        dataRows.push([
          'LOT-2026-HAE-061',
          'Nerium oleander (Laurier Rose)',
          'Titooni Rose Double',
          'Arbuste & Haie décorative',
          'Touffe / Buisson ramifié',
          '80-100 cm',
          '',
          '',
          'Conteneur C3 (3 Litres)',
          1500,
          2000,
          18.0,
          'Plein soleil',
          'Faible (Xérophyte / Résistant sécheresse)',
          'Persistant',
          'Mai à Octobre',
          'Rose Vif',
          'Haie occultante brise-vue le long des autoroutes et résidences',
          'Prêt à la plantation (Commercialisable)',
          'Casablanca - Settat & Doukkala',
          'Serre Ombragée 1',
          'Conforme',
          'PASS-PP-ORN-2026-061',
          200,
          'Arrosage léger régulier au départ, très résistant au vent marin.',
        ]);
      } else if (type === 'nursery') {
        dataRows.push([
          'LOT-2026-CIT-018',
          'Agrumes (Citrus)',
          'Clémentine Nadorcott Agréée',
          'Arbres Fruitiers (Agrumes, Olivier, Palmier...)',
          'Volkameriana',
          'Greffage',
          'Prêt à la plantation (Commercialisable)',
          3200,
          3500,
          24.0,
          'Sachet polyéthylène 4L',
          'Serre 2 - Bloc B',
          '2025-06-20',
          '2026-09-30',
          'ONSSA Certifié (Catégorie Bleue)',
          'ONSSA-MA-2026-PP-4419',
          'Excellent',
          'Souss-Massa (Agadir, Taroudant, Chtouka)',
          400,
          'Plants écussonnés vigoureux avec passeport bleu ONSSA.',
        ]);
      } else if (type === 'produce') {
        dataRows.push([
          'Agrumes Clémentines Nadorcott Calibre 1 Export',
          'Fruit',
          'Nadorcott',
          'Offre de Vente (Vendeur)',
          'L\'Oriental (Berkane, Oujda, Nador)',
          'Berkane',
          50,
          'Tonnes',
          5,
          6200,
          'Départ ferme (Sortie de champ)',
          'Calibre 1 (54-58mm)',
          'Palettes Euro en caisses télescopiques',
          '2026-10-15',
          'ONSSA Homologué, GlobalG.A.P, Export Ready',
          'LOT-BERK-2026-012',
          'Coopérative Agrumes Moulouya',
          '+212 6 63 44 55 66',
          'Clémentines à forte teneur en jus et brix élevé > 12°.',
        ]);
      }
    }

    const wsData = XLSX.utils.aoa_to_sheet(dataRows);

    // Ajustement de la largeur des colonnes
    wsData['!cols'] = columns.map(c => ({
      wch: Math.max(c.header.length + 4, String(c.example).length + 4, 18),
    }));

    // 2. Feuille explicative "Guide & Variables"
    const guideHeaders = ['Nom de la Colonne', 'Obligatoire ?', 'Type', 'Valeurs autorisées / Format', 'Description & Utilité'];
    const guideRows: any[] = [guideHeaders];
    columns.forEach(col => {
      guideRows.push([
        col.header,
        col.required ? 'OUI (Obligatoire)' : 'Non (Optionnel)',
        col.type,
        col.allowedValues ? col.allowedValues.join(' | ') : `Exemple : ${col.example}`,
        col.description,
      ]);
    });

    const wsGuide = XLSX.utils.aoa_to_sheet(guideRows);
    wsGuide['!cols'] = [{ wch: 30 }, { wch: 18 }, { wch: 12 }, { wch: 45 }, { wch: 55 }];

    // Création du classeur
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsData, 'Stocks_Lots');
    XLSX.utils.book_append_sheet(wb, wsGuide, 'Guide_Des_Variables');

    const fileName = `Modele_Excel_AgriStock_${String(type || 'stock').toUpperCase()}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  /**
   * Exporte les données de stocks existantes en fichier Excel téléchargeable
   */
  public static exportCurrentStock(type: ExcelStockType, items: any[]): void {
    const columns = this.getColumns(type);
    const headers = columns.map(c => c.header);
    const rows: any[] = [headers];

    items.forEach(item => {
      const row = columns.map(col => {
        let val = item[col.key];
        if (val === undefined || val === null || val === '') {
          if (item.ornamentalDetails && item.ornamentalDetails[col.key] !== undefined) {
            val = item.ornamentalDetails[col.key];
          }
        }
        if (Array.isArray(val)) {
          return val.join(', ');
        }
        if (typeof val === 'boolean') {
          return val ? 'Oui' : 'Non';
        }
        return val !== undefined && val !== null ? val : '';
      });
      rows.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = columns.map(c => ({ wch: Math.max(c.header.length + 4, 18) }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mes_Stocks_Actuels');

    const fileName = `AgriStock_Inventaire_${String(type || 'stock').toUpperCase()}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  /**
   * Parse et valide un fichier Excel/CSV téléversé par l'utilisateur
   */
  public static async parseUploadedFile<T = any>(
    file: File,
    type: ExcelStockType
  ): Promise<ParseResult<T>> {
    const columns = this.getColumns(type);

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = e => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });

          // Lecture de la première feuille
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Conversion en tableau brut de tableaux (header + lignes)
          const rawSheetData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: '',
            blankrows: false,
          });

          if (!rawSheetData || rawSheetData.length === 0) {
            resolve({
              type,
              totalRows: 0,
              validCount: 0,
              errorCount: 1,
              items: [],
              errors: [{ row: 1, message: 'Le fichier Excel est vide.' }],
              warnings: [],
            });
            return;
          }

          // Ligne d'entête
          const rawHeaders = (rawSheetData[0] || []).map(h =>
            String(h || '')
              .trim()
              .toLowerCase()
          );

          // Mapping automatique des colonnes par rapport aux aliases
          const colIndexMap = new Map<string, number>();

          columns.forEach(col => {
            const possibleNames = [
              col.header.toLowerCase(),
              col.key.toLowerCase(),
              ...col.aliases.map(a => a.toLowerCase()),
            ];

            const foundIdx = rawHeaders.findIndex(h =>
              possibleNames.some(p => h.includes(p) || p.includes(h))
            );

            if (foundIdx !== -1) {
              colIndexMap.set(col.key, foundIdx);
            }
          });

          // Vérification des colonnes obligatoires
          const missingRequiredCols = columns.filter(
            c => c.required && !colIndexMap.has(c.key)
          );

          const errors: { row: number; column?: string; message: string }[] = [];
          const warnings: { row: number; column?: string; message: string }[] = [];

          if (missingRequiredCols.length > 0) {
            warnings.push({
              row: 1,
              message: `Colonnes non détectées directement : ${missingRequiredCols
                .map(c => c.header)
                .join(', ')}. Les valeurs par défaut seront appliquées.`,
            });
          }

          // Traitement de chaque ligne
          const validItems: any[] = [];
          const dataRows = rawSheetData.slice(1);

          dataRows.forEach((row, rowIndex) => {
            const rowNumber = rowIndex + 2; // +1 pour header, +1 pour 1-indexed

            // Ignore les lignes complètement vides
            const isRowEmpty = row.every(val => val === '' || val === null || val === undefined);
            if (isRowEmpty) return;

            const item: any = {};
            let hasBlockingError = false;

            columns.forEach(col => {
              const colIdx = colIndexMap.get(col.key);
              let rawVal = colIdx !== undefined ? row[colIdx] : undefined;

              // Traitement des types
              if (rawVal === undefined || rawVal === null || String(rawVal).trim() === '') {
                if (col.required) {
                  // Fallback automatique si possible
                  if (col.key === 'batchNumber') {
                    item[col.key] = `LOT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
                    warnings.push({
                      row: rowNumber,
                      column: col.header,
                      message: `N° de lot généré automatiquement : ${item[col.key]}`,
                    });
                  } else if (col.key === 'region') {
                    item[col.key] = MOROCCAN_REGIONS_LIST[0];
                    warnings.push({
                      row: rowNumber,
                      column: col.header,
                      message: `Région par défaut assignée : ${item[col.key]}`,
                    });
                  } else if (col.key === 'unitPriceMAD') {
                    item[col.key] = 10;
                    warnings.push({
                      row: rowNumber,
                      column: col.header,
                      message: 'Prix unitaire manquant, fixé à 10 MAD par défaut.',
                    });
                  } else if (col.key === 'quantityAvailable') {
                    item[col.key] = 100;
                    warnings.push({
                      row: rowNumber,
                      column: col.header,
                      message: 'Quantité manquante, fixée à 100 par défaut.',
                    });
                  } else {
                    hasBlockingError = true;
                    errors.push({
                      row: rowNumber,
                      column: col.header,
                      message: `Champ obligatoire "${col.header}" manquant.`,
                    });
                  }
                } else {
                  // Optionnel vide
                  if (col.type === 'number') item[col.key] = 0;
                  else if (col.type === 'boolean') item[col.key] = false;
                  else item[col.key] = '';
                }
              } else {
                // Valeur présente -> validation & typage
                if (col.type === 'number') {
                  const cleanedNum = String(rawVal).replace(/\s/g, '').replace(',', '.');
                  const parsedNum = parseFloat(cleanedNum);
                  if (isNaN(parsedNum)) {
                    if (col.required) {
                      hasBlockingError = true;
                      errors.push({
                        row: rowNumber,
                        column: col.header,
                        message: `Valeur numérique invalide pour "${col.header}" : "${rawVal}".`,
                      });
                    } else {
                      item[col.key] = 0;
                    }
                  } else {
                    item[col.key] = parsedNum;
                  }
                } else if (col.type === 'boolean') {
                  const s = String(rawVal).trim().toLowerCase();
                  item[col.key] = s === 'oui' || s === 'true' || s === '1' || s === 'yes';
                } else {
                  // String (OWASP Sanitization: Prevent CSV/Formula injection & XSS)
                  let cleanStr = String(rawVal).trim();
                  // Strip leading formula injection characters (=, +, -, @, \t, \r)
                  if (/^[=+\-@\t\r]/.test(cleanStr)) {
                    cleanStr = cleanStr.replace(/^[=+\-@\t\r]+/, '');
                  }
                  // Sanitize HTML / scripts / null bytes
                  cleanStr = sanitizeText(cleanStr, 1000);
                  item[col.key] = cleanStr;
                }
              }
            });

            if (!hasBlockingError) {
              // Post-processing selon le type
              if (type === 'nursery_ornamental') {
                if (!item.quantityTotal && item.quantityAvailable) {
                  item.quantityTotal = item.quantityAvailable;
                }
                item.category = 'Plantes Ornementales & Espaces Verts (Palmiers, Bougainvilliers, Lauriers, Gazon...)';
                item.ornamentalDetails = {
                  ornamentalType: item.ornamentalType || 'Arbuste & Haie décorative',
                  plantForm: item.plantForm || 'Touffe / Buisson ramifié',
                  plantHeight: item.plantHeight || '80-100 cm',
                  trunkCircumference: item.trunkCircumference || undefined,
                  palmStipeHeight: item.palmStipeHeight || undefined,
                  sunExposure: item.sunExposure || 'Plein soleil',
                  waterRequirement: item.waterRequirement || 'Modéré',
                  foliageType: item.foliageType || 'Persistant',
                  floweringSeason: item.floweringSeason || '',
                  flowerColor: item.flowerColor || '',
                  landscapeUsage: item.landscapeUsage || '',
                };
                if (!item.stage) {
                  item.stage = 'Prêt à la plantation (Commercialisable)';
                }
                if (!item.onssaStatus) {
                  item.onssaStatus = 'Pépinière Déclarée & Contrôlée';
                }
                if (!item.healthStatus) {
                  item.healthStatus = 'Bon';
                }
                if (!item.treatments) {
                  item.treatments = [];
                }
                item.quantityReserved = item.quantityReserved || 0;
              } else if (type === 'nursery') {
                if (!item.quantityTotal && item.quantityAvailable) {
                  item.quantityTotal = item.quantityAvailable;
                }
                if (!item.category) {
                  item.category = 'Arbres Fruitiers (Agrumes, Olivier, Palmier...)';
                }
                if (!item.stage) {
                  item.stage = 'Prêt à la plantation (Commercialisable)';
                }
                if (!item.onssaStatus) {
                  item.onssaStatus = 'ONSSA Standard Contrôlé (Catégorie Jaune)';
                }
                if (!item.healthStatus) {
                  item.healthStatus = 'Bon';
                }
                if (!item.treatments) {
                  item.treatments = [];
                }
                item.quantityReserved = item.quantityReserved || 0;
              } else if (type === 'produce') {
                if (!item.unit) item.unit = 'Tonnes';
                if (!item.category) item.category = 'Légume';
                if (!item.priceType) item.priceType = 'Départ ferme (Sortie de champ)';
                if (!item.minOrderQuantity) item.minOrderQuantity = 1;
                if (!item.status) item.status = 'Disponible';

                // Transformation certifications string -> array
                if (typeof item.certifications === 'string') {
                  item.certifications = item.certifications
                    .split(',')
                    .map((s: string) => s.trim())
                    .filter(Boolean);
                } else if (!Array.isArray(item.certifications)) {
                  item.certifications = ['ONSSA Homologué'];
                }
              } else if (type === 'farm_standing') {
                if (!item.cropCategory) item.cropCategory = 'Agrumes (Clémentines, Oranges...)';
                if (!item.irrigationType) item.irrigationType = 'Goutte-à-goutte (Puits & Bassin)';
                if (!item.pickingCondition) {
                  item.pickingCondition = 'Sur pied - Cueillette & transport à charge de l\'acheteur';
                }
                if (!item.status) item.status = 'Disponible';
              } else if (type === 'carrier') {
                if (!item.vehicleType) item.vehicleType = 'camion_frigo_semi';
                if (!item.status) item.status = 'disponible';
                if (typeof item.availableRegions === 'string') {
                  item.availableRegions = item.availableRegions
                    .split(',')
                    .map((r: string) => r.trim())
                    .filter(Boolean);
                }
              }

              validItems.push(item);
            }
          });

          resolve({
            type,
            totalRows: dataRows.length,
            validCount: validItems.length,
            errorCount: errors.length,
            items: validItems as T[],
            errors,
            warnings,
          });
        } catch (err: any) {
          reject(new Error(`Échec de lecture du fichier Excel : ${err.message}`));
        }
      };

      reader.onerror = () => reject(new Error('Impossible de lire le fichier sélectionné.'));
      reader.readAsArrayBuffer(file);
    });
  }
}

export default ExcelStockService;

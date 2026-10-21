import { z } from 'zod';
import { MoroccanRegionEnum } from './userSchema';

export const ProduceCategoryEnum = z.enum([
  'Maraîchage & Légumes de Saison',
  'Agrumes & Vergers',
  'Fruits Rouges & Baies',
  'Fruits de Saison & Rosacées',
  'Céréales, Grains & Légumineuses',
  'Élevage & Bétail',
  'Plantes Aromatiques & Médicinales (PAM)',
  'Huile d\'Olive & Olives de Table',
  'Dattes & Produits Oasiens',
  'Fourrages & Nutrition Animale',
  'Arboriculture Fruitière',
  'Fleurs Coupées & Horticulture',
]);

export const ProduceUnitEnum = z.enum([
  'Kg',
  'Tonne',
  'Caisse',
  'Palette',
  'Unité / Pièce',
  'Botte',
  'Tête (Cheptel)',
  'Litre',
  'Sac 50kg',
  'Plateau',
]);

/**
 * Schéma de validation pour la création / modification d'une annonce de primeurs / récoltes
 */
export const ProduceListingInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Le titre de l\'offre doit comporter au moins 3 caractères')
    .max(120, 'Le titre ne peut dépasser 120 caractères'),
  category: z.string().min(2, 'Veuillez sélectionner une catégorie valide'),
  variety: z
    .string()
    .trim()
    .min(2, 'Veuillez préciser la variété (ex: Tomate Cerise, Clémentine Nadorcott, etc.)')
    .max(80, 'La variété ne peut dépasser 80 caractères'),
  region: MoroccanRegionEnum,
  locationCity: z.string().trim().max(80).optional(),
  quantityAvailable: z
    .number()
    .positive('La quantité disponible doit être strictement supérieure à 0')
    .max(10000000, 'Quantité maximale dépassée'),
  unit: z.string().min(1, 'L\'unité de mesure est requise'),
  minOrderQuantity: z
    .number()
    .positive('La quantité minimale doit être supérieure à 0')
    .default(1),
  pricePerUnitMAD: z
    .number()
    .positive('Le prix unitaire en Dirhams (MAD) doit être supérieur à 0')
    .max(10000000, 'Prix unitaire hors limites'),
  priceType: z.string().default('Départ ferme (Sortie de champ)'),
  calibre: z.string().trim().max(100).optional(),
  packaging: z.string().trim().max(100).optional(),
  harvestDate: z.string().trim().optional(),
  certifications: z.array(z.string()).default([]),
  sellerName: z
    .string()
    .trim()
    .min(2, 'Le nom du vendeur est requis'),
  sellerType: z.string().default('Agriculteur / Producteur'),
  phone: z
    .string()
    .trim()
    .min(9, 'Un numéro de téléphone de contact valide est requis (min. 9 chiffres)'),
  whatsapp: z.string().trim().optional(),
  description: z.string().trim().max(2000, 'La description ne peut dépasser 2000 caractères').optional(),
  imageUrl: z.string().url('URL d\'image invalide').optional().or(z.literal('')),
  additionalImages: z.array(z.string()).optional(),
  listingIntent: z.enum(['sell', 'buy']).default('sell'),
}).refine(
  (data) => data.minOrderQuantity <= data.quantityAvailable,
  {
    message: 'La quantité minimale de commande ne peut excéder la quantité totale disponible',
    path: ['minOrderQuantity'],
  }
);

/**
 * Schéma de validation pour un Lot de Pépinière certifié
 */
export const NurseryLotInputSchema = z.object({
  batchNumber: z
    .string()
    .trim()
    .min(3, 'Le numéro de lot doit comporter au moins 3 caractères (ex: LOT-2025-OLV-01)')
    .max(50, 'Numéro de lot trop long'),
  species: z
    .string()
    .trim()
    .min(2, 'L\'espèce botanique ou fruitière est requise (ex: Agrumes, Olivier, etc.)'),
  variety: z
    .string()
    .trim()
    .min(2, 'La variété ou cultivar est requis (ex: Picholine, Nadorcott, Hass)'),
  category: z.string().min(2, 'Catégorie de pépinière requise'),
  rootstock: z.string().trim().optional(),
  propagationMethod: z.enum(['Semis', 'Bouturage', 'Greffage', 'In Vitro (Micropropagation)']).default('Greffage'),
  stage: z.string().default('Prêt à la plantation (Commercialisable)'),
  quantityTotal: z
    .number()
    .int('La quantité doit être un nombre entier')
    .positive('La quantité totale doit être supérieure à 0'),
  quantityAvailable: z
    .number()
    .int('La quantité doit être un nombre entier')
    .min(0, 'La quantité disponible ne peut être négative'),
  quantityReserved: z
    .number()
    .int()
    .min(0, 'La quantité réservée ne peut être négative')
    .default(0),
  unitPriceMAD: z
    .number()
    .positive('Le prix unitaire en MAD par plant doit être supérieur à 0'),
  containerType: z.string().min(1, 'Type de conteneur requis (ex: Sachet 2L, Racine nue, Pot)'),
  greenhouseLocation: z.string().default('Serre Principale'),
  seedingOrGraftDate: z.string().min(4, 'Date de semis ou greffage requise'),
  estimatedReadyDate: z.string().min(4, 'Date de disponibilité requise'),
  onssaStatus: z.string().default('ONSSA Certifié (Catégorie Bleue)'),
  phytosanitaryPassportNumber: z
    .string()
    .trim()
    .min(3, 'N° de Passeport Phytosanitaire ONSSA ou N° de registre requis'),
  healthStatus: z.enum(['Excellent', 'Bon', 'À surveiller', 'En traitement']).default('Excellent'),
  region: MoroccanRegionEnum,
  treatments: z.array(z.any()).default([]),
  imageUrl: z.string().optional(),
}).refine(
  (data) => data.quantityAvailable <= data.quantityTotal,
  {
    message: 'La quantité disponible ne peut excéder la quantité totale du lot',
    path: ['quantityAvailable'],
  }
);

/**
 * Schéma de validation pour une vente de récolte sur pied (Dmana / Verger sur pied)
 */
export const FarmStandingListingInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Le titre de l\'offre sur pied doit comporter au moins 3 caractères'),
  variety: z
    .string()
    .trim()
    .min(2, 'Variété requise'),
  surfaceHectares: z
    .number()
    .positive('La superficie en hectares doit être supérieure à 0'),
  estimatedTonnage: z
    .number()
    .positive('Le tonnage estimé de récolte doit être supérieur à 0'),
  pricePerHectareMAD: z
    .number()
    .positive('Le prix estimé par hectare en MAD doit être supérieur à 0'),
  region: MoroccanRegionEnum,
  harvestWindow: z.string().min(2, 'Période estimée de cueillette requise'),
  sellerName: z.string().min(2, 'Nom de l\'exploitant requis'),
  sellerPhone: z.string().min(9, 'Téléphone requis'),
});

export type ProduceListingInputValidated = z.infer<typeof ProduceListingInputSchema>;
export type NurseryLotInputValidated = z.infer<typeof NurseryLotInputSchema>;
export type FarmStandingListingInputValidated = z.infer<typeof FarmStandingListingInputSchema>;

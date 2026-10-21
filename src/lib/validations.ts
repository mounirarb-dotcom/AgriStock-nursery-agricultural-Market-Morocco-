import { z } from 'zod';

/**
 * ---------------------------------------------------------------------------
 * REGIONS MAROCAINES ET RÔLES SUPPORTÉS
 * ---------------------------------------------------------------------------
 */
export const MoroccanRegionSchema = z.enum([
  'Souss-Massa (Agadir, Taroudant, Chtouka)',
  'L\'Oriental (Berkane, Oujda, Nador)',
  'Gharb - Chrarda (Kénitra, Sidi Slimane)',
  'Fès - Meknès (Saïss, El Hajeb, Sefrou)',
  'Marrakech - Safi (Haouz, El Kelaâ)',
  'Béni Mellal - Khénifra (Tadla)',
  'Drâa - Tafilalet (Zagora, Errachidia)',
  'Tanger - Tétouan - Al Hoceïma (Loukkos, Larache)',
  'Casablanca - Settat & Doukkala',
]);

export const UserRoleSchema = z.enum([
  'buyer',
  'seller',
  'nursery',
  'carrier',
  'admin',
]);

/**
 * ---------------------------------------------------------------------------
 * 1. SCHÉMA UTILISATEUR (USER SCHEMA)
 * Champs requis : name, email, role, phone (+ champs contextuels métier)
 * ---------------------------------------------------------------------------
 */
export const UserSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(2, 'Le nom doit comporter au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  email: z
    .string()
    .trim()
    .email('Adresse email invalide (ex: contact@domaine.ma)'),
  role: UserRoleSchema,
  phone: z
    .string()
    .trim()
    .min(9, 'Le numéro de téléphone doit comporter au moins 9 chiffres')
    .refine((val) => {
      // Nettoyage des espaces et tirets
      const digits = val.replace(/\D/g, '');
      // Format standard Maroc (9 à 12 chiffres avec ou sans indicatif 212)
      return digits.length >= 9 && digits.length <= 12;
    }, {
      message: 'Format de téléphone invalide (ex: 06 61 23 45 67 ou +212 661 234 567)',
    }),
  companyName: z
    .string()
    .trim()
    .max(120, 'Le nom de l\'entreprise ne peut pas dépasser 120 caractères')
    .optional()
    .or(z.literal('')),
  region: MoroccanRegionSchema.default('Casablanca - Settat & Doukkala'),
  whatsapp: z.string().trim().optional().or(z.literal('')),
  hasCompletedIdentification: z.boolean().default(false),
  verificationStatus: z.enum(['verified', 'pending_verification', 'rejected']).default('pending_verification'),
});

export const UserUpdateSchema = UserSchema.partial().omit({ id: true });

/**
 * ---------------------------------------------------------------------------
 * 2. SCHÉMA PRODUIT (PRODUCT SCHEMA)
 * Champs requis : name, category, price, quantity (+ champs agricoles essentiels)
 * ---------------------------------------------------------------------------
 */
export const BaseProductSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(2, 'Le nom du produit doit comporter au moins 2 caractères')
    .max(120, 'Le nom du produit ne peut pas dépasser 120 caractères'),
  category: z
    .string()
    .trim()
    .min(2, 'Veuillez sélectionner une catégorie valide'),
  price: z
    .number()
    .positive('Le prix unitaire en Dirhams (MAD) doit être strictement supérieur à 0')
    .max(10_000_000, 'Le prix dépasse la limite maximale autorisée'),
  quantity: z
    .number()
    .positive('La quantité disponible doit être strictement supérieure à 0')
    .max(10_000_000, 'La quantité dépasse la limite maximale autorisée'),
  unit: z
    .string()
    .trim()
    .default('Kg'),
  variety: z
    .string()
    .trim()
    .optional(),
  region: MoroccanRegionSchema.default('Souss-Massa (Agadir, Taroudant, Chtouka)'),
  sellerName: z
    .string()
    .trim()
    .min(2, 'Le nom du vendeur / producteur est obligatoire')
    .optional(),
  sellerPhone: z
    .string()
    .trim()
    .optional(),
  minOrderQuantity: z
    .number()
    .positive('La quantité minimale doit être supérieure à 0')
    .default(1),
  status: z
    .enum(['Disponible', 'Réservé', 'Vendu'])
    .default('Disponible'),
  description: z
    .string()
    .trim()
    .max(2000, 'La description ne peut pas dépasser 2000 caractères')
    .optional(),
  imageUrl: z
    .string()
    .url('Format d\'URL d\'image invalide')
    .optional()
    .or(z.literal('')),
  certifications: z
    .array(z.string())
    .default([]),
});

export const ProductSchema = BaseProductSchema.refine(
  (data) => data.minOrderQuantity <= data.quantity,
  {
    message: 'La quantité minimale de commande ne peut pas excéder la quantité totale disponible',
    path: ['minOrderQuantity'],
  }
);

export const ProductUpdateSchema = BaseProductSchema.partial().omit({ id: true });

/**
 * ---------------------------------------------------------------------------
 * 3. SCHÉMA COMMANDE / ORDRE (ORDER SCHEMA)
 * Champs requis : itemId, itemTitle, quantity, unitPriceMAD, buyerName,
 * buyerEmail, buyerPhone, sellerName, deliveryAddress, destinationCity
 * ---------------------------------------------------------------------------
 */
export const PaymentMethodSchema = z.enum([
  'carte_cmi',
  'stripe_card',
  'virement_sequestre',
]);

export const OrderStatusSchema = z.enum([
  'funds_held',
  'in_transit',
  'delivered',
  'released',
  'disputed',
]);

export const OrderItemTypeSchema = z.enum([
  'nursery_lot',
  'produce',
  'farm_standing',
]);

export const BaseOrderSchema = z.object({
  id: z.string().optional(),
  referenceNumber: z.string().optional(),
  itemId: z
    .string()
    .trim()
    .min(1, 'L\'identifiant de l\'article ou du lot est requis'),
  itemTitle: z
    .string()
    .trim()
    .min(2, 'Le titre de l\'article commandé doit comporter au moins 2 caractères')
    .max(150, 'Le titre ne peut pas dépasser 150 caractères'),
  itemType: OrderItemTypeSchema.default('produce'),
  quantity: z
    .number()
    .positive('La quantité commandée doit être strictement supérieure à 0')
    .max(10_000_000, 'La quantité commandée dépasse le plafond autorisé'),
  unit: z
    .string()
    .trim()
    .min(1, 'L\'unité de mesure est obligatoire')
    .default('Kg'),
  unitPriceMAD: z
    .number()
    .positive('Le prix unitaire doit être strictement supérieur à 0')
    .max(10_000_000, 'Le prix unitaire dépasse le plafond autorisé'),
  subtotalAmountMAD: z
    .number()
    .positive('Le montant sous-total doit être supérieur à 0')
    .optional(),
  platformCommissionRate: z
    .number()
    .min(0, 'Le taux de commission ne peut pas être négatif')
    .max(1, 'Le taux de commission ne peut pas dépasser 100%')
    .default(0.05),
  platformCommissionMAD: z
    .number()
    .min(0, 'La commission plateforme ne peut pas être négative')
    .optional(),
  escrowGuaranteeFeeMAD: z
    .number()
    .min(0, 'Les frais de garantie séquestre ne peuvent pas être négatifs')
    .optional(),
  totalPaidByBuyerMAD: z
    .number()
    .positive('Le montant total payé par l\'acheteur doit être supérieur à 0')
    .optional(),
  sellerPayoutAmountMAD: z
    .number()
    .min(0, 'Le montant net reversé au vendeur ne peut pas être négatif')
    .optional(),
  buyerName: z
    .string()
    .trim()
    .min(2, 'Le nom complet de l\'acheteur est obligatoire')
    .max(100, 'Le nom de l\'acheteur ne peut pas dépasser 100 caractères'),
  buyerEmail: z
    .string()
    .trim()
    .email('Adresse email de l\'acheteur invalide'),
  buyerPhone: z
    .string()
    .trim()
    .min(9, 'Le numéro de téléphone de l\'acheteur doit comporter au moins 9 chiffres')
    .refine((val) => {
      const digits = val.replace(/\D/g, '');
      return digits.length >= 9 && digits.length <= 12;
    }, {
      message: 'Format de téléphone acheteur invalide (ex: 06 61 23 45 67 ou +212 661 234 567)',
    }),
  sellerName: z
    .string()
    .trim()
    .min(2, 'Le nom du vendeur / exploitant est obligatoire')
    .max(100, 'Le nom du vendeur ne peut pas dépasser 100 caractères'),
  sellerPhone: z
    .string()
    .trim()
    .optional(),
  deliveryAddress: z
    .string()
    .trim()
    .min(5, 'L\'adresse de livraison doit comporter au moins 5 caractères')
    .max(250, 'L\'adresse de livraison ne peut pas dépasser 250 caractères'),
  destinationCity: z
    .string()
    .trim()
    .min(2, 'La ville de livraison est obligatoire')
    .max(100, 'Le nom de la ville ne peut pas dépasser 100 caractères'),
  paymentMethod: PaymentMethodSchema.default('carte_cmi'),
  status: OrderStatusSchema.default('funds_held'),
  notes: z
    .string()
    .trim()
    .max(1000, 'Les notes de commande ne peuvent pas dépasser 1000 caractères')
    .optional(),
  trackingCarrier: z.string().trim().optional(),
  trackingNumber: z.string().trim().optional(),
  inspectionHoursRemaining: z.number().min(0).optional(),
});

export const OrderSchema = BaseOrderSchema.refine(
  (data) => {
    // Si totalPaidByBuyerMAD et subtotalAmountMAD sont tous deux renseignés, total doit être >= subtotal
    if (data.totalPaidByBuyerMAD !== undefined && data.subtotalAmountMAD !== undefined) {
      return data.totalPaidByBuyerMAD >= data.subtotalAmountMAD;
    }
    return true;
  },
  {
    message: 'Le montant total payé par l\'acheteur ne peut pas être inférieur au sous-total',
    path: ['totalPaidByBuyerMAD'],
  }
);

export const OrderUpdateSchema = BaseOrderSchema.partial().omit({ id: true });

/**
 * ---------------------------------------------------------------------------
 * TYPES INFÉRÉS AUTOMATIQUEMENT PAR TYPESCRIPT VIA ZOD
 * ---------------------------------------------------------------------------
 */
export type UserInput = z.infer<typeof UserSchema>;
export type UserUpdateInput = z.infer<typeof UserUpdateSchema>;
export type ProductInput = z.infer<typeof ProductSchema>;
export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>;
export type OrderInput = z.infer<typeof OrderSchema>;
export type OrderUpdateInput = z.infer<typeof OrderUpdateSchema>;

/**
 * ---------------------------------------------------------------------------
 * STRUCTURE DE RÉSULTAT STANDARDISÉE POUR L'APPLICATION
 * ---------------------------------------------------------------------------
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors: Record<string, string>;
  firstErrorMessage?: string;
}

/**
 * Fonction générique de validation
 */
export function validateWithZod<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
      errors: {},
    };
  }

  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const field = issue.path.join('.') || 'general';
    if (!errors[field]) {
      errors[field] = issue.message;
    }
  });

  const firstErrorMessage = result.error.issues[0]?.message || 'Données invalides';

  return {
    success: false,
    errors,
    firstErrorMessage,
  };
}

/**
 * Validateur métier pour les Produits (remplace les validations manuelles)
 */
export function validateProduct(input: unknown): ValidationResult<ProductInput> {
  return validateWithZod(ProductSchema, input);
}

/**
 * Validateur métier pour la mise à jour partielle d'un Produit
 */
export function validateProductUpdate(input: unknown): ValidationResult<ProductUpdateInput> {
  return validateWithZod(ProductUpdateSchema, input);
}

/**
 * Validateur métier pour l'Utilisateur (remplace les validations manuelles)
 */
export function validateUser(input: unknown): ValidationResult<UserInput> {
  return validateWithZod(UserSchema, input);
}

/**
 * Validateur métier pour la mise à jour partielle d'un Utilisateur
 */
export function validateUserUpdate(input: unknown): ValidationResult<UserUpdateInput> {
  return validateWithZod(UserUpdateSchema, input);
}

/**
 * Validateur métier pour les Commandes / Ordres (remplace les validations manuelles)
 */
export function validateOrder(input: unknown): ValidationResult<OrderInput> {
  return validateWithZod(OrderSchema, input);
}

/**
 * Validateur métier pour la mise à jour partielle d'une Commande
 */
export function validateOrderUpdate(input: unknown): ValidationResult<OrderUpdateInput> {
  return validateWithZod(OrderUpdateSchema, input);
}

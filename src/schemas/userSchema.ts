import { z } from 'zod';

export const MoroccanRegionEnum = z.enum([
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

export const UserRoleEnum = z.enum(['buyer', 'seller', 'nursery', 'carrier', 'admin']);

// Regex pour numéros de téléphone au Maroc : 06XXXXXXXX, 07XXXXXXXX, 05XXXXXXXX, +2126XXXXXXXX, +2127XXXXXXXX
const MOROCCAN_PHONE_REGEX = /^(?:(?:\+?212)|0)[5-7]\d{8}$/;

/**
 * Schéma de validation pour le profil complet d'un utilisateur
 */
export const UserProfileSchema = z.object({
  id: z.string().min(1, 'L\'identifiant utilisateur est requis'),
  role: UserRoleEnum,
  roles: z.array(UserRoleEnum).min(1, 'Au moins un rôle doit être attribué').default(['buyer']),
  displayName: z
    .string()
    .trim()
    .min(2, 'Le nom doit comporter au moins 2 caractères')
    .max(100, 'Le nom ne peut dépasser 100 caractères'),
  phone: z
    .string()
    .trim()
    .min(9, 'Le numéro de téléphone doit comporter au moins 9 chiffres')
    .refine((val) => val === '' || val.replace(/\D/g, '').length >= 9, {
      message: 'Format de téléphone invalide (ex: 06 61 23 45 67)',
    }),
  whatsapp: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  companyName: z
    .string()
    .trim()
    .max(120, 'Le nom de l\'entreprise ne peut dépasser 120 caractères')
    .optional()
    .or(z.literal('')),
  region: MoroccanRegionEnum.default('Casablanca - Settat & Doukkala'),
  email: z
    .string()
    .trim()
    .email('Adresse email invalide')
    .optional()
    .or(z.literal('')),
  hasCompletedIdentification: z.boolean().default(false),
  verificationStatus: z.enum(['verified', 'pending_verification', 'rejected']).default('pending_verification'),
  isPasswordProtected: z.boolean().optional(),
  createdAt: z.string().optional(),
});

/**
 * Schéma pour la saisie d'inscription ou identification express
 */
export const UserRegistrationInputSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Veuillez saisir votre nom complet ou le nom de votre exploitation (min. 2 caractères)'),
  phone: z
    .string()
    .trim()
    .min(9, 'Veuillez renseigner un numéro de téléphone valide (min. 9 chiffres)')
    .regex(/^[\d\s+\-().]+$/, 'Le numéro contient des caractères non autorisés'),
  role: UserRoleEnum,
  region: MoroccanRegionEnum,
  companyName: z.string().trim().optional(),
  email: z
    .string()
    .trim()
    .email('Adresse email invalide')
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(6, 'Le mot de passe doit comporter au moins 6 caractères')
    .optional()
    .or(z.literal('')),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Vous devez accepter les conditions d\'utilisation d\'AGRIStock Maroc',
  }).optional(),
});

/**
 * Schéma pour la connexion utilisateur
 */
export const UserLoginInputSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, 'Veuillez renseigner votre email ou numéro de téléphone'),
  password: z
    .string()
    .min(4, 'Mot de passe requis (min. 4 caractères)'),
  role: UserRoleEnum.optional(),
});

export type UserProfileValidated = z.infer<typeof UserProfileSchema>;
export type UserRegistrationInput = z.infer<typeof UserRegistrationInputSchema>;
export type UserLoginInput = z.infer<typeof UserLoginInputSchema>;

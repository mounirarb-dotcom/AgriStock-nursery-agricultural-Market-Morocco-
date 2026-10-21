import { z } from 'zod';

export * from './userSchema';
export * from './productSchema';

import {
  UserProfileSchema,
  UserRegistrationInputSchema,
  UserLoginInputSchema,
  UserProfileValidated,
  UserRegistrationInput,
} from './userSchema';

import {
  ProduceListingInputSchema,
  NurseryLotInputSchema,
  FarmStandingListingInputSchema,
  ProduceListingInputValidated,
  NurseryLotInputValidated,
} from './productSchema';

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors: Record<string, string>;
  firstErrorMessage?: string;
}

/**
 * Valide générique avec extraction de messages propres pour l'UI
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
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
    const key = issue.path.join('.') || 'general';
    if (!errors[key]) {
      errors[key] = issue.message;
    }
  });

  const firstErrorMessage = result.error.issues[0]?.message || 'Données non valides';

  return {
    success: false,
    errors,
    firstErrorMessage,
  };
}

/**
 * Validation spécialisée pour les annonces de produits et récoltes
 */
export function validateProduceListing(data: unknown): ValidationResult<ProduceListingInputValidated> {
  return validateWithSchema(ProduceListingInputSchema, data);
}

/**
 * Validation spécialisée pour les lots de pépinières
 */
export function validateNurseryLot(data: unknown): ValidationResult<NurseryLotInputValidated> {
  return validateWithSchema(NurseryLotInputSchema, data);
}

/**
 * Validation spécialisée pour le profil utilisateur
 */
export function validateUserProfile(data: unknown): ValidationResult<UserProfileValidated> {
  return validateWithSchema(UserProfileSchema, data);
}

/**
 * Validation spécialisée pour l'inscription rapide
 */
export function validateUserRegistration(data: unknown): ValidationResult<UserRegistrationInput> {
  return validateWithSchema(UserRegistrationInputSchema, data);
}

// Aliases de rétrocompatibilité
export const validateSchema = validateWithSchema;
export const NurseryLotSchema = NurseryLotInputSchema;
export const ProduceListingSchema = ProduceListingInputSchema;

// Réexportation des schémas principaux définis dans src/lib/validations
export * from '../lib/validations';


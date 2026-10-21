import { describe, it, expect } from 'vitest';
import {
  ProductSchema,
  UserSchema,
  OrderSchema,
  validateProduct,
  validateProductUpdate,
  validateUser,
  validateUserUpdate,
  validateOrder,
  validateOrderUpdate,
} from '../lib/validations';

describe('Zod Validation Schemas (src/lib/validations.ts)', () => {
  describe('ProductSchema & validateProduct', () => {
    it('accepts a valid agricultural product with name, category, price, quantity', () => {
      const validProduct = {
        name: 'Tomate Ronde Côtelée Primeur',
        category: 'Maraîchage & Légumes de Saison',
        price: 8.5,
        quantity: 1500,
        unit: 'Kg',
        region: 'Souss-Massa (Agadir, Taroudant, Chtouka)',
        minOrderQuantity: 100,
      };

      const result = validateProduct(validProduct);
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('Tomate Ronde Côtelée Primeur');
      expect(result.data?.price).toBe(8.5);
      expect(result.data?.quantity).toBe(1500);
      expect(result.errors).toEqual({});
    });

    it('rejects a product with missing or short name', () => {
      const invalidProduct = {
        name: 'A',
        category: 'Maraîchage',
        price: 10,
        quantity: 50,
      };

      const result = validateProduct(invalidProduct);
      expect(result.success).toBe(false);
      expect(result.errors['name']).toBeDefined();
    });

    it('rejects non-positive price or quantity', () => {
      const badNumbers = {
        name: 'Clémentine Nadorcott',
        category: 'Agrumes',
        price: -5,
        quantity: 0,
      };

      const result = validateProduct(badNumbers);
      expect(result.success).toBe(false);
      expect(result.errors['price']).toBeDefined();
      expect(result.errors['quantity']).toBeDefined();
    });

    it('rejects minOrderQuantity greater than total quantity', () => {
      const impossibleOrder = {
        name: 'Avocat Hass Bio',
        category: 'Fruits',
        price: 25,
        quantity: 100,
        minOrderQuantity: 500,
      };

      const result = validateProduct(impossibleOrder);
      expect(result.success).toBe(false);
      expect(result.errors['minOrderQuantity']).toBeDefined();
    });

    it('supports partial product updates safely', () => {
      const partialUpdate = {
        price: 9.0,
      };

      const result = validateProductUpdate(partialUpdate);
      expect(result.success).toBe(true);
      expect(result.data?.price).toBe(9.0);
    });
  });

  describe('UserSchema & validateUser', () => {
    it('accepts a valid user with name, email, role, phone', () => {
      const validUser = {
        name: 'Mohamed Amine Alami',
        email: 'mohamed.alami@agristock.ma',
        role: 'seller',
        phone: '0661234567',
        region: 'Souss-Massa (Agadir, Taroudant, Chtouka)',
        companyName: 'Domaine Maraîcher Al Baraka',
      };

      const result = validateUser(validUser);
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('Mohamed Amine Alami');
      expect(result.data?.email).toBe('mohamed.alami@agristock.ma');
      expect(result.data?.role).toBe('seller');
      expect(result.data?.phone).toBe('0661234567');
    });

    it('rejects an invalid email format', () => {
      const badEmail = {
        name: 'Hassan Berkane',
        email: 'invalid-email-string',
        role: 'nursery',
        phone: '0663456789',
      };

      const result = validateUser(badEmail);
      expect(result.success).toBe(false);
      expect(result.errors['email']).toBeDefined();
    });

    it('rejects an unauthorized role', () => {
      const badRole = {
        name: 'Karim Casa',
        email: 'karim@gmail.com',
        role: 'super_hacker',
        phone: '0661122334',
      };

      const result = validateUser(badRole);
      expect(result.success).toBe(false);
      expect(result.errors['role']).toBeDefined();
    });

    it('rejects invalid phone numbers with less than 9 digits', () => {
      const badPhone = {
        name: 'Youssef Marrakech',
        email: 'youssef@transport.ma',
        role: 'carrier',
        phone: '12345',
      };

      const result = validateUser(badPhone);
      expect(result.success).toBe(false);
      expect(result.errors['phone']).toBeDefined();
    });

    it('allows valid partial user updates', () => {
      const partialUser = {
        companyName: 'Coopérative Agricole Souss',
      };

      const result = validateUserUpdate(partialUser);
      expect(result.success).toBe(true);
      expect(result.data?.companyName).toBe('Coopérative Agricole Souss');
    });
  });

  describe('OrderSchema & validateOrder', () => {
    it('accepts a valid escrow order with full details', () => {
      const validOrder = {
        itemId: 'prod-01',
        itemTitle: 'Tomates Rondes Lisses',
        itemType: 'produce' as const,
        quantity: 10,
        unit: 'Tonnes',
        unitPriceMAD: 4500,
        subtotalAmountMAD: 45000,
        totalPaidByBuyerMAD: 47250,
        buyerName: 'Grossiste Casablanca Fruit',
        buyerEmail: 'contact@grossiste-casa.ma',
        buyerPhone: '0661223344',
        sellerName: 'Domaine Maraîcher Souss',
        deliveryAddress: 'Marché de Gros de Casablanca, Hangar 4',
        destinationCity: 'Casablanca',
        paymentMethod: 'carte_cmi' as const,
      };

      const result = validateOrder(validOrder);
      expect(result.success).toBe(true);
      expect(result.data?.itemId).toBe('prod-01');
      expect(result.data?.quantity).toBe(10);
      expect(result.data?.unitPriceMAD).toBe(4500);
      expect(result.data?.buyerEmail).toBe('contact@grossiste-casa.ma');
      expect(result.errors).toEqual({});
    });

    it('rejects an order with missing required fields', () => {
      const incompleteOrder = {
        itemId: 'prod-01',
        itemTitle: 'Tomates',
        quantity: 5,
        unitPriceMAD: 4500,
        // missing buyerName, buyerEmail, buyerPhone, deliveryAddress, destinationCity
      };

      const result = validateOrder(incompleteOrder);
      expect(result.success).toBe(false);
      expect(result.errors['buyerName']).toBeDefined();
      expect(result.errors['buyerEmail']).toBeDefined();
      expect(result.errors['buyerPhone']).toBeDefined();
      expect(result.errors['deliveryAddress']).toBeDefined();
      expect(result.errors['destinationCity']).toBeDefined();
    });

    it('rejects non-positive order quantity or unit price', () => {
      const badOrder = {
        itemId: 'prod-01',
        itemTitle: 'Pastèques Extra',
        quantity: -2,
        unitPriceMAD: 0,
        buyerName: 'Hicham Agadir',
        buyerEmail: 'hicham@agadir.ma',
        buyerPhone: '0661998877',
        sellerName: 'Ferme Zagora',
        deliveryAddress: 'Zone Industrielle Tassila',
        destinationCity: 'Agadir',
      };

      const result = validateOrder(badOrder);
      expect(result.success).toBe(false);
      expect(result.errors['quantity']).toBeDefined();
      expect(result.errors['unitPriceMAD']).toBeDefined();
    });

    it('rejects an underpaid order where totalPaidByBuyer is less than subtotal', () => {
      const underpaidOrder = {
        itemId: 'prod-02',
        itemTitle: 'Clémentines Berkane',
        quantity: 10,
        unitPriceMAD: 5000,
        subtotalAmountMAD: 50000,
        totalPaidByBuyerMAD: 30000, // < 50000
        buyerName: 'Exportateur Nador',
        buyerEmail: 'export@nador.ma',
        buyerPhone: '0661554433',
        sellerName: 'Domaine Moulouya',
        deliveryAddress: 'Port de Nador Beni Ensar',
        destinationCity: 'Nador',
      };

      const result = validateOrder(underpaidOrder);
      expect(result.success).toBe(false);
      expect(result.errors['totalPaidByBuyerMAD']).toBeDefined();
    });

    it('allows valid partial order updates', () => {
      const updateData = {
        status: 'in_transit' as const,
        trackingCarrier: 'AgriFret Maroc Express',
        trackingNumber: 'TRK-2026-MA-9912',
      };

      const result = validateOrderUpdate(updateData);
      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('in_transit');
      expect(result.data?.trackingCarrier).toBe('AgriFret Maroc Express');
    });
  });
});

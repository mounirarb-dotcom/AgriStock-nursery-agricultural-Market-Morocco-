import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductService, productService } from '../services/ProductService';

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(() => {
    localStorage.clear();
    service = new ProductService('/api/products');
  });

  it('exports a valid default singleton instance', () => {
    expect(productService).toBeDefined();
    expect(productService instanceof ProductService).toBe(true);
  });

  it('retrieves default products list with getProducts()', async () => {
    const products = await service.getProducts();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
    expect(products[0].title).toBeDefined();
    expect(products[0].pricePerUnitMAD).toBeGreaterThan(0);
  });

  it('filters products by category correctly', async () => {
    const legumes = await service.getProductsByCategory('Légume');
    expect(legumes.length).toBeGreaterThan(0);
    expect(legumes.every(p => p.category.toLowerCase().includes('légume'))).toBe(true);
  });

  it('filters products by region correctly', async () => {
    const soussProducts = await service.getProductsByRegion('Souss-Massa (Agadir, Taroudant, Chtouka)');
    expect(soussProducts.length).toBeGreaterThan(0);
    expect(soussProducts.every(p => p.region.includes('Souss-Massa'))).toBe(true);
  });

  it('searches products by text query', async () => {
    const results = await service.searchProducts('Tomates');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(p => p.title.toLowerCase().includes('tomate'))).toBe(true);
  });

  it('retrieves a single product by ID', async () => {
    const all = await service.getProducts();
    const firstId = all[0].id;

    const product = await service.getProductById(firstId);
    expect(product).not.toBeNull();
    expect(product?.id).toBe(firstId);

    const nonExistent = await service.getProductById('prod-non-existent-999');
    expect(nonExistent).toBeNull();
  });

  it('validates and creates a new product successfully', async () => {
    const newProductData = {
      title: 'Pastèques de Zagora Primeur',
      category: 'Fruit' as const,
      variety: 'Pastèque Crimson',
      quantityAvailable: 30,
      unit: 'Tonnes' as const,
      minOrderQuantity: 2,
      pricePerUnitMAD: 3200,
      priceType: 'Départ ferme (Sortie de champ)' as const,
      region: 'Drâa - Tafilalet (Zagora, Errachidia)' as const,
      locationCity: 'Zagora',
      calibre: 'Calibre 8-12kg',
      packaging: 'Vrac paille benne',
      harvestDate: '2025-05-10',
      certifications: ['ONSSA Homologué' as const],
      sellerName: 'Exploitation Oasis Zagora',
      sellerType: 'Agriculteur / Producteur' as const,
      phone: '+212661223344',
      whatsapp: '212661223344',
      description: 'Pastèques sucrées gorgées de soleil.',
      imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
    };

    const created = await service.createProduct(newProductData);
    expect(created.id).toBeDefined();
    expect(created.title).toBe('Pastèques de Zagora Primeur');
    expect(created.status).toBe('Disponible');

    // Vérifie qu'il est maintenant dans la liste
    const fetched = await service.getProductById(created.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.title).toBe('Pastèques de Zagora Primeur');
  });

  it('rejects product creation when data fails validation', async () => {
    const invalidProduct = {
      title: '', // trop court
      category: 'Fruit' as const,
      variety: 'Test',
      quantityAvailable: -10, // invalide
      unit: 'Tonnes' as const,
      minOrderQuantity: 50, // supérieur à quantity
      pricePerUnitMAD: 0, // invalide
      priceType: 'Départ ferme (Sortie de champ)' as const,
      region: 'Souss-Massa (Agadir, Taroudant, Chtouka)' as const,
      locationCity: 'Agadir',
      calibre: 'Standard',
      packaging: 'Caisse',
      harvestDate: '2025-05-10',
      certifications: [],
      sellerName: '',
      sellerType: 'Agriculteur / Producteur' as const,
      phone: '',
      whatsapp: '',
      description: '',
      imageUrl: '',
    };

    await expect(service.createProduct(invalidProduct as any)).rejects.toThrow();
  });

  it('updates an existing product safely', async () => {
    const all = await service.getProducts();
    const target = all[0];

    const updated = await service.updateProduct(target.id, {
      pricePerUnitMAD: 5200,
      quantityAvailable: 35,
    });

    expect(updated.pricePerUnitMAD).toBe(5200);
    expect(updated.quantityAvailable).toBe(35);

    const reFetched = await service.getProductById(target.id);
    expect(reFetched?.pricePerUnitMAD).toBe(5200);
  });

  it('deletes a product by ID', async () => {
    const all = await service.getProducts();
    const targetId = all[0].id;

    const result = await service.deleteProduct(targetId);
    expect(result).toBe(true);

    const fetched = await service.getProductById(targetId);
    expect(fetched).toBeNull();
  });

  it('retrieves nursery lots and farm standing crops', async () => {
    const lots = await service.getNurseryLots();
    expect(Array.isArray(lots)).toBe(true);
    expect(lots.length).toBeGreaterThan(0);
    expect(lots[0].species).toBeDefined();

    const farmStanding = await service.getFarmStandingListings();
    expect(Array.isArray(farmStanding)).toBe(true);
    expect(farmStanding.length).toBeGreaterThan(0);
  });
});

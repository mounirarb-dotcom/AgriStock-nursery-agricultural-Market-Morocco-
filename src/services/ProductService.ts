import { ProduceListing, NurseryLot, FarmStandingListing, MoroccanRegion } from '../types';
import { validateProduct, validateProductUpdate, ProductInput, ValidationResult } from '../lib/validations';
import { INITIAL_PRODUCE_LISTINGS, INITIAL_NURSERY_LOTS, INITIAL_FARM_STANDING_LISTINGS } from '../data/mockData';

export interface ProductFilters {
  category?: string;
  region?: string;
  status?: 'Disponible' | 'Réservé' | 'Vendu';
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
  sellerType?: string;
  isFeatured?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'date_desc' | 'qty_desc';
  limit?: number;
  page?: number;
}

export interface PaginatedProductsResponse {
  items: ProduceListing[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const STORAGE_KEY_PRODUCE = 'agristock_produce_listings';
const STORAGE_KEY_LOTS = 'agristock_nursery_lots';
const STORAGE_KEY_FARM_STANDING = 'agristock_farm_standing_listings';

/**
 * ---------------------------------------------------------------------------
 * PRODUCT SERVICE (SERVICE MÉTIER CENTRALISÉ PRODUITS & LOTS)
 * Encapsule les appels API, les requêtes réseau, la persistance locale
 * et la validation stricte des données avant traitement.
 * ---------------------------------------------------------------------------
 */
export class ProductService {
  private apiBaseUrl: string;

  constructor(baseUrl = '/api/products') {
    this.apiBaseUrl = baseUrl;
  }

  /**
   * Récupère la liste locale sauvegardée (cache ou fallback)
   */
  private getLocalProducts(): ProduceListing[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem(STORAGE_KEY_PRODUCE);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('[ProductService] Échec de lecture du cache local:', e);
    }
    return [...INITIAL_PRODUCE_LISTINGS];
  }

  /**
   * Sauvegarde les produits dans le cache local
   */
  private setLocalProducts(products: ProduceListing[]): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY_PRODUCE, JSON.stringify(products));
      }
    } catch (e) {
      console.warn('[ProductService] Échec d\'écriture dans le cache local:', e);
    }
  }

  /**
   * Récupère tous les produits avec filtrage, tri et pagination
   */
  async getProducts(filters?: ProductFilters): Promise<ProduceListing[]> {
    try {
      // 1. Tentative d'appel vers l'API backend
      const queryParams = new URLSearchParams();
      if (filters?.category && filters.category !== 'ALL') queryParams.append('category', filters.category);
      if (filters?.region && filters.region !== 'ALL') queryParams.append('region', filters.region);
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.q) queryParams.append('q', filters.q);
      if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters?.limit) queryParams.append('limit', String(filters.limit));

      const url = `${this.apiBaseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          this.setLocalProducts(data);
          return data;
        } else if (data && Array.isArray(data.items)) {
          return data.items;
        }
      }
    } catch {
      // Fallback gracieux en mode déconnecté / local
    }

    // 2. Traitement local si l'API n'est pas joignable
    let items = this.getLocalProducts();

    if (filters) {
      if (filters.category && filters.category !== 'ALL') {
        const cat = filters.category.toLowerCase();
        items = items.filter(p => p.category.toLowerCase().includes(cat) || cat.includes(p.category.toLowerCase()));
      }
      if (filters.region && filters.region !== 'ALL') {
        items = items.filter(p => p.region === filters.region);
      }
      if (filters.status) {
        items = items.filter(p => p.status === filters.status);
      }
      if (filters.sellerId) {
        items = items.filter(p => p.userId === filters.sellerId);
      }
      if (filters.isFeatured !== undefined) {
        items = items.filter(p => Boolean(p.isFeatured) === filters.isFeatured);
      }
      if (filters.minPrice !== undefined) {
        items = items.filter(p => p.pricePerUnitMAD >= filters.minPrice!);
      }
      if (filters.maxPrice !== undefined) {
        items = items.filter(p => p.pricePerUnitMAD <= filters.maxPrice!);
      }
      if (filters.q) {
        const qLower = filters.q.toLowerCase().trim();
        items = items.filter(p =>
          p.title.toLowerCase().includes(qLower) ||
          p.variety.toLowerCase().includes(qLower) ||
          p.sellerName.toLowerCase().includes(qLower) ||
          p.locationCity.toLowerCase().includes(qLower)
        );
      }
      if (filters.sortBy) {
        if (filters.sortBy === 'price_asc') {
          items.sort((a, b) => a.pricePerUnitMAD - b.pricePerUnitMAD);
        } else if (filters.sortBy === 'price_desc') {
          items.sort((a, b) => b.pricePerUnitMAD - a.pricePerUnitMAD);
        } else if (filters.sortBy === 'qty_desc') {
          items.sort((a, b) => b.quantityAvailable - a.quantityAvailable);
        } else if (filters.sortBy === 'date_desc') {
          items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
      }
      if (filters.limit && filters.limit > 0) {
        items = items.slice(0, filters.limit);
      }
    }

    return items;
  }

  /**
   * Récupère un produit par son identifiant unique
   */
  async getProductById(id: string): Promise<ProduceListing | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/${encodeURIComponent(id)}`);
      if (response.ok) {
        const product = await response.json();
        return product;
      }
    } catch {
      // Fallback
    }

    const localList = this.getLocalProducts();
    return localList.find(p => p.id === id) || null;
  }

  /**
   * Crée un nouveau produit en validant d'abord avec le schéma Zod
   */
  async createProduct(
    productData: Omit<ProduceListing, 'id' | 'createdAt' | 'status'> & { id?: string; status?: 'Disponible' | 'Réservé' | 'Vendu' }
  ): Promise<ProduceListing> {
    // 1. Validation stricte Zod
    const validation = validateProduct({
      name: productData.title,
      category: productData.category,
      price: Number(productData.pricePerUnitMAD),
      quantity: Number(productData.quantityAvailable),
      unit: productData.unit,
      variety: productData.variety,
      region: productData.region,
      sellerName: productData.sellerName,
      minOrderQuantity: productData.minOrderQuantity || 1,
      imageUrl: productData.imageUrl,
    });

    if (!validation.success) {
      throw new Error(validation.firstErrorMessage || 'Données du produit invalides');
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const newProduct: ProduceListing = {
      ...productData,
      id: productData.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      status: productData.status || 'Disponible',
      createdAt: todayStr,
    };

    // 2. Appel API Backend si disponible
    try {
      const response = await fetch(this.apiBaseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      });

      if (response.ok) {
        const created = await response.json();
        // Mettre à jour le cache local
        const current = this.getLocalProducts();
        this.setLocalProducts([created, ...current.filter(p => p.id !== created.id)]);
        return created;
      }
    } catch {
      // Fallback en cache local
    }

    // 3. Persistance dans le cache local
    const current = this.getLocalProducts();
    const updated = [newProduct, ...current.filter(p => p.id !== newProduct.id)];
    this.setLocalProducts(updated);

    return newProduct;
  }

  /**
   * Met à jour un produit existant avec validation partielle
   */
  async updateProduct(id: string, updates: Partial<ProduceListing>): Promise<ProduceListing> {
    // Validation partielle si des champs critiques sont modifiés
    if (updates.title || updates.pricePerUnitMAD !== undefined || updates.quantityAvailable !== undefined) {
      const partialValidation = validateProductUpdate({
        name: updates.title,
        price: updates.pricePerUnitMAD,
        quantity: updates.quantityAvailable,
        category: updates.category,
        unit: updates.unit,
      });

      if (!partialValidation.success) {
        throw new Error(partialValidation.firstErrorMessage || 'Données de mise à jour invalides');
      }
    }

    // 1. Appel API
    try {
      const response = await fetch(`${this.apiBaseUrl}/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updated = await response.json();
        const current = this.getLocalProducts();
        this.setLocalProducts(current.map(p => (p.id === id ? updated : p)));
        return updated;
      }
    } catch {
      // Fallback
    }

    // 2. Mise à jour locale
    const current = this.getLocalProducts();
    const existing = current.find(p => p.id === id);
    if (!existing) {
      throw new Error(`Produit introuvable avec l'ID ${id}`);
    }

    const updatedItem: ProduceListing = {
      ...existing,
      ...updates,
    };

    this.setLocalProducts(current.map(p => (p.id === id ? updatedItem : p)));
    return updatedItem;
  }

  /**
   * Supprime un produit par ID
   */
  async deleteProduct(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        const current = this.getLocalProducts();
        this.setLocalProducts(current.filter(p => p.id !== id));
        return true;
      }
    } catch {
      // Fallback
    }

    const current = this.getLocalProducts();
    const nextList = current.filter(p => p.id !== id);
    this.setLocalProducts(nextList);
    return true;
  }

  /**
   * Recherche de produits par mot-clé
   */
  async searchProducts(query: string, filters?: ProductFilters): Promise<ProduceListing[]> {
    return this.getProducts({ ...filters, q: query });
  }

  /**
   * Filtre les produits par catégorie
   */
  async getProductsByCategory(category: string): Promise<ProduceListing[]> {
    return this.getProducts({ category });
  }

  /**
   * Filtre les produits par région marocaine
   */
  async getProductsByRegion(region: MoroccanRegion): Promise<ProduceListing[]> {
    return this.getProducts({ region });
  }

  /**
   * Récupère les offres mises en avant (featured / boostées)
   */
  async getFeaturedProducts(): Promise<ProduceListing[]> {
    return this.getProducts({ isFeatured: true });
  }

  /**
   * Récupère les lots de pépinières (avec persistance locale et fallback)
   */
  async getNurseryLots(): Promise<NurseryLot[]> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem(STORAGE_KEY_LOTS);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch (e) {
      console.warn('[ProductService] Lecture des lots de pépinière:', e);
    }
    return [...INITIAL_NURSERY_LOTS];
  }

  /**
   * Récupère les récoltes sur pied (ventes à la parcelle)
   */
  async getFarmStandingListings(): Promise<FarmStandingListing[]> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem(STORAGE_KEY_FARM_STANDING);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch (e) {
      console.warn('[ProductService] Lecture des récoltes sur pied:', e);
    }
    return [...INITIAL_FARM_STANDING_LISTINGS];
  }

  /**
   * Extrait la liste des régions uniques présentes dans les offres et lots
   */
  extractUniqueRegions(produceListings: ProduceListing[], nurseryLots: NurseryLot[]): string[] {
    const set = new Set<string>();
    produceListings.forEach((p) => p.region && set.add(p.region));
    nurseryLots.forEach((n) => n.region && set.add(n.region));
    return Array.from(set);
  }

  /**
   * Fusionne, filtre et trie les catalogues de récoltes et pépinières pour l'affichage
   */
  combineAndFilterCatalog(params: {
    produceListings: ProduceListing[];
    nurseryLots: NurseryLot[];
    activeCategory: string;
    selectedRegion: string;
    searchTerm: string;
    sortBy: 'recent' | 'price_asc' | 'price_desc' | 'volume';
    limit?: number;
  }): (ProduceListing | (NurseryLot & { type: 'nursery' }))[] {
    const { produceListings, nurseryLots, activeCategory, selectedRegion, searchTerm, sortBy, limit } = params;
    let combined: (ProduceListing | (NurseryLot & { type: 'nursery' }))[] = [];

    // Ajouter les annonces de récoltes
    if (activeCategory === 'ALL' || activeCategory === 'FRUIT' || activeCategory === 'VEG' || activeCategory === 'LIVESTOCK') {
      const filteredProduce = produceListings
        .filter((item) => item.status === 'Disponible')
        .filter((item) => {
          if (activeCategory === 'FRUIT') return item.category === 'Fruit';
          if (activeCategory === 'VEG') return item.category === 'Légume';
          if (activeCategory === 'LIVESTOCK') return item.category === 'Élevage & Bétail';
          return true;
        });
      combined.push(...filteredProduce);
    }

    // Ajouter les lots de pépinières
    if (activeCategory === 'ALL' || activeCategory === 'NURSERY') {
      const nurseryItems = nurseryLots.map((lot) => ({ ...lot, type: 'nursery' as const }));
      combined.push(...nurseryItems);
    }

    // Filtrage par région
    if (selectedRegion !== 'ALL') {
      combined = combined.filter((item) => item.region === selectedRegion);
    }

    // Filtrage par texte de recherche
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      combined = combined.filter((item) => {
        if ('species' in item) {
          return (
            item.species.toLowerCase().includes(q) ||
            item.variety.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            (item.sellerName && item.sellerName.toLowerCase().includes(q))
          );
        } else {
          return (
            item.title.toLowerCase().includes(q) ||
            item.variety.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            (item.sellerName && item.sellerName.toLowerCase().includes(q)) ||
            (item.locationCity && item.locationCity.toLowerCase().includes(q))
          );
        }
      });
    }

    // Tri
    combined.sort((a, b) => {
      const priceA = 'species' in a ? a.unitPriceMAD : a.pricePerUnitMAD;
      const priceB = 'species' in b ? b.unitPriceMAD : b.pricePerUnitMAD;
      if (sortBy === 'price_asc') return priceA - priceB;
      if (sortBy === 'price_desc') return priceB - priceA;
      if (sortBy === 'volume') return b.quantityAvailable - a.quantityAvailable;
      return 0;
    });

    if (limit && limit > 0) {
      return combined.slice(0, limit);
    }
    return combined;
  }
}

// Instance singleton par défaut pour usage direct dans toute l'application
export const productService = new ProductService();
export default productService;

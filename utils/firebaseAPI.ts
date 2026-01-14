/**
 * Firebase API Service
 * Handles all backend API calls to Firebase-enabled endpoints
 */

import { BACKEND_CONFIG } from "../config/environment";

export const API_BASE_URL = BACKEND_CONFIG.API_BASE_URL;

export interface SearchParams {
  query: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface Product {
  id: string;
  name: string;
  price: number | string;
  image?: string;
  description?: string;
  category?: string;
  tags?: string[];
}

export interface SearchResponse {
  success: boolean;
  products: Product[];
  count: number;
  message?: string;
  query?: string;
  filters?: {
    category: string | null;
    priceRange: { min: number; max: number };
  };
}

/**
 * Search products from Firebase via backend API
 * @param params - Search parameters
 * @returns Promise with search results
 */
export const searchProducts = async (params: SearchParams): Promise<SearchResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.query) {
      queryParams.append("q", params.query);
    }
    if (params.category) {
      queryParams.append("category", params.category);
    }
    if (params.minPrice !== undefined) {
      queryParams.append("minPrice", params.minPrice.toString());
    }
    if (params.maxPrice !== undefined) {
      queryParams.append("maxPrice", params.maxPrice.toString());
    }

    const url = `${API_BASE_URL}/search?${queryParams.toString()}`;
    console.log(`🔍 Searching Firebase: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      timeout: BACKEND_CONFIG.API_TIMEOUT,
    } as any);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data: SearchResponse = await response.json();
    console.log(`✅ Search Results:`, data);

    return data;
  } catch (error) {
    console.error("❌ Search Error:", error);
    throw error;
  }
};

/**
 * Get all products from Firebase
 * @returns Promise with all products
 */
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const url = `${API_BASE_URL}/products`;
    console.log(`📦 Fetching all products from: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      timeout: BACKEND_CONFIG.API_TIMEOUT,
    } as any);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Products fetched:`, data);

    return data.products || [];
  } catch (error) {
    console.error("❌ Fetch Products Error:", error);
    throw error;
  }
};

/**
 * Get all categories from Firebase
 * @returns Promise with all categories
 */
export const getCategories = async (): Promise<any[]> => {
  try {
    const url = `${API_BASE_URL}/categories`;
    console.log(`🏷️ Fetching categories from: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      timeout: BACKEND_CONFIG.API_TIMEOUT,
    } as any);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Categories fetched:`, data);

    return data.categories || [];
  } catch (error) {
    console.error("❌ Fetch Categories Error:", error);
    throw error;
  }
};

/**
 * Search products by category
 * @param category - Category name
 * @returns Promise with search results
 */
export const searchByCategory = async (category: string): Promise<SearchResponse> => {
  return searchProducts({ query: "", category });
};

/**
 * Search products by price range
 * @param minPrice - Minimum price
 * @param maxPrice - Maximum price
 * @returns Promise with search results
 */
export const searchByPriceRange = async (minPrice: number, maxPrice: number): Promise<SearchResponse> => {
  return searchProducts({ query: "", minPrice, maxPrice });
};

/**
 * Advanced search with multiple filters
 * @param params - Search parameters with filters
 * @returns Promise with search results
 */
export const advancedSearch = async (params: SearchParams): Promise<SearchResponse> => {
  return searchProducts(params);
};

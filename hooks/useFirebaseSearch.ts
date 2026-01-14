/**
 * useFirebaseSearch Hook
 * Hook để quản lý tìm kiếm sản phẩm từ Firebase
 */

import { useCallback, useState } from "react";
import { Product, SearchParams, searchProducts, SearchResponse } from "../utils/firebaseAPI";

interface UseFirebaseSearchOptions {
  onError?: (error: Error) => void;
  onSuccess?: (results: Product[]) => void;
}

export function useFirebaseSearch(options?: UseFirebaseSearchOptions) {
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastQuery, setLastQuery] = useState<string>("");
  const [totalCount, setTotalCount] = useState(0);

  const search = useCallback(async (params: SearchParams) => {
    try {
      setLoading(true);
      setError(null);
      setLastQuery(params.query);

      const response: SearchResponse = await searchProducts(params);

      if (response.success) {
        setResults(response.products);
        setTotalCount(response.count);
        options?.onSuccess?.(response.products);
      } else {
        const error = new Error(response.message || "Search failed");
        setError(error);
        options?.onError?.(error);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      options?.onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setResults([]);
    setError(null);
    setLastQuery("");
    setTotalCount(0);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    lastQuery,
    totalCount,
    search,
    reset,
    clearError,
  };
}

'use client';

import { useCallback, useState } from 'react';
import { useSupabase } from '@/context/Supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../database.types';

// Custom error type with status property
interface FetchError extends Error {
  status?: number;
}

/**
 * A hook that wraps the Supabase client with automatic token refresh logic.
 * Use this hook in components that make Supabase API calls.
 */
export function useSupabaseWithAuth() {
  const { supabase, loading, error, refreshToken } = useSupabase();
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * Executes a Supabase query with automatic token refresh on 401 errors
   * @param queryFn Function that executes a Supabase query
   * @returns The result of the query
   */
  const executeQuery = useCallback(
    async <T,>(
      queryFn: (client: SupabaseClient<Database>) => T
    ): Promise<T> => {
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }

      try {
        // First attempt to execute the query
        return await Promise.resolve(queryFn(supabase));
      } catch (err: unknown) {
        // Check if error is related to token expiration
        const error = err as Error;

        if (
          (error as FetchError)?.status === 401 ||
          error?.message?.includes('JWT expired') ||
          error?.message?.includes('invalid token')
        ) {
          console.log('Token expired, attempting to refresh...');

          if (isRefreshing) {
            // Wait if already refreshing
            await new Promise((r) => setTimeout(r, 1000));
            return executeQuery(queryFn);
          }

          try {
            setIsRefreshing(true);
            // Refresh the token
            await refreshToken();
            // Retry the query with the new token
            return await Promise.resolve(queryFn(supabase));
          } finally {
            setIsRefreshing(false);
          }
        }
        // If it's not an auth error, rethrow
        throw error;
      }
    },
    [supabase, refreshToken, isRefreshing]
  );

  return {
    supabase,
    loading,
    error,
    executeQuery,
    refreshToken,
  };
}

export default useSupabaseWithAuth;

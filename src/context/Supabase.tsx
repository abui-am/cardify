'use client';

import useCreateClerkSupabaseClient from '@/hooks/useCreateClerkSupabaseClient';
import { useAuth } from '@clerk/nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';

export const SupabaseContext = createContext<{
  supabase: SupabaseClient | undefined;
  loading: boolean;
  error: Error | undefined;
  refreshToken: () => Promise<void>;
}>({
  supabase: undefined,
  loading: false,
  error: undefined,
  refreshToken: async () => {},
});

// Use this hook to access the Supabase client
export const useSupabase = () => useContext(SupabaseContext);

const TOKEN_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes before expiry

export const SupabaseProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { getToken } = useAuth();
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [supabase, setSupabase] = useState<SupabaseClient>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();

  // Function to fetch a fresh token and create a new Supabase client
  const refreshToken = useCallback(async () => {
    try {
      const token = await getToken({ template: 'supabase' });
      if (!token) {
        throw new Error('No token found');
      }
      const newSupabaseClient = useCreateClerkSupabaseClient(token);
      setSupabase(newSupabaseClient);
    } catch (err) {
      console.error('Error refreshing token:', err);
      setError(err as Error);
      throw err;
    }
  }, [getToken]);

  // Initialize the Supabase client
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        await refreshToken();
      } catch (err) {
        console.error('Failed to initialize Supabase client:', err);
      } finally {
        setLoading(false);
      }
    };

    initialize();

    // Set up periodic token refresh
    refreshTimerRef.current = setInterval(async () => {
      try {
        await refreshToken();
        console.log('Token refreshed successfully');
      } catch (err) {
        console.error('Failed to refresh token in interval:', err);
      }
    }, TOKEN_REFRESH_INTERVAL);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [refreshToken]);

  // Set up error handler for API calls
  useEffect(() => {
    if (!supabase) return;

    // This is where we'd set up a response interceptor if needed
    // For Supabase, we handle this in our fetch handler in useCreateClerkSupabaseClient
  }, [supabase]);

  return (
    <SupabaseContext.Provider
      value={{ supabase, loading, error, refreshToken }}
    >
      {loading ? <div className='loading-overlay'>Loading...</div> : children}
    </SupabaseContext.Provider>
  );
};

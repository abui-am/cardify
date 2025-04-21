import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../database.types';

// Custom error type with status property
interface FetchError extends Error {
  status?: number;
}

function createClerkSupabaseClient(token: string) {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    {
      global: {
        // Get the custom Supabase token from Clerk
        fetch: async (url, options = {}) => {
          // Insert the Clerk Supabase token into the headers
          const headers = new Headers(options?.headers);
          headers.set('Authorization', `Bearer ${token}`);

          try {
            // Make the fetch request
            const response = await fetch(url, {
              ...options,
              headers,
            });

            // Check for auth-related errors
            if (response.status === 401) {
              // Token is likely expired
              console.warn('Received 401 from Supabase, token may be expired');
              const error: FetchError = new Error('JWT expired');
              error.status = 401;
              throw error;
            }

            return response;
          } catch (error: unknown) {
            console.error('Fetch error in Supabase client:', error);
            // Add status code to network errors to help with token refresh logic
            if (
              error instanceof Error &&
              error.message.includes('fetch failed')
            ) {
              (error as FetchError).status = 0;
            }
            throw error;
          }
        },
      },
      auth: {
        autoRefreshToken: false, // We handle token refresh ourselves through Clerk
        persistSession: false, // We don't need to persist the session as Clerk handles this
      },
    }
  );
}

export default createClerkSupabaseClient;

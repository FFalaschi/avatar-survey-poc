/**
 * Supabase Client Configuration
 *
 * Provides type-safe Supabase clients for both server and browser environments.
 * Uses @supabase/ssr for server-side rendering compatibility.
 */

import { createClient as createBrowserSupabaseClient } from '@supabase/supabase-js'
import { createServerClient as createServerSupabaseClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

/**
 * Create a Supabase client for browser/client-side usage
 *
 * Use this in client components ('use client') for direct database access.
 *
 * @returns Typed Supabase client for browser
 */
export function createBrowserClient() {
  return createBrowserSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Create a Supabase client for server-side usage
 *
 * Use this in server components, API routes, and server actions.
 * Properly handles cookies for authentication.
 *
 * @returns Typed Supabase client for server
 */
export async function createServerClient() {
  const cookieStore = await cookies()

  return createServerSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `remove` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

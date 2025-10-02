/**
 * Supabase Browser Client
 *
 * Use this in client components ('use client') for direct database access.
 * This file is safe to import in client components.
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

/**
 * Create a Supabase client for browser/client-side usage
 *
 * @returns Typed Supabase client for browser
 */
export function createBrowserClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

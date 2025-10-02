/**
 * Session Token API Route
 *
 * POST /api/session-token
 * Creates an Anam session token for WebRTC connection
 *
 * Security: This endpoint must NEVER expose the ANAM_API_KEY to clients.
 * Rate limiting should be implemented in production.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'
import { createSessionToken } from '@/lib/anam'
import type { SessionTokenRequest, PersonaConfig } from '@/types/survey.types'

export async function POST(request: NextRequest) {
  try {
    const body: SessionTokenRequest = await request.json()
    const { surveyId } = body

    if (!surveyId) {
      return NextResponse.json(
        { error: 'surveyId is required' },
        { status: 400 }
      )
    }

    // Fetch survey from database
    const supabase = await createSupabaseServer()
    const { data: survey, error: fetchError } = await supabase
      .from('surveys')
      .select('persona_config')
      .eq('id', surveyId)
      .single()

    if (fetchError || !survey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      )
    }

    // Extract persona config from survey
    const personaConfig = survey.persona_config as unknown as PersonaConfig

    // Validate persona config has required fields
    if (!personaConfig.name || !personaConfig.avatarId || !personaConfig.voiceId || !personaConfig.systemPrompt) {
      return NextResponse.json(
        { error: 'Invalid persona configuration in survey' },
        { status: 500 }
      )
    }

    // Create session token (server-side only)
    const sessionToken = await createSessionToken(personaConfig)

    return NextResponse.json({ sessionToken })
  } catch (error) {
    console.error('Session token error:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create session token' },
      { status: 500 }
    )
  }
}

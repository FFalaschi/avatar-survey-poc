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
import { createSessionToken, buildSystemPrompt } from '@/lib/anam'
import type { SessionTokenRequest, PersonaConfig, Survey } from '@/types/survey.types'

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

    // Fetch full survey from database (including questions)
    const supabase = await createSupabaseServer()
    const { data: survey, error: fetchError } = await supabase
      .from('surveys')
      .select('*')
      .eq('id', surveyId)
      .single()

    if (fetchError || !survey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      )
    }

    // Extract persona config from survey (Supabase returns snake_case)
    const personaConfig = survey.persona_config as unknown as PersonaConfig

    // Cast survey to Survey type for questions access
    const surveyData = survey as unknown as Survey

    // Validate persona config has required fields
    if (!personaConfig.name || !personaConfig.avatarId || !personaConfig.voiceId) {
      return NextResponse.json(
        { error: 'Invalid persona configuration in survey' },
        { status: 500 }
      )
    }

    // Validate questions exist
    if (!surveyData.questions || !Array.isArray(surveyData.questions) || surveyData.questions.length === 0) {
      return NextResponse.json(
        { error: 'Survey has no questions' },
        { status: 500 }
      )
    }

    // Build dynamic system prompt
    const systemPrompt = buildSystemPrompt(
      surveyData.title,
      personaConfig.name,
      surveyData.questions
    )

    // Create persona config with fields Anam API accepts for custom personas
    // Must include llmId to specify which language model to use
    const dynamicPersonaConfig: PersonaConfig = {
      name: personaConfig.name,
      avatarId: personaConfig.avatarId,
      voiceId: personaConfig.voiceId,
      llmId: 'anam-gpt-5-chat', // Valid LLM for this Anam account
      systemPrompt,
    }

    console.log('Dynamic System Prompt Generated:', {
      surveyTitle: surveyData.title,
      personaName: personaConfig.name,
      questionCount: surveyData.questions.length,
      promptLength: systemPrompt.length,
    })

    // Create session token (server-side only)
    const sessionToken = await createSessionToken(dynamicPersonaConfig)

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

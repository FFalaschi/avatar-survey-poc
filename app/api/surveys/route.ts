/**
 * Surveys API Route
 *
 * GET /api/surveys - List all surveys
 * POST /api/surveys - Create new survey
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import type { CreateSurveyRequest } from '@/types/survey.types'

export async function GET() {
  try {
    const supabase = await createServerClient()

    const { data: surveys, error } = await supabase
      .from('surveys')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Surveys fetch error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(surveys)
  } catch (error) {
    console.error('Surveys GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch surveys' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateSurveyRequest = await request.json()
    const { title, personaConfig, questions } = body

    // Validate required fields
    if (!title || !personaConfig || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: title, personaConfig, questions' },
        { status: 400 }
      )
    }

    // Validate personaConfig
    if (!personaConfig.name || !personaConfig.avatarId || !personaConfig.voiceId || !personaConfig.systemPrompt) {
      return NextResponse.json(
        { error: 'Invalid personaConfig: name, avatarId, voiceId, and systemPrompt are required' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    const { data: survey, error } = await supabase
      .from('surveys')
      .insert({
        title,
        persona_config: personaConfig as any,
        questions: questions as any,
      })
      .select()
      .single()

    if (error) {
      console.error('Survey create error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(survey, { status: 201 })
  } catch (error) {
    console.error('Surveys POST error:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create survey' },
      { status: 500 }
    )
  }
}

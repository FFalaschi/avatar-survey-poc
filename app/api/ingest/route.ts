/**
 * Ingest API Route
 *
 * POST /api/ingest
 * Receives and stores messages, answers, and session data from the client
 *
 * Handles three types of requests:
 * 1. session_start - Creates a new session
 * 2. message - Stores a transcript message
 * 3. answer - Stores a structured answer
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'
import type { IngestRequest } from '@/types/survey.types'

export async function POST(request: NextRequest) {
  try {
    const body: IngestRequest = await request.json()
    const supabase = await createSupabaseServer()

    if (body.kind === 'session_start') {
      // Create new session
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          id: body.session.id,
          survey_id: body.session.surveyId,
          participant_id: body.session.participantId,
          status: body.session.status,
        })
        .select()
        .single()

      if (error) {
        // Check if it's a duplicate session
        if (error.code === '23505') {
          return NextResponse.json({ success: true })
        }
        console.error('Session insert error:', error)
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, data })
    }

    if (body.kind === 'message') {
      // Store message/transcript
      const { data, error } = await supabase
        .from('messages')
        .insert({
          session_id: body.session.id,
          role: body.message.role,
          text: body.message.text,
          timestamp: body.message.timestamp,
        })
        .select()
        .single()

      if (error) {
        console.error('Message insert error:', error)
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, data })
    }

    if (body.kind === 'answer') {
      // Store structured answer
      const { data, error } = await supabase
        .from('answers')
        .insert({
          session_id: body.session.id,
          question_id: body.answer.questionId,
          answer_text: body.answer.answerText || null,
          answer_json: body.answer.answerJson || null,
          confidence: body.answer.confidence || null,
        })
        .select()
        .single()

      if (error) {
        console.error('Answer insert error:', error)
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, data })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request kind' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Ingest error:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to ingest data' },
      { status: 500 }
    )
  }
}

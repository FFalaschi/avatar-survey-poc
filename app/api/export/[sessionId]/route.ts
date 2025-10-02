/**
 * CSV Export API Route
 *
 * GET /api/export/[sessionId] - Export session data as CSV
 *
 * Generates Excel-compatible CSV with UTF-8 BOM
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

interface RouteParams {
  params: Promise<{ sessionId: string }>
}

function escapeCSV(value: string | null | undefined): string {
  if (value === null || value === undefined) {
    return ''
  }

  const stringValue = String(value)

  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { sessionId } = await params
    const supabase = await createServerClient()

    // Fetch session data
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*, surveys(title, questions)')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Fetch answers for this session
    const { data: answers, error: answersError } = await supabase
      .from('answers')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true })

    if (answersError) {
      return NextResponse.json(
        { error: 'Failed to fetch answers' },
        { status: 500 }
      )
    }

    // Build question map for lookup
    const survey = session.surveys as any
    const questionMap = new Map()
    if (survey && survey.questions) {
      for (const q of survey.questions) {
        questionMap.set(q.id, q.text)
      }
    }

    // Generate CSV with UTF-8 BOM for Excel compatibility
    const BOM = '\uFEFF'
    const headers = ['participantId', 'questionId', 'questionText', 'answerText', 'timestamp']
    const rows: string[] = [headers.join(',')]

    for (const answer of answers || []) {
      const row = [
        escapeCSV(session.participant_id),
        escapeCSV(answer.question_id),
        escapeCSV(questionMap.get(answer.question_id) || ''),
        escapeCSV(answer.answer_text),
        escapeCSV(answer.timestamp),
      ]
      rows.push(row.join(','))
    }

    const csv = BOM + rows.join('\n')

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="survey-results-${sessionId}.csv"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export CSV' },
      { status: 500 }
    )
  }
}

/**
 * Survey Detail API Route
 *
 * GET /api/surveys/[id] - Get single survey
 * PATCH /api/surveys/[id] - Update survey
 * DELETE /api/surveys/[id] - Delete survey
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const supabase = await createSupabaseServer()

    const { data: survey, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !survey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(survey)
  } catch (error) {
    console.error('Survey GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch survey' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const body = await request.json()
    const supabase = await createSupabaseServer()

    // Only allow updating specific fields
    const updates: any = {}
    if (body.title) updates.title = body.title
    if (body.personaConfig) updates.persona_config = body.personaConfig
    if (body.questions) updates.questions = body.questions

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const { data: survey, error } = await supabase
      .from('surveys')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Survey update error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (!survey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(survey)
  } catch (error) {
    console.error('Survey PATCH error:', error)
    return NextResponse.json(
      { error: 'Failed to update survey' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const supabase = await createSupabaseServer()

    const { error } = await supabase
      .from('surveys')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Survey delete error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Survey DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete survey' },
      { status: 500 }
    )
  }
}

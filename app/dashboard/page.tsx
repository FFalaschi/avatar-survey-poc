'use client'

/**
 * Dashboard Page
 *
 * View sessions, transcripts, and export results
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'
import type { Session, Message, Answer } from '@/types/survey.types'

interface SessionWithSurvey extends Session {
  surveys?: {
    title: string
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<SessionWithSurvey[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [answers, setAnswers] = useState<Answer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'abandoned'>('all')

  useEffect(() => {
    fetchSessions()
  }, [statusFilter])

  useEffect(() => {
    if (selectedSessionId) {
      fetchSessionDetails(selectedSessionId)
    }
  }, [selectedSessionId])

  async function fetchSessions() {
    try {
      setIsLoading(true)
      const supabase = createBrowserClient()

      let query = supabase
        .from('sessions')
        .select(`
          *,
          surveys (
            title
          )
        `)
        .order('started_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query

      if (error) throw error

      setSessions(data as SessionWithSurvey[] || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions')
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchSessionDetails(sessionId: string) {
    try {
      const supabase = createBrowserClient()

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true })

      if (messagesError) throw messagesError

      setMessages(messagesData || [])

      // Fetch answers
      const { data: answersData, error: answersError } = await supabase
        .from('answers')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true })

      if (answersError) throw answersError

      setAnswers(answersData || [])
    } catch (err) {
      console.error('Failed to fetch session details:', err)
    }
  }

  function handleExportCSV(sessionId: string) {
    window.open(`/api/export/${sessionId}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">View survey responses and transcripts</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            ← Back to Home
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Sessions List */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Sessions</h3>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="abandoned">Abandoned</option>
                </select>
              </div>

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : sessions.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">
                  No sessions found
                </p>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {sessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => setSelectedSessionId(session.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedSessionId === session.id
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {session.surveys?.title || 'Unknown Survey'}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {new Date(session.startedAt).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            session.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : session.status === 'active'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {session.status}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Session Details */}
          <div className="md:col-span-2">
            {!selectedSessionId ? (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">👈</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Select a Session
                </h3>
                <p className="text-gray-600">
                  Choose a session from the list to view transcript and answers
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Export Button */}
                <div className="bg-white rounded-lg shadow-lg p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Session {selectedSessionId.slice(0, 8)}</h3>
                    <p className="text-sm text-gray-600">{answers.length} answers recorded</p>
                  </div>
                  <button
                    onClick={() => handleExportCSV(selectedSessionId)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Export CSV
                  </button>
                </div>

                {/* Transcript */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Transcript
                  </h3>

                  {messages.length === 0 ? (
                    <p className="text-gray-500 text-sm">No messages yet</p>
                  ) : (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`p-3 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-blue-50 ml-8'
                              : 'bg-gray-50 mr-8'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-gray-600">
                              {message.role === 'user' ? 'Participant' : 'Researcher'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900">{message.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Structured Answers */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Structured Answers
                  </h3>

                  {answers.length === 0 ? (
                    <p className="text-gray-500 text-sm">No answers recorded yet</p>
                  ) : (
                    <div className="space-y-3">
                      {answers.map((answer) => (
                        <div
                          key={answer.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-900">
                              {answer.questionId}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(answer.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {answer.answerText || 'No text answer'}
                          </p>
                          {answer.answerJson && (
                            <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                              {JSON.stringify(answer.answerJson, null, 2)}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

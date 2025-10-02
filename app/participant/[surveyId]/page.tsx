'use client'

/**
 * Participant Survey Page
 *
 * Live avatar interaction for survey participants
 */

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import AnamClient from '@/components/AnamClient'
import type { Survey, Message } from '@/types/survey.types'

interface ParticipantPageProps {
  params: Promise<{ surveyId: string }>
}

export default function ParticipantPage({ params }: ParticipantPageProps) {
  const resolvedParams = use(params)
  const { surveyId } = resolvedParams
  const router = useRouter()

  const [survey, setSurvey] = useState<Survey | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionId] = useState(() => crypto.randomUUID())
  const [participantId] = useState(() => `participant-${Date.now()}`)
  const [hasStarted, setHasStarted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    fetchSurvey()
  }, [surveyId])

  async function fetchSurvey() {
    try {
      const response = await fetch(`/api/surveys/${surveyId}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Survey not found')
        }
        throw new Error('Failed to load survey')
      }

      const data = await response.json()
      setSurvey(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load survey')
    } finally {
      setIsLoading(false)
    }
  }

  function handleSessionReady() {
    console.log('Session ready!')
  }

  function handleMessage(message: Message) {
    setMessages((prev) => [...prev, message])
  }

  function handleAnswer(block: any) {
    console.log('Answer received:', block)
  }

  function handleError(err: Error) {
    setError(err.message)
  }

  async function handleEndSession() {
    setIsCompleted(true)
    // You could also mark the session as completed in the database here
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading survey...</p>
        </div>
      </div>
    )
  }

  if (error || !survey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error || 'Survey not found'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Survey Complete!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for participating. Your responses have been recorded.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{survey.title}</h1>
            <p className="text-gray-600 mt-1">
              {Array.isArray(survey.questions) ? survey.questions.length : 0} questions
            </p>
          </div>
          {hasStarted && (
            <button
              onClick={handleEndSession}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              End Session
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Avatar Panel */}
          <div className="md:col-span-2">
            {!hasStarted ? (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">🤖</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to Start?
                </h2>
                <p className="text-gray-600 mb-8">
                  Click the button below to begin your conversation with the AI researcher.
                  Make sure your microphone is enabled.
                </p>
                <button
                  onClick={() => setHasStarted(true)}
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-semibold"
                >
                  Start Survey
                </button>
                <p className="text-sm text-gray-500 mt-4">
                  Note: This requires microphone access for voice interaction
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <AnamClient
                  surveyId={surveyId}
                  sessionId={sessionId}
                  participantId={participantId}
                  onSessionReady={handleSessionReady}
                  onMessage={handleMessage}
                  onAnswer={handleAnswer}
                  onError={handleError}
                />
              </div>
            )}
          </div>

          {/* Transcript Panel */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Transcript
              </h3>

              {messages.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  Your conversation will appear here...
                </p>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {messages.map((message, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-50 ml-4'
                          : 'bg-gray-50 mr-4'
                      }`}
                    >
                      <div className="text-xs font-semibold text-gray-600 mb-1">
                        {message.role === 'user' ? 'You' : 'Researcher'}
                      </div>
                      <div className="text-sm text-gray-900">{message.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Progress Indicator */}
            {hasStarted && Array.isArray(survey.questions) && (
              <div className="bg-white rounded-lg shadow-lg p-6 mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Progress
                </h3>
                <div className="space-y-2">
                  {survey.questions.map((q, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                        {idx + 1}
                      </div>
                      <div className="text-sm text-gray-600 truncate">
                        {q.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

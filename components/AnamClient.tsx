'use client'

/**
 * Anam WebRTC Client Component
 *
 * Handles WebRTC connection to Anam.ai avatar, message processing,
 * and structured data extraction from machine blocks.
 */

import { useEffect, useRef, useState } from 'react'
import { createClient, AnamEvent } from '@anam-ai/js-sdk'
import { extractMachineBlock } from '@/lib/anam'
import type { Message, MachineBlock } from '@/types/survey.types'

interface AnamClientProps {
  surveyId: string
  sessionId: string
  participantId: string
  onSessionReady?: () => void
  onMessage?: (message: Message) => void
  onAnswer?: (block: MachineBlock) => void
  onError?: (error: Error) => void
}

export default function AnamClient({
  surveyId,
  sessionId,
  participantId,
  onSessionReady,
  onMessage,
  onAnswer,
  onError,
}: AnamClientProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const clientRef = useRef<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    let mounted = true

    async function initializeClient() {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch session token from server
        const tokenResponse = await fetch('/api/session-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ surveyId }),
        })

        if (!tokenResponse.ok) {
          throw new Error('Failed to create session token')
        }

        const { sessionToken } = await tokenResponse.json()

        if (!mounted) return

        // Initialize Anam client
        const client = await createClient(sessionToken)

        if (!mounted) {
          // Cleanup if needed
          return
        }

        clientRef.current = client

        // Stream to video element by ID
        await client.streamToVideoElement('anam-avatar-video')

        // Register event listeners
        client.addListener(AnamEvent.SESSION_READY, async () => {
          if (!mounted) return

          setIsReady(true)
          setIsLoading(false)
          onSessionReady?.()

          // Notify server of session start
          await fetch('/api/ingest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              kind: 'session_start',
              session: {
                id: sessionId,
                surveyId,
                participantId,
                status: 'active',
              },
            }),
          })

          // Trigger avatar to start the introduction immediately
          // The system prompt instructs the avatar to introduce itself and ask the first question
          console.log('Session ready - triggering introduction')
          client.talk('Please begin the interview.')
        })

        client.addListener(AnamEvent.MESSAGE_HISTORY_UPDATED, async (messages: any[]) => {
          if (!mounted || messages.length === 0) return

          const lastMessage = messages[messages.length - 1]
          const messageData: Message = {
            id: crypto.randomUUID(),
            sessionId,
            role: lastMessage.role || 'assistant',
            text: lastMessage.text || '',
            timestamp: new Date().toISOString(),
          }

          // Store message
          await fetch('/api/ingest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              kind: 'message',
              session: { id: sessionId, surveyId, participantId },
              message: {
                role: messageData.role,
                text: messageData.text,
                timestamp: messageData.timestamp,
              },
            }),
          })

          onMessage?.(messageData)

          // Check for machine block
          const block = extractMachineBlock(messageData.text)
          if (block && block.status === 'answered') {
            onAnswer?.(block)

            // Store structured answer
            await fetch('/api/ingest', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                kind: 'answer',
                session: { id: sessionId, surveyId, participantId },
                answer: {
                  questionId: block.questionId,
                  answerText: block.answer?.text || null,
                  answerJson: block.answer || null,
                  confidence: null,
                },
              }),
            })
          }
        })

        client.addListener(AnamEvent.MESSAGE_STREAM_EVENT_RECEIVED, (event: any) => {
          // Optional: Handle real-time caption events
          // console.log('Stream event:', event)
        })
      } catch (err) {
        if (!mounted) return

        console.error('Anam client error:', err)
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize avatar'
        setError(errorMessage)
        setIsLoading(false)
        onError?.(err instanceof Error ? err : new Error(errorMessage))
      }
    }

    initializeClient()

    return () => {
      mounted = false
      // Cleanup client if needed
      clientRef.current = null
    }
  }, [surveyId, sessionId, participantId, onSessionReady, onMessage, onAnswer, onError])

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          Connection Error
        </h3>
        <p className="text-red-700">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Connecting to avatar...</p>
          </div>
        </div>
      )}

      <video
        id="anam-avatar-video"
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full h-auto rounded-lg shadow-lg ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        style={{ maxHeight: '600px' }}
      />

      {isReady && (
        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
          ● Connected
        </div>
      )}
    </div>
  )
}

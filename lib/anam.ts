/**
 * Anam API Helpers
 *
 * Server-side only functions for interacting with Anam.ai API.
 * NEVER expose ANAM_API_KEY to the client.
 */

import type { PersonaConfig } from '@/types/survey.types'

const ANAM_API_BASE = 'https://api.anam.ai/v1'

/**
 * Create a session token for Anam WebRTC connection
 *
 * This function MUST only be called server-side (API routes, server actions).
 * The session token is then passed to the client for WebRTC initialization.
 *
 * @param personaConfig - Configuration for the AI persona
 * @returns Session token string
 * @throws Error if API key is missing or request fails
 */
export async function createSessionToken(
  personaConfig: PersonaConfig
): Promise<string> {
  const apiKey = process.env.ANAM_API_KEY

  if (!apiKey) {
    throw new Error('ANAM_API_KEY environment variable is not set')
  }

  // New Anam API format - use personaId instead of individual config
  // The avatarId IS the personaId in the new API
  const requestBody = {
    personaConfig: {
      personaId: personaConfig.avatarId, // Avatar ID is the persona ID
      systemPrompt: personaConfig.systemPrompt, // Override with survey-specific prompt
    },
  }

  console.log('Anam API Request:', {
    url: `${ANAM_API_BASE}/auth/session-token`,
    hasApiKey: !!apiKey,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'MISSING',
    body: requestBody,
  })

  try {
    const response = await fetch(`${ANAM_API_BASE}/auth/session-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    const responseText = await response.text()
    console.log('Anam API Response:', {
      status: response.status,
      statusText: response.statusText,
      body: responseText,
    })

    if (!response.ok) {
      let errorDetails = responseText
      try {
        const errorJson = JSON.parse(responseText)
        errorDetails = JSON.stringify(errorJson, null, 2)
      } catch {
        // Response is not JSON, use as-is
      }

      throw new Error(
        `Anam API error (${response.status}): ${errorDetails}`
      )
    }

    const data = JSON.parse(responseText)

    if (!data.sessionToken) {
      throw new Error('Session token not returned from Anam API')
    }

    return data.sessionToken
  } catch (error) {
    console.error('Anam API Error:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to create Anam session token: ${error.message}`)
    }
    throw new Error('Failed to create Anam session token: Unknown error')
  }
}

/**
 * Extract machine block from avatar message
 *
 * Machine blocks are embedded in messages as: <machine>{...json...}</machine>
 * This is used client-side and server-side for parsing structured data.
 *
 * @param text - Message text from avatar
 * @returns Parsed machine block object or null if not found
 */
export function extractMachineBlock(text: string): any | null {
  const start = text.indexOf('<machine>')
  const end = text.indexOf('</machine>')

  if (start === -1 || end === -1) {
    return null
  }

  try {
    const jsonStr = text.slice(start + '<machine>'.length, end).trim()
    return JSON.parse(jsonStr)
  } catch (error) {
    console.error('Failed to parse machine block:', error)
    return null
  }
}

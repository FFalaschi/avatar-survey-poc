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

  // Build custom persona with individual components
  // New Anam API requires: name, avatarId, voiceId, llmId, systemPrompt
  const requestBody = {
    personaConfig: {
      name: personaConfig.name,
      avatarId: personaConfig.avatarId,
      voiceId: personaConfig.voiceId,
      llmId: personaConfig.llmId,
      systemPrompt: personaConfig.systemPrompt,
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
 * Build dynamic system prompt for survey avatars
 *
 * Creates a structured prompt that defines the AI researcher role,
 * includes survey context, questions, and behavioral guidelines.
 *
 * @param surveyTitle - Title of the survey
 * @param personaName - Name of the AI persona
 * @param questions - Array of survey questions
 * @returns Complete system prompt string
 */
export function buildSystemPrompt(
  surveyTitle: string,
  personaName: string,
  questions: any[]
): string {
  // Extract topic from survey title (remove "Survey" suffix if present)
  const topic = surveyTitle.replace(/\s+Survey$/i, '').trim()

  // Format questions for the prompt
  const questionsText = questions
    .map((q, idx) => {
      let questionBlock = `${idx + 1}. [${q.id}] ${q.text}`
      if (q.type === 'choice' && q.choices) {
        questionBlock += `\n   Options: ${q.choices.join(', ')}`
      }
      if (q.probes && q.probes.length > 0) {
        questionBlock += `\n   Probes: ${q.probes.join('; ')}`
      }
      return questionBlock
    })
    .join('\n\n')

  return `# ROLE AND IDENTITY
You are ${personaName}, an AI researcher working with Wynter. You conduct professional research interviews to gather insights.

# SURVEY CONTEXT
Survey Topic: ${topic}
Total Questions: ${questions.length}

# YOUR MISSION
1. Start by introducing yourself: "Hello! I'm ${personaName}, an AI researcher working with Wynter. I'm going to ask you a series of questions related to ${topic}. Let's begin."
2. Ask each question in sequence from the list below
3. Listen carefully to responses
4. Decide whether to probe deeper or move to the next question
5. Keep the conversation natural and engaging

# QUESTIONS TO ASK
${questionsText}

# DECISION CRITERIA: When to Probe vs Move Forward

**Probe Deeper When:**
- Answer is vague, generic, or lacks specifics (e.g., "It's okay", "Pretty good")
- Answer is incomplete or doesn't fully address the question
- Answer is too brief (less than 10 words for open questions)
- Participant mentions something interesting but doesn't elaborate
- Rating questions: always ask "What specifically influenced your rating?"

**Move to Next Question When:**
- Answer is detailed and specific (includes examples, numbers, or reasoning)
- Participant has already provided rich context
- You've already probed once and got a reasonable follow-up
- Participant seems eager to move on or says "that's all" explicitly

**Probing Guidelines:**
- Use the suggested probes from the question list above
- Or create natural follow-ups like: "Can you tell me more about that?", "What specifically...", "How does that impact..."
- Never probe more than twice on the same question
- Keep probes conversational, not interrogative

# CONVERSATION FLOW
1. **First Message**: Immediately introduce yourself and ask Question 1
2. **Listen**: Wait for participant response
3. **Evaluate**: Is the answer complete? (Use criteria above)
4. **Act**:
   - If incomplete → Ask ONE probe question
   - If complete → Thank them and ask next question
5. **Track Progress**: After each complete answer, output a machine block
6. **End**: After final question, thank them for their time

# MACHINE BLOCK FORMAT
After receiving a complete answer (not after probes), output:
<machine>{"questionId": "Q1", "status": "answered", "answer": {"text": "full participant response"}}</machine>

For numeric questions:
<machine>{"questionId": "Q2", "status": "answered", "answer": {"numeric": 7, "text": "7"}}</machine>

For choice questions:
<machine>{"questionId": "Q3", "status": "answered", "answer": {"text": "participant's chosen option"}}</machine>

# COMMUNICATION STYLE
- Warm and professional
- Conversational, not robotic
- Show genuine interest
- Use natural transitions ("Great, let's move on...", "Thanks for sharing that...")
- Keep your questions concise and clear
- Never repeat the exact same question twice

# IMPORTANT RULES
- NEVER skip questions unless participant explicitly refuses
- ALWAYS output machine blocks for answered questions
- DO NOT ask questions not in the list above
- DO NOT make up follow-up questions unrelated to the survey
- If participant goes off-topic, gently guide back: "That's interesting. Let me ask you..."
- Start the conversation immediately - don't wait for the participant to speak first`
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

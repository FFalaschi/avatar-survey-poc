'use client'

/**
 * Survey Form Component
 *
 * Admin interface for creating and editing surveys with persona configuration
 * and dynamic question management.
 */

import { useState } from 'react'
import type { PersonaConfig, Question, QuestionType } from '@/types/survey.types'

interface SurveyFormProps {
  onSubmit: (data: {
    title: string
    personaConfig: PersonaConfig
    questions: Question[]
  }) => Promise<void>
  initialData?: {
    title: string
    personaConfig: PersonaConfig
    questions: Question[]
  }
}

export default function SurveyForm({ onSubmit, initialData }: SurveyFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [personaName, setPersonaName] = useState(initialData?.personaConfig.name || '')
  const [avatarId, setAvatarId] = useState(initialData?.personaConfig.avatarId || 'professional_female_01')
  const [voiceId, setVoiceId] = useState(initialData?.personaConfig.voiceId || 'calm_voice_02')
  const [systemPrompt, setSystemPrompt] = useState(
    initialData?.personaConfig.systemPrompt ||
    'You are a market researcher. Ask each survey question in order. If an answer is vague or too short, ask a probing follow-up. Confirm numeric responses explicitly. After receiving a complete answer, output a machine block: <machine>{"questionId": "Q1", "status": "answered", "answer": {"text": "answer"}}</machine>'
  )
  const [questions, setQuestions] = useState<Question[]>(
    initialData?.questions || [
      {
        id: 'Q1',
        type: 'open',
        text: '',
        required: true,
        probes: [],
      },
    ]
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addQuestion = () => {
    const nextId = `Q${questions.length + 1}`
    setQuestions([
      ...questions,
      {
        id: nextId,
        type: 'open',
        text: '',
        required: true,
        probes: [],
      },
    ])
  }

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], ...updates }
    setQuestions(updated)
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const addProbe = (questionIndex: number) => {
    const updated = [...questions]
    if (!updated[questionIndex].probes) {
      updated[questionIndex].probes = []
    }
    updated[questionIndex].probes!.push('')
    setQuestions(updated)
  }

  const updateProbe = (questionIndex: number, probeIndex: number, value: string) => {
    const updated = [...questions]
    updated[questionIndex].probes![probeIndex] = value
    setQuestions(updated)
  }

  const removeProbe = (questionIndex: number, probeIndex: number) => {
    const updated = [...questions]
    updated[questionIndex].probes = updated[questionIndex].probes!.filter((_, i) => i !== probeIndex)
    setQuestions(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // Validate
      if (!title.trim()) {
        throw new Error('Survey title is required')
      }

      if (!personaName.trim() || !avatarId.trim() || !voiceId.trim() || !systemPrompt.trim()) {
        throw new Error('All persona configuration fields are required')
      }

      if (questions.length === 0) {
        throw new Error('At least one question is required')
      }

      for (const q of questions) {
        if (!q.text.trim()) {
          throw new Error(`Question ${q.id} text is required`)
        }
      }

      await onSubmit({
        title,
        personaConfig: {
          name: personaName,
          avatarId,
          voiceId,
          systemPrompt,
        },
        questions,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save survey')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Survey Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Survey Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
          placeholder="B2B SaaS Customer Research"
        />
      </div>

      {/* Persona Configuration */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Persona Configuration</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Persona Name
            </label>
            <input
              type="text"
              value={personaName}
              onChange={(e) => setPersonaName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400"
              placeholder="B2B Researcher"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Avatar ID
            </label>
            <input
              type="text"
              value={avatarId}
              onChange={(e) => setAvatarId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400"
              placeholder="professional_female_01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voice ID
            </label>
            <input
              type="text"
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400"
              placeholder="calm_voice_02"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            System Prompt
          </label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm text-gray-900 placeholder:text-gray-400"
            placeholder="Enter system prompt..."
          />
          <p className="mt-2 text-sm text-gray-500">
            Include instructions for asking questions, probing, and generating machine blocks.
          </p>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
          <button
            type="button"
            onClick={addQuestion}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Question
          </button>
        </div>

        {questions.map((question, qIndex) => (
          <div key={qIndex} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">{question.id}</h4>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={question.type}
                  onChange={(e) => updateQuestion(qIndex, { type: e.target.value as QuestionType })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                >
                  <option value="open">Open-ended</option>
                  <option value="numeric">Numeric</option>
                  <option value="choice">Multiple Choice</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={question.required}
                    onChange={(e) => updateQuestion(qIndex, { required: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Required</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Text
              </label>
              <input
                type="text"
                value={question.text}
                onChange={(e) => updateQuestion(qIndex, { text: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400"
                placeholder="What is your company size?"
              />
            </div>

            {question.type === 'choice' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choices (comma-separated)
                </label>
                <input
                  type="text"
                  value={question.choices?.join(', ') || ''}
                  onChange={(e) =>
                    updateQuestion(qIndex, { choices: e.target.value.split(',').map((s) => s.trim()) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400"
                  placeholder="Option 1, Option 2, Option 3"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Probing Questions
              </label>
              {question.probes && question.probes.length > 0 && (
                <div className="space-y-2 mb-2">
                  {question.probes.map((probe, pIndex) => (
                    <div key={pIndex} className="flex gap-2">
                      <input
                        type="text"
                        value={probe}
                        onChange={(e) => updateProbe(qIndex, pIndex, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400"
                        placeholder="Can you expand on that?"
                      />
                      <button
                        type="button"
                        onClick={() => removeProbe(qIndex, pIndex)}
                        className="px-3 py-2 text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => addProbe(qIndex)}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                + Add Probe
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Survey'}
        </button>
      </div>
    </form>
  )
}

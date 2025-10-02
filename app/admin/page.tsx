'use client'

/**
 * Admin Panel Page
 *
 * Create and manage surveys with persona configuration
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SurveyForm from '@/components/SurveyForm'
import type { Survey } from '@/types/survey.types'

export default function AdminPage() {
  const router = useRouter()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSurveys()
  }, [])

  async function fetchSurveys() {
    try {
      const response = await fetch('/api/surveys')
      if (!response.ok) throw new Error('Failed to fetch surveys')

      const data = await response.json()
      setSurveys(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load surveys')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateSurvey(data: {
    title: string
    personaConfig: any
    questions: any[]
  }) {
    try {
      const response = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create survey')
      }

      const newSurvey = await response.json()
      setSurveys([newSurvey, ...surveys])
      setShowForm(false)
    } catch (err) {
      throw err // Let SurveyForm handle the error display
    }
  }

  async function handleDeleteSurvey(id: string) {
    if (!confirm('Are you sure you want to delete this survey?')) return

    try {
      const response = await fetch(`/api/surveys/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete survey')

      setSurveys(surveys.filter((s) => s.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete survey')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Survey Admin</h1>
            <p className="text-gray-600 mt-1">Create and manage your surveys</p>
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

        {/* Create Survey Section */}
        {showForm ? (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create New Survey</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
            <SurveyForm onSubmit={handleCreateSurvey} />
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold mb-8"
          >
            + Create New Survey
          </button>
        )}

        {/* Surveys List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Existing Surveys</h2>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : surveys.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No surveys yet. Create your first one!</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {surveys.map((survey) => (
                <div
                  key={survey.id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {survey.title}
                      </h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">Persona:</span>{' '}
                          {typeof survey.personaConfig === 'object' && survey.personaConfig !== null
                            ? (survey.personaConfig as any).name
                            : 'Unknown'}
                        </p>
                        <p>
                          <span className="font-medium">Questions:</span>{' '}
                          {Array.isArray(survey.questions) ? survey.questions.length : 0}
                        </p>
                        <p>
                          <span className="font-medium">Created:</span>{' '}
                          {new Date(survey.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/participant/${survey.id}`)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Test
                      </button>
                      <button
                        onClick={() => handleDeleteSurvey(survey.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <a
                      href={`/participant/${survey.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Survey Link: {window.location.origin}/participant/{survey.id} →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

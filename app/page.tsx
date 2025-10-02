import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Avatar Survey POC
            </h1>
            <p className="text-xl text-gray-600">
              Conversational AI surveys powered by Anam.ai
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Admin Panel
              </h3>
              <p className="text-gray-600 mb-4">
                Create and manage surveys with AI persona configuration
              </p>
              <Link
                href="/admin"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go to Admin
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Participant
              </h3>
              <p className="text-gray-600 mb-4">
                Take surveys by talking to an AI avatar
              </p>
              <Link
                href="/participant/survey_001"
                className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Try Demo Survey
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Dashboard
              </h3>
              <p className="text-gray-600 mb-4">
                View transcripts and export survey results
              </p>
              <Link
                href="/dashboard"
                className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                View Dashboard
              </Link>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Create Survey</h4>
                  <p className="text-gray-600">
                    Configure your survey with questions, persona, and probing templates
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Participants Engage</h4>
                  <p className="text-gray-600">
                    Users interact with the AI avatar through natural conversation
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Analyze Results</h4>
                  <p className="text-gray-600">
                    Review transcripts and export structured data for analysis
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>
              Built with Next.js 14, TypeScript, Supabase, and Anam.ai
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

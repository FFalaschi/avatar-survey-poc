# Avatar Survey POC

A full-stack web application for conducting surveys through conversational AI avatars powered by Anam.ai. Participants interact with a live AI persona via WebRTC video/audio for natural, engaging survey experiences.

## Features

- **Admin Panel**: Create and manage surveys with customizable AI personas
- **Participant Interface**: Real-time avatar interaction with video/audio
- **Dashboard**: View transcripts, structured responses, and export to CSV
- **Intelligent Probing**: Avatar asks follow-up questions for vague or incomplete answers
- **Machine Blocks**: Structured data extraction from conversations
- **Excel-Compatible Export**: UTF-8 CSV export with proper encoding

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL via Supabase
- **AI Avatar**: Anam.ai WebRTC SDK
- **Styling**: Tailwind CSS
- **Hosting**: Vercel-ready

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ and npm
- A [Supabase](https://supabase.com) account and project
- An [Anam.ai](https://anam.ai) account and API key
- Git (for version control)

## Installation

### 1. Clone the Repository

```bash
cd avatar-survey-poc
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Anam AI Configuration
ANAM_API_KEY=your_anam_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
```

**Getting Your Credentials:**

- **Anam API Key**: Log in to [Anam.ai Dashboard](https://dashboard.anam.ai), navigate to API Keys
- **Supabase URL/Key**: Find in your [Supabase Project Settings](https://app.supabase.com) → API
- **Database URL**: Available in Supabase Project Settings → Database → Connection String

### 4. Set Up Database

#### Option A: Using Supabase Dashboard (Recommended)

1. Log in to [Supabase](https://app.supabase.com)
2. Go to your project → SQL Editor
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL Editor and run

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Link to your Supabase project
supabase link --project-ref your-project-ref

# Push migration
supabase db push
```

#### Verify Database Setup

After running the migration, you should see these tables in Supabase:
- `surveys`
- `sessions`
- `messages`
- `answers`

The migration also seeds an example survey (`survey_001`) for testing.

### 5. Generate TypeScript Types (Optional)

For full type safety with Supabase:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.types.ts
```

Note: The project includes pre-generated types, so this step is optional unless you modify the database schema.

## Development

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
```

### Type Checking

```bash
npm run type-check
```

## Usage

### 1. Admin Panel

Navigate to `/admin` to:
- Create new surveys
- Configure AI persona (avatar, voice, system prompt)
- Add questions with types: open-ended, numeric, multiple choice
- Set up probing templates for follow-up questions
- View and manage existing surveys

**System Prompt Tips:**
- Instruct the avatar to ask questions one at a time
- Specify probing behavior for vague answers (< 5 words)
- Include machine block format for structured data extraction
- Example:
  ```
  You are a market researcher. Ask questions in order. If answers are vague, probe deeper.
  After each complete answer, output: <machine>{"questionId": "Q1", "status": "answered", "answer": {"text": "..."}}</machine>
  ```

### 2. Participant Experience

Share the survey URL: `https://yourapp.com/participant/{surveyId}`

Participants will:
1. Click "Start Survey" (required for iOS Safari compatibility)
2. Grant microphone access
3. See and hear the AI avatar
4. Answer questions naturally via voice
5. Receive probing follow-ups if answers are incomplete
6. Complete the survey

**Browser Support:**
- Chrome, Firefox, Edge: Full WebRTC support
- Safari (Desktop): Supported
- Safari (iOS): Requires user interaction before video/audio starts

### 3. Dashboard

Navigate to `/dashboard` to:
- View all survey sessions
- Filter by status (active, completed, abandoned)
- Read full conversation transcripts
- See structured answers extracted from conversations
- Export session data to CSV (Excel-compatible)

**CSV Export:**
- Includes UTF-8 BOM for Excel compatibility
- Columns: participantId, questionId, questionText, answerText, timestamp
- Proper escaping for commas, quotes, and newlines

## Project Structure

```
avatar-survey-poc/
├── app/
│   ├── api/
│   │   ├── session-token/route.ts   # Create Anam session tokens
│   │   ├── ingest/route.ts          # Store messages/answers
│   │   ├── surveys/route.ts         # CRUD for surveys
│   │   └── export/[sessionId]/route.ts  # CSV export
│   ├── admin/page.tsx               # Admin panel
│   ├── participant/[surveyId]/page.tsx  # Participant interface
│   ├── dashboard/page.tsx           # Dashboard
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Landing page
│   └── globals.css                  # Global styles
├── components/
│   ├── AnamClient.tsx               # WebRTC client component
│   └── SurveyForm.tsx               # Survey editor form
├── lib/
│   ├── supabase.ts                  # Supabase client factory
│   └── anam.ts                      # Anam API helpers
├── types/
│   ├── database.types.ts            # Generated Supabase types
│   └── survey.types.ts              # Survey-specific types
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql   # Database schema
└── .env.local.example               # Environment template
```

## API Routes

### POST /api/session-token
Create Anam session token for WebRTC connection

**Request:**
```json
{
  "surveyId": "survey_001"
}
```

**Response:**
```json
{
  "sessionToken": "eyJ..."
}
```

### POST /api/ingest
Store messages, answers, or session data

**Request (Message):**
```json
{
  "kind": "message",
  "session": { "id": "...", "surveyId": "...", "participantId": "..." },
  "message": { "role": "user", "text": "...", "timestamp": "..." }
}
```

### GET /api/surveys
List all surveys

### POST /api/surveys
Create new survey

### GET /api/export/[sessionId]
Export session to CSV

## Configuration

### Avatar and Voice IDs

Valid `avatarId` and `voiceId` values are provided by Anam.ai. Common defaults:
- `avatarId`: `professional_female_01`, `professional_male_01`
- `voiceId`: `calm_voice_02`, `energetic_voice_01`

Check the [Anam.ai documentation](https://docs.anam.ai) for the full list of available avatars and voices.

### System Prompt Engineering

The system prompt drives the entire survey flow. Key elements:

1. **Role Definition**: "You are a market researcher..."
2. **Question Flow**: "Ask questions one at a time in order..."
3. **Probing Logic**: "If answer is < 5 words or vague, ask a follow-up..."
4. **Confirmation**: "Confirm numeric values explicitly..."
5. **Machine Blocks**: Specify exact format for data extraction

**Example:**
```text
You are a B2B market researcher. Ask each survey question in exact order.
If an answer is vague (< 5 words or uncertain terms like "maybe"), ask ONE probing follow-up.
For numeric questions, confirm the range explicitly.
After each complete answer, output:
<machine>{"questionId": "Q1", "status": "answered", "answer": {"text": "user answer"}}</machine>

Survey Questions:
Q1: How many employees does your company have?
Q2: What are your top 3 challenges?
...
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy

**Environment Variables to Set:**
- `ANAM_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL` (optional, for migrations)

### Deploy to Other Platforms

This is a standard Next.js 14 application and can be deployed to:
- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Railway
- Render

Ensure Node.js 18+ is supported and environment variables are configured.

## Troubleshooting

### "Session token not found" Error

**Cause**: Invalid or expired ANAM_API_KEY

**Solution**:
1. Verify `ANAM_API_KEY` in `.env.local`
2. Check API key validity in Anam.ai dashboard
3. Restart dev server after changing environment variables

### Video Not Loading on iOS Safari

**Cause**: iOS requires user interaction before media playback

**Solution**: The "Start Survey" button handles this. Ensure participants click it before the avatar loads.

### Database Connection Errors

**Cause**: Invalid Supabase credentials or network issues

**Solution**:
1. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Check Supabase project status
3. Ensure database migration completed successfully
4. Test connection in Supabase SQL Editor

### TypeScript Compilation Errors

**Cause**: Type mismatches or missing dependencies

**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Run type check
npm run type-check
```

### Microphone Not Working

**Cause**: Browser permissions not granted

**Solution**:
1. Check browser permission settings
2. Ensure HTTPS in production (required for WebRTC)
3. In Chrome, check `chrome://settings/content/microphone`

## Security Considerations

- **API Key Protection**: `ANAM_API_KEY` is NEVER exposed to the client. Session tokens are created server-side.
- **Rate Limiting**: Consider implementing rate limiting on `/api/session-token` in production.
- **Authentication**: This POC doesn't include user authentication. Add Next Auth or similar for production.
- **Row Level Security**: Enable RLS policies in Supabase for production deployments.
- **Data Encryption**: Transcripts may contain PII. Consider encryption at rest.

## Performance Targets

- **Latency**: < 2 seconds from participant utterance to avatar response
- **Session Duration**: Limit to 15 minutes max to control costs
- **Build Size**: Optimized for Vercel's limits
- **Database Queries**: Indexed for fast lookups

## Known Limitations

- No text input fallback for participants without microphones
- System prompt must be carefully crafted for reliable machine block generation
- Avatar and voice IDs must be manually verified against Anam.ai documentation
- CSV export doesn't include full conversation context (only structured answers)

## Future Enhancements

- [ ] Add user authentication for admin/dashboard
- [ ] Implement text input fallback
- [ ] Add real-time session monitoring
- [ ] Support for multi-language surveys
- [ ] Advanced branching logic with visual editor
- [ ] Sentiment analysis on transcripts
- [ ] Integration with external CRMs (Salesforce, HubSpot)
- [ ] Video recording of sessions

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
- Review this README
- Check [Anam.ai Documentation](https://docs.anam.ai)
- Check [Next.js Documentation](https://nextjs.org/docs)
- Check [Supabase Documentation](https://supabase.com/docs)

## Acknowledgments

- Built with [Next.js](https://nextjs.org) by Vercel
- Powered by [Anam.ai](https://anam.ai) for conversational AI
- Database by [Supabase](https://supabase.com)
- Styled with [Tailwind CSS](https://tailwindcss.com)

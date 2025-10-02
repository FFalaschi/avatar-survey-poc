-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Surveys table
CREATE TABLE surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  persona_config JSONB NOT NULL,  -- PersonaConfig object
  questions JSONB NOT NULL,       -- Question[] array
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  participant_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'abandoned')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  CONSTRAINT unique_active_session UNIQUE (survey_id, participant_id, status)
);

-- Messages table (transcripts)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  text TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_session ON messages(session_id, timestamp);

-- Answers table (structured responses)
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  answer_text TEXT,
  answer_json JSONB,
  confidence NUMERIC(3,2),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_answers_session ON answers(session_id);
CREATE INDEX idx_answers_question ON answers(question_id);

-- Update trigger for surveys.updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_surveys_updated_at
BEFORE UPDATE ON surveys
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Seed with example survey
INSERT INTO surveys (title, persona_config, questions) VALUES (
  'B2B SaaS Customer Research',
  '{"name": "B2B Researcher", "avatarId": "professional_female_01", "voiceId": "calm_voice_02", "systemPrompt": "You are a B2B market researcher. Ask each survey question in order. If an answer is vague or too short, ask a probing follow-up. Confirm numeric responses explicitly. Keep turns concise. After receiving a complete answer, output a machine block with structured data in the format: <machine>{\\\"questionId\\\": \\\"Q1\\\", \\\"status\\\": \\\"answered\\\", \\\"answer\\\": {\\\"text\\\": \\\"user answer\\\"}}</machine>"}',
  '[{"id": "Q1", "type": "numeric", "text": "How many employees does your company have?", "required": true, "probes": ["Can you give me the exact range, such as 100–200 or 200–500?"]}, {"id": "Q2", "type": "open", "text": "What are the top 3 challenges you face in your role?", "required": true, "probes": ["Can you expand on why this is challenging?", "Has this challenge changed in the last 6 months?"]}, {"id": "Q3", "type": "choice", "text": "Which of these areas would you invest in first?", "choices": ["Customer support", "Product features", "Sales team", "Marketing"], "required": true}]'
);

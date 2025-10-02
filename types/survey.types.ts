/**
 * Type definitions for Survey System
 *
 * These types define the core data structures used throughout the application
 * for managing surveys, sessions, messages, and answers.
 */

export interface PersonaConfig {
  name: string;
  avatarId: string;
  voiceId: string;
  llmId?: string;
  systemPrompt: string;
}

export type QuestionType = 'numeric' | 'open' | 'choice';

export interface BranchingRule {
  condition: string;               // e.g., "answer > 100"
  nextQuestionId: string;
}

export interface Question {
  id: string;                      // Q1, Q2, etc
  type: QuestionType;
  text: string;
  required: boolean;
  choices?: string[];              // For type='choice'
  probes?: string[];               // Probing follow-ups
  branchingRules?: BranchingRule[];
}

export interface Survey {
  id: string;
  title: string;
  personaConfig: PersonaConfig;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  surveyId: string;
  participantId: string;           // Anonymous or authenticated
  status: 'active' | 'completed' | 'abandoned';
  startedAt: string;
  completedAt?: string;
}

export interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface Answer {
  id: string;
  sessionId: string;
  questionId: string;
  answerText?: string;
  answerJson?: Record<string, any>; // For structured data
  confidence?: number;
  timestamp: string;
}

// Machine block format (parsed from avatar messages)
export interface MachineBlock {
  questionId: string;
  status: 'answered' | 'skipped' | 'pending';
  answer?: {
    text?: string;
    choiceId?: string;
    numeric?: number;
  };
  needsProbe?: boolean;
}

// API request/response types
export interface CreateSurveyRequest {
  title: string;
  personaConfig: PersonaConfig;
  questions: Question[];
}

export interface SessionTokenRequest {
  surveyId: string;
}

export interface SessionTokenResponse {
  sessionToken: string;
}

export type IngestRequest =
  | { kind: 'session_start'; session: { id: string; surveyId: string; participantId: string; status: string } }
  | { kind: 'message'; session: { id: string; surveyId: string; participantId: string }; message: Omit<Message, 'id' | 'sessionId'> }
  | { kind: 'answer'; session: { id: string; surveyId: string; participantId: string }; answer: Omit<Answer, 'id' | 'sessionId' | 'timestamp'> };

export interface IngestResponse {
  success: boolean;
  error?: string;
}

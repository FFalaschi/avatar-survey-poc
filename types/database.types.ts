/**
 * Database types - Generated from Supabase schema
 *
 * Note: In a real project, these would be generated using:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.types.ts
 *
 * For this POC, we're providing the expected structure manually.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      surveys: {
        Row: {
          id: string
          title: string
          persona_config: Json
          questions: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          persona_config: Json
          questions: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          persona_config?: Json
          questions?: Json
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          survey_id: string
          participant_id: string
          status: string
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          survey_id: string
          participant_id: string
          status: string
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          survey_id?: string
          participant_id?: string
          status?: string
          started_at?: string
          completed_at?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          session_id: string
          role: string
          text: string
          timestamp: string
        }
        Insert: {
          id?: string
          session_id: string
          role: string
          text: string
          timestamp?: string
        }
        Update: {
          id?: string
          session_id?: string
          role?: string
          text?: string
          timestamp?: string
        }
      }
      answers: {
        Row: {
          id: string
          session_id: string
          question_id: string
          answer_text: string | null
          answer_json: Json | null
          confidence: number | null
          timestamp: string
        }
        Insert: {
          id?: string
          session_id: string
          question_id: string
          answer_text?: string | null
          answer_json?: Json | null
          confidence?: number | null
          timestamp?: string
        }
        Update: {
          id?: string
          session_id?: string
          question_id?: string
          answer_text?: string | null
          answer_json?: Json | null
          confidence?: number | null
          timestamp?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

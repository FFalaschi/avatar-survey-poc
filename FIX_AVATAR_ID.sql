-- Fix: Update all surveys with correct Avatar ID
-- This corrects the confusion between Persona ID (preset) and Avatar ID (visual component)
--
-- Correct IDs:
-- - Avatar ID: 6dbc1e47-7768-403e-878a-94d7fcc3677b (Sofia visual)
-- - Voice ID: 3e119786-d834-448f-96a2-20c1b5469eb4 (Arabella voice)
--
-- Run this in Supabase SQL Editor

UPDATE surveys
SET persona_config = jsonb_set(
  persona_config,
  '{avatarId}',
  '"6dbc1e47-7768-403e-878a-94d7fcc3677b"'::jsonb
);

-- Verify the update - should show correct avatar and voice IDs
SELECT
  id,
  title,
  persona_config->>'name' as persona_name,
  persona_config->>'avatarId' as avatar_id,
  persona_config->>'voiceId' as voice_id,
  LENGTH(persona_config->>'systemPrompt') as prompt_length
FROM surveys
ORDER BY created_at DESC;

-- Expected output:
-- All surveys should have:
-- - avatar_id: 6dbc1e47-7768-403e-878a-94d7fcc3677b
-- - voice_id: 3e119786-d834-448f-96a2-20c1b5469eb4
-- - prompt_length: should be NULL (prompts now generated dynamically)

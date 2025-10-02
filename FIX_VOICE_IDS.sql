-- Fix: Update all surveys to use a generic/default voice ID
-- Run this in Supabase SQL Editor to fix the "Voice does not exist" error

-- Option 1: Set voice to a common default (try this first)
UPDATE surveys
SET persona_config = jsonb_set(
  persona_config,
  '{voiceId}',
  '"en-US-Journey-D"'::jsonb
);

-- Verify the update
SELECT
  id,
  title,
  persona_config->>'voiceId' as voice_id
FROM surveys;

-- If the above doesn't work, try these alternatives:

-- Option 2: Use a different common voice
-- UPDATE surveys
-- SET persona_config = jsonb_set(
--   persona_config,
--   '{voiceId}',
--   '"en-US-Neural2-D"'::jsonb
-- );

-- Option 3: Remove voiceId to use system default
-- UPDATE surveys
-- SET persona_config = persona_config - 'voiceId';

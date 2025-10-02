-- Update all surveys to use ElevenLabs voice "Arabella"
-- This matches the Anam persona configuration

UPDATE surveys
SET persona_config = jsonb_set(
  jsonb_set(
    persona_config,
    '{voiceId}',
    '"Arabella"'::jsonb
  ),
  '{avatarId}',
  '"sofia"'::jsonb
);

-- Verify the update
SELECT
  id,
  title,
  persona_config->>'name' as persona_name,
  persona_config->>'avatarId' as avatar_id,
  persona_config->>'voiceId' as voice_id,
  persona_config->>'llmId' as llm_id
FROM surveys
ORDER BY created_at DESC;

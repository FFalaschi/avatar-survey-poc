-- FINAL FIX: Update all surveys with correct Anam persona configuration
-- Avatar ID: 6dbc1e47-7768-403e-878a-94d7fcc3677b (Sofia/Sophie)
-- Voice: Arabella (ElevenLabs)
-- LLM: anam-gpt-4o-mini

UPDATE surveys
SET persona_config = jsonb_set(
  jsonb_set(
    jsonb_set(
      persona_config,
      '{avatarId}',
      '"6dbc1e47-7768-403e-878a-94d7fcc3677b"'::jsonb
    ),
    '{voiceId}',
    '"Arabella"'::jsonb
  ),
  '{llmId}',
  '"anam-gpt-4o-mini"'::jsonb
);

-- Verify the update - should show all surveys with correct IDs
SELECT
  id,
  title,
  persona_config->>'name' as persona_name,
  persona_config->>'avatarId' as avatar_id,
  persona_config->>'voiceId' as voice_id,
  persona_config->>'llmId' as llm_id,
  LENGTH(persona_config->>'systemPrompt') as prompt_length
FROM surveys
ORDER BY created_at DESC;

-- Expected output:
-- All surveys should have:
-- - avatar_id: 6dbc1e47-7768-403e-878a-94d7fcc3677b
-- - voice_id: Arabella
-- - llm_id: anam-gpt-4o-mini

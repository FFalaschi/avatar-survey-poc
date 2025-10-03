-- Remove llmId from all surveys
-- llmId is not supported for custom personas in Anam API
--
-- Run this in Supabase SQL Editor

-- Step 1: Check if llmId exists in any surveys
SELECT
  id,
  title,
  persona_config->>'llmId' as llm_id,
  persona_config ? 'llmId' as has_llm_key
FROM surveys
ORDER BY created_at DESC;

-- Step 2: Remove llmId key from all surveys
UPDATE surveys
SET persona_config = persona_config - 'llmId';

-- Step 3: Verify removal - all should show has_llm_key = false
SELECT
  id,
  title,
  persona_config ? 'llmId' as has_llm_key,
  persona_config->>'avatarId' as avatar_id,
  persona_config->>'voiceId' as voice_id
FROM surveys
ORDER BY created_at DESC;

-- Expected result after update:
-- All rows should show:
-- - has_llm_key: false
-- - avatar_id: 6dbc1e47-7768-403e-878a-94d7fcc3677b
-- - voice_id: 3e119786-d834-448f-96a2-20c1b5469eb4

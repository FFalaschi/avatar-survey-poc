# 🔍 Troubleshooting: "Failed to fetch surveys"

## Issue: SQL ran successfully but surveys still don't appear

You got "Success. No rows returned" (which is normal for INSERT), but the admin panel still shows "Failed to fetch surveys".

---

## Step 1: Verify Data Was Inserted

Run this query in Supabase SQL Editor:

```sql
SELECT id, title, created_at FROM surveys ORDER BY created_at DESC;
```

**Expected Result**: You should see 3-4 rows with survey titles.

**If you see 0 rows**: The INSERT failed silently. Proceed to Step 2.
**If you see 3-4 rows**: The data exists! Proceed to Step 3.

---

## Step 2: Check for Insert Errors (If no rows returned)

The INSERT might have failed due to a constraint. Run this diagnostic:

```sql
-- Check if the surveys table exists and has the right structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'surveys';
```

**Expected columns**:
- `id` (uuid)
- `title` (text)
- `persona_config` (jsonb)
- `questions` (jsonb)
- `created_at` (timestamp with time zone)
- `updated_at` (timestamp with time zone)

**If columns are missing**: Re-run the initial schema migration (`001_initial_schema_fixed.sql`)

---

## Step 3: Check Row Level Security (RLS)

RLS policies might be blocking access. Check with this query:

```sql
-- Check if RLS is enabled on surveys table
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'surveys';
```

**If `rowsecurity` is `true`**: RLS is enabled and blocking access.

**Fix**: Disable RLS temporarily or add a policy:

```sql
-- Option A: Disable RLS (for development only)
ALTER TABLE surveys DISABLE ROW LEVEL SECURITY;

-- Option B: Add a permissive policy (recommended)
CREATE POLICY "Enable read access for all users" ON surveys
FOR SELECT USING (true);
```

After running the fix, refresh your admin panel.

---

## Step 4: Verify Supabase Configuration

Check that your environment variables are correct:

**Local Development** (`.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Vercel/Production** (Project Settings → Environment Variables):
- Ensure both variables are set correctly
- After changing, **redeploy** the application

---

## Step 5: Check Browser Console

1. Open your admin panel (`/admin`)
2. Open DevTools (F12 or Cmd+Option+I)
3. Go to **Console** tab
4. Look for red error messages

**Common errors**:
- `Invalid API key` → Check `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `Failed to fetch` → Check `NEXT_PUBLIC_SUPABASE_URL`
- `No rows returned` → Check RLS policies (Step 3)

5. Go to **Network** tab
6. Refresh the page
7. Find the request to `/api/surveys`
8. Click it and check the **Response** tab

---

## Step 6: Test Supabase Connection Directly

Run this in Supabase SQL Editor to verify the data:

```sql
-- Get full survey data
SELECT
  id,
  title,
  persona_config->>'name' as persona_name,
  jsonb_array_length(questions) as question_count,
  created_at
FROM surveys
ORDER BY created_at DESC;
```

**Expected output**: 3-4 surveys with details.

---

## Step 7: Manual Insert Test

If all else fails, try manually inserting ONE survey to test:

```sql
-- Simple test survey
INSERT INTO surveys (title, persona_config, questions)
VALUES (
  'Test Survey',
  '{"name": "Test Persona", "avatarId": "professional_female_01", "voiceId": "calm_voice_02", "systemPrompt": "Test prompt"}'::jsonb,
  '[{"id": "Q1", "type": "open", "text": "Test question?", "required": true}]'::jsonb
);

-- Verify it was inserted
SELECT * FROM surveys WHERE title = 'Test Survey';
```

**If this works**: The issue is with the original migration SQL. Try running each INSERT statement individually.

**If this fails**: Check for database permission issues.

---

## Step 8: Check API Route Logs

If surveys exist in the database but still don't show in the UI:

**Local Development**:
1. Check your terminal where `npm run dev` is running
2. Look for error messages after refreshing `/admin`

**Vercel Production**:
1. Go to Vercel Dashboard → Your Project → **Logs**
2. Filter by `/api/surveys`
3. Look for error messages

---

## Common Solutions Summary

| Issue | Solution |
|-------|----------|
| No rows in database | Re-run migration SQL |
| RLS blocking access | Disable RLS or add SELECT policy |
| Wrong Supabase project | Check `NEXT_PUBLIC_SUPABASE_URL` |
| Invalid API key | Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Vercel env vars | Redeploy after updating |

---

## Quick Verification Script

Run all these in Supabase SQL Editor:

```sql
-- 1. Check table exists
SELECT COUNT(*) as survey_count FROM surveys;

-- 2. Check RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'surveys';

-- 3. Check data structure
SELECT
  id,
  title,
  persona_config ? 'name' as has_persona_name,
  jsonb_typeof(questions) as questions_type
FROM surveys
LIMIT 1;
```

---

## Still Not Working?

**Share these with me**:
1. Output from `SELECT COUNT(*) FROM surveys;`
2. Output from RLS check query
3. Screenshot of browser console errors
4. Output from Network tab `/api/surveys` response

I'll help debug further based on these details.

-- One-time SQL queries to merge duplicate player records
-- Run these in your PostgreSQL database client or pgAdmin
-- 
-- EXECUTED: July 3, 2025 - Successfully completed
-- RESULT: Merged all records from duplicate player into primary player, deleted duplicate

-- Step 1: Check what records exist (run this first to see what you're working with)
SELECT 
  p.id, 
  p.name, 
  p.gender,
  COUNT(sr.id) as season_count
FROM "Player" p
LEFT JOIN "SeasonRanking" sr ON p.id = sr."playerId"
WHERE p.name IN ('OLD_PLAYER_NAME', 'NEW_PLAYER_NAME')
GROUP BY p.id, p.name, p.gender;

-- Step 2: See what seasons each player is in
SELECT 
  p.name,
  s.name as season_name,
  sr.rank
FROM "Player" p
JOIN "SeasonRanking" sr ON p.id = sr."playerId"
JOIN "Season" s ON sr."seasonId" = s.id
WHERE p.name IN ('OLD_PLAYER_NAME', 'NEW_PLAYER_NAME')
ORDER BY p.name, s.name;

-- Step 3: Get the player IDs for the update
-- (Note down these IDs before running the updates)
SELECT id, name FROM "Player" WHERE name IN ('OLD_PLAYER_NAME', 'NEW_PLAYER_NAME');

-- Step 4: Update all SeasonRanking records from old player to new player
-- Replace NEW_PLAYER_ID and OLD_PLAYER_ID with the actual IDs from step 3
/*
UPDATE "SeasonRanking" 
SET "playerId" = NEW_PLAYER_ID 
WHERE "playerId" = OLD_PLAYER_ID;
*/

-- Step 5: Delete the old player record
-- Replace OLD_PLAYER_ID with the actual ID
/*
DELETE FROM "Player" WHERE id = OLD_PLAYER_ID;
*/

-- Example with actual values (uncomment and replace with real IDs):
-- UPDATE "SeasonRanking" SET "playerId" = 123 WHERE "playerId" = 456;
-- DELETE FROM "Player" WHERE id = 456;

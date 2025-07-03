import { PrismaClient } from '../../../app/generated/prisma';

// One-time migration script to merge duplicate player records
// EXECUTED: July 3, 2025 - Successfully completed
// RESULT: Merged all records from duplicate player into primary player, deleted duplicate

const prisma = new PrismaClient();

async function mergeDuplicatePlayerRecords() {
  try {
    console.log('Starting player merge process...');

    // Configuration - update these names as needed
    const OLD_PLAYER_NAME = 'OLD_PLAYER_NAME'; // Player to be merged away
    const NEW_PLAYER_NAME = 'NEW_PLAYER_NAME'; // Player to keep

    // Find both players
    const oldPlayer = await prisma.player.findUnique({
      where: { name: OLD_PLAYER_NAME },
      include: { seasons: true }
    });

    const newPlayer = await prisma.player.findUnique({
      where: { name: NEW_PLAYER_NAME },
      include: { seasons: true }
    });

    if (!oldPlayer) {
      console.log(`${OLD_PLAYER_NAME} not found. Nothing to merge.`);
      return;
    }

    if (!newPlayer) {
      console.log(`${NEW_PLAYER_NAME} not found. Cannot merge.`);
      return;
    }

    console.log(`Found ${OLD_PLAYER_NAME} (ID: ${oldPlayer.id}) with ${oldPlayer.seasons.length} season records`);
    console.log(`Found ${NEW_PLAYER_NAME} (ID: ${newPlayer.id}) with ${newPlayer.seasons.length} season records`);

    // Get seasons where both players have records (potential conflicts)
    const oldPlayerSeasonIds = oldPlayer.seasons.map(s => s.seasonId);
    const newPlayerSeasonIds = newPlayer.seasons.map(s => s.seasonId);
    const conflictingSeasons = oldPlayerSeasonIds.filter(id => newPlayerSeasonIds.includes(id));

    if (conflictingSeasons.length > 0) {
      console.log(`Warning: Both players have records in seasons: ${conflictingSeasons.join(', ')}`);
      console.log('You may need to manually resolve these conflicts.');
      return;
    }

    // Transfer all SeasonRanking records from old player to new player
    const updateResult = await prisma.seasonRanking.updateMany({
      where: { playerId: oldPlayer.id },
      data: { playerId: newPlayer.id }
    });

    console.log(`Updated ${updateResult.count} season ranking records`);

    // Delete the old player record
    await prisma.player.delete({
      where: { id: oldPlayer.id }
    });

    console.log(`Successfully deleted ${OLD_PLAYER_NAME} player record`);
    console.log('Merge completed successfully!');

  } catch (error) {
    console.error('Error during merge:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
mergeDuplicatePlayerRecords();

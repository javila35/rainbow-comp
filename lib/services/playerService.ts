export class PlayerService {
  static async bulkUpdateGender(playerIds: number[], gender: string | null) {
    const response = await fetch("/api/players/bulk-update-gender", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerIds, gender }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to update player genders");
    }
    
    return response.json();
  }

  static async deletePlayer(playerId: number) {
    const response = await fetch(`/api/players`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete player");
    }

    return response.json();
  }

  static calculatePlayerStats(players: Array<{ gender?: string | null; [key: string]: unknown }>) {
    const totalPlayers = players.length;
    const playersWithGender = players.filter(p => p.gender).length;
    const genderDistribution = players.reduce((acc, player) => {
      if (player.gender) {
        acc[player.gender] = (acc[player.gender] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPlayers,
      playersWithGender,
      genderDistribution,
    };
  }
}
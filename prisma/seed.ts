import { PrismaClient, Prisma } from "../app/generated/prisma";

const prisma = new PrismaClient();

const seasonData: Prisma.SeasonCreateInput = {
  name: "Summer 2023",
};

const playerData: Prisma.PlayerCreateInput[] = [
  { name: "Player 1" },
  { name: "Player 2" },
  { name: "Player 3" },
  { name: "Player 4" },
  { name: "Player 5" },
  { name: "Player 6" },
  { name: "Player 7" },
  { name: "Player 8" },
  { name: "Player 9" },
  { name: "Player 10" },
  { name: "Player 11" },
  { name: "Player 12" },
  { name: "Player 13" },
  { name: "Player 14" },
  { name: "Player 15" },
  { name: "Player 16" },
  { name: "Player 17" },
  { name: "Player 18" },
  { name: "Player 19" },
  { name: "Player 20" },
  { name: "Player 21" },
  { name: "Player 22" },
  { name: "Player 23" },
  { name: "Player 24" },
  { name: "Player 25" },
  { name: "Player 26" },
  { name: "Player 27" },
  { name: "Player 28" },
  { name: "Player 29" },
  { name: "Player 30" },
  { name: "Player 31" },
  { name: "Player 32" },
  { name: "Player 33" },
  { name: "Player 34" },
  { name: "Player 35" },
  { name: "Player 36" },
  { name: "Player 37" },
  { name: "Player 38" },
  { name: "Player 39" },
  { name: "Player 40" },
  { name: "Player 41" },
  { name: "Player 42" },
];

export async function main() {
  await prisma.season.create({ data: seasonData });

  for (const player of playerData) {
    await prisma.player.create({ data: player });
  }
}

main();

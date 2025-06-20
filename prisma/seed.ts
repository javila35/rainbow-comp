import { PrismaClient, Prisma } from "../app/generated/prisma";

const prisma = new PrismaClient();

const seasonData: Prisma.SeasonCreateInput = {
  name: "Summer 2023",
};

const playerData: Prisma.PlayerCreateInput[] = [
  { name: "Cal Little" },
  { name: "Carrol Fifer" },
  { name: "Jake Leon-Guerrero" },
  { name: "Michael Nacinopa" },
  { name: "Thom Muccillo" },
  { name: "Oliver Lieu" },
  { name: "Missy Takahashi" },
  { name: "Collin Cejka" },
  { name: "David Swanson" },
  { name: "Corey Little" },
  { name: "Steven Rojo" },
  { name: "Bryan Anderson" },
  { name: "Daniel Bess" },
  { name: "Isai Valdez" },
  { name: "Paul Schierman" },
  { name: "Stephen Wald" },
  { name: "Lateah Holmes" },
  { name: "Andee Albert" },
  { name: "Dylan Owen" },
  { name: "Matthew Barnett" },
  { name: "Eli Reyes" },
  { name: "Casey Bisted" },
  { name: "Alex Berg" },
  { name: "Linsey Keitges" },
  { name: "Chad Hinke" },
  { name: "Ethan Phommasy" },
  { name: "Joe Avila" },
  { name: "Liam Wilkins" },
  { name: "Dylan Lee" },
  { name: "Christopher Kaczmarek" },
  { name: "Autumn Jimenez" },
  { name: "Bella Bowman" },
  { name: "Davey Tuncap" },
  { name: "Douglas Ishii" },
  { name: "Kyla Cain" },
  { name: "Neill Smith" },
  { name: "Justin Pothoof" },
  { name: "Jay Martini" },
  { name: "Tim Maass" },
  { name: "Jose Aguimatang" },
  { name: "Sara Brannman" },
  { name: "Jonathan Hinson" }
];

export async function main() {
    await prisma.season.create({ data: seasonData });

    for (const player of playerData) {
        await prisma.player.create({ data: player });
    }
};

main();
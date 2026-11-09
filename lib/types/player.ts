import type { Gender } from "@/app/generated/prisma";

export interface Player {
  id: number;
  name: string;
  gender: Gender | null;
  seasons?: SeasonRanking[];
}

export interface SeasonRanking {
  rank: number | null;
}

export interface PlayerWithStats extends Player {
  seasonCount: number;
  averageRank: number | null;
  bestRank: number | null;
}
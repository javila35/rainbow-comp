import type { Gender } from "@/app/generated/prisma";

export interface Player {
  id: number;
  name: string;
  gender: Gender | null;
  seasons?: SeasonRanking[];
}

export interface SeasonRanking {
  id: number;
  rank: number | null;
  season: {
    id: number;
    name: string;
  };
}

export interface PlayerWithStats extends Player {
  seasonCount: number;
  averageRank: number | null;
  bestRank: number | null;
}
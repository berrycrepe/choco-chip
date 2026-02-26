export type ProblemStatus = "solved" | "attempted" | "unsolved";

export interface Problem {
  id: number;
  title: string;
  tier: number;
  solvedCount: number;
  avgTries: number;
  status: ProblemStatus;
  tags: string[];
}

export type BannerType = "free-grid" | "free-nebula" | "free-midnight" | "custom-upload";

export interface Account {
  email: string;
  nickname: string;
  password: string;
  bio: string;
  solvedProblemIds: number[];
  avatarDataUrl: string;
  bannerType: BannerType;
  customBannerDataUrl?: string;
  dbUserId?: string;
  handle?: string;
  division?: string;
  rating?: number;
  solvedCount?: number;
  wins?: number;
  losses?: number;
  draws?: number;
}

export interface ClassProblem {
  id: number;
  title: string;
  tier: number;
  classLevel: number;
  essential: boolean;
}

export interface ClassGroup {
  level: number;
  title: string;
  problems: ClassProblem[];
  baseRequired: number;
}

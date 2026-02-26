export interface MarathonSlot {
  label: string;
  problemId: number;
  bonus: number;
  tier: number;
}

export interface NewsItem {
  title: string;
  date: string;
}

export const marathonSlots: MarathonSlot[] = [
  { label: "A", problemId: 2752, bonus: 20, tier: 4 },
  { label: "B", problemId: 24860, bonus: 20, tier: 4 },
  { label: "C", problemId: 20053, bonus: 30, tier: 3 },
  { label: "D", problemId: 11800, bonus: 30, tier: 3 },
  { label: "E", problemId: 5163, bonus: 50, tier: 3 },
  { label: "F", problemId: 15122, bonus: 50, tier: 2 },
  { label: "G", problemId: 32626, bonus: 50, tier: 2 },
  { label: "H", problemId: 24090, bonus: 50, tier: 5 },
];

export const loggedInNews: NewsItem[] = [
  
];

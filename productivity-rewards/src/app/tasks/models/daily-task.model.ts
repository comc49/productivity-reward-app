export interface DailyTask {
  id: string;
  title: string;
  coinReward: number;
  lastCompletedDate?: string | null;
}

export interface CreateDailyTaskInput {
  title: string;
  coinReward: number;
}

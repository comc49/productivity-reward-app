export interface Task {
  id: string;
  title: string;
  description?: string;
  coinReward: number;
  isCompleted: boolean;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  coinReward: number;
}

import { gql } from 'apollo-angular';
import { TypedDocumentNode } from '@apollo/client/core';
import { CreateDailyTaskInput, DailyTask } from '../models/daily-task.model';

export interface GetDailyTasksResult {
  dailyTasks: DailyTask[];
}

export const GET_DAILY_TASKS: TypedDocumentNode<GetDailyTasksResult, Record<string, never>> = gql`
  query GetDailyTasks {
    dailyTasks {
      id
      title
      coinReward
      lastCompletedDate
    }
  }
`;

export interface CompleteDailyTaskResult {
  completeDailyTask: Pick<DailyTask, 'id' | 'lastCompletedDate' | 'coinReward'>;
}

export const COMPLETE_DAILY_TASK: TypedDocumentNode<CompleteDailyTaskResult, { id: string }> = gql`
  mutation CompleteDailyTask($id: ID!) {
    completeDailyTask(id: $id) {
      id
      lastCompletedDate
      coinReward
    }
  }
`;

export interface DeleteDailyTaskResult {
  deleteDailyTask: Pick<DailyTask, 'id'>;
}

export const DELETE_DAILY_TASK: TypedDocumentNode<DeleteDailyTaskResult, { id: string }> = gql`
  mutation DeleteDailyTask($id: ID!) {
    deleteDailyTask(id: $id) {
      id
    }
  }
`;

export interface CreateDailyTaskResult {
  createDailyTask: DailyTask;
}

export const CREATE_DAILY_TASK: TypedDocumentNode<CreateDailyTaskResult, { input: CreateDailyTaskInput }> = gql`
  mutation CreateDailyTask($input: CreateDailyTaskInput!) {
    createDailyTask(input: $input) {
      id
      title
      coinReward
      lastCompletedDate
    }
  }
`;

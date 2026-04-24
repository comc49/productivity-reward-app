import { gql } from 'apollo-angular';
import { TypedDocumentNode } from '@apollo/client/core';
import { Task, CreateTaskInput } from '../models/task.model';

export interface GetTasksResult {
  tasks: Task[];
  coinBalance: number;
}

export const GET_TASKS: TypedDocumentNode<GetTasksResult, Record<string, never>> = gql`
  query GetTasksAndBalance {
    tasks {
      id
      title
      description
      coinReward
      isCompleted
    }
    coinBalance
  }
`;

export interface CompleteTaskResult {
  completeTask: Pick<Task, 'id' | 'isCompleted' | 'coinReward'>;
}

export const COMPLETE_TASK: TypedDocumentNode<CompleteTaskResult, { id: string }> = gql`
  mutation CompleteTask($id: ID!) {
    completeTask(id: $id) {
      id
      isCompleted
      coinReward
    }
  }
`;

export interface DeleteTaskResult {
  deleteTask: Pick<Task, 'id'>;
}

export const DELETE_TASK: TypedDocumentNode<DeleteTaskResult, { id: string }> = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id) {
      id
    }
  }
`;

export interface CreateTaskResult {
  createTask: Task;
}

export const CREATE_TASK: TypedDocumentNode<
  CreateTaskResult,
  { input: CreateTaskInput }
> = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      description
      coinReward
      isCompleted
    }
  }
`;

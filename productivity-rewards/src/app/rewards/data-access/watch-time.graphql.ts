import { gql } from 'apollo-angular';
import { TypedDocumentNode } from '@apollo/client/core';

export const GET_WATCH_BALANCE: TypedDocumentNode<{ watchBalance: number }, Record<string, never>> = gql`
  query GetWatchBalance {
    watchBalance
  }
`;

export interface PurchaseWatchTimeResult {
  purchaseWatchTime: { watchBalance: number; coinBalance: number };
}

export const PURCHASE_WATCH_TIME: TypedDocumentNode<
  PurchaseWatchTimeResult,
  { minutes: number }
> = gql`
  mutation PurchaseWatchTime($minutes: Int!) {
    purchaseWatchTime(minutes: $minutes) {
      watchBalance
      coinBalance
    }
  }
`;

export const CONSUME_WATCH_TIME: TypedDocumentNode<
  { consumeWatchTime: number },
  { seconds: number }
> = gql`
  mutation ConsumeWatchTime($seconds: Int!) {
    consumeWatchTime(seconds: $seconds)
  }
`;

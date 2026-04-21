import { gql } from 'apollo-angular';
import { TypedDocumentNode } from '@apollo/client/core';

export const GET_NEWS_BALANCE: TypedDocumentNode<{ newsBalance: number }, Record<string, never>> = gql`
  query GetNewsBalance {
    newsBalance
  }
`;

export interface PurchaseNewsTimeResult {
  purchaseNewsTime: { newsBalance: number; coinBalance: number };
}

export const PURCHASE_NEWS_TIME: TypedDocumentNode<
  PurchaseNewsTimeResult,
  { minutes: number }
> = gql`
  mutation PurchaseNewsTime($minutes: Int!) {
    purchaseNewsTime(minutes: $minutes) {
      newsBalance
      coinBalance
    }
  }
`;

export const CONSUME_NEWS_TIME: TypedDocumentNode<
  { consumeNewsTime: number },
  { seconds: number }
> = gql`
  mutation ConsumeNewsTime($seconds: Int!) {
    consumeNewsTime(seconds: $seconds)
  }
`;

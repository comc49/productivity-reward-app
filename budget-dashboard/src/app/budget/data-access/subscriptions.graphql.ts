import { gql } from 'apollo-angular';
import { TypedDocumentNode } from '@apollo/client/core';

export interface SubscriptionItem {
  id: string;
  name: string;
  company: string;
  category: SubscriptionCategory;
  costPerMonth: number | null;
  costPerYear: number | null;
  renewsAt: string;
  usageRating: UsageRating;
}

export type SubscriptionCategory =
  | 'ENTERTAINMENT'
  | 'PRODUCTIVITY'
  | 'HEALTH'
  | 'FINANCE'
  | 'EDUCATION'
  | 'OTHER';

export type UsageRating = 'ACTIVE' | 'RARELY' | 'NEVER';

const SUBSCRIPTION_FIELDS = gql`
  fragment SubscriptionFields on Subscription {
    id
    name
    company
    category
    costPerMonth
    costPerYear
    renewsAt
    usageRating
  }
`;

export const GET_SUBSCRIPTIONS: TypedDocumentNode<
  { subscriptions: SubscriptionItem[] },
  Record<string, never>
> = gql`
  ${SUBSCRIPTION_FIELDS}
  query GetSubscriptions {
    subscriptions {
      ...SubscriptionFields
    }
  }
`;

export const CREATE_SUBSCRIPTION: TypedDocumentNode<
  { createSubscription: SubscriptionItem },
  {
    input: {
      name: string;
      company: string;
      category: SubscriptionCategory;
      costPerMonth?: number;
      costPerYear?: number;
      renewsAt: string;
    };
  }
> = gql`
  ${SUBSCRIPTION_FIELDS}
  mutation CreateSubscription($input: CreateSubscriptionInput!) {
    createSubscription(input: $input) {
      ...SubscriptionFields
    }
  }
`;

export const UPDATE_SUBSCRIPTION: TypedDocumentNode<
  { updateSubscription: SubscriptionItem },
  {
    input: {
      id: string;
      name?: string;
      company?: string;
      category?: SubscriptionCategory;
      costPerMonth?: number;
      costPerYear?: number;
      renewsAt?: string;
      usageRating?: UsageRating;
    };
  }
> = gql`
  ${SUBSCRIPTION_FIELDS}
  mutation UpdateSubscription($input: UpdateSubscriptionInput!) {
    updateSubscription(input: $input) {
      ...SubscriptionFields
    }
  }
`;

export const DELETE_SUBSCRIPTION: TypedDocumentNode<
  { deleteSubscription: { id: string } },
  { id: string }
> = gql`
  mutation DeleteSubscription($id: ID!) {
    deleteSubscription(id: $id) {
      id
    }
  }
`;

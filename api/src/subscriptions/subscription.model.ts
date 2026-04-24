import { Field, Float, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import type { SubscriptionCategory, UsageRating } from '@prisma/client';

export const SubscriptionCategoryEnum = {
  ENTERTAINMENT: 'ENTERTAINMENT',
  PRODUCTIVITY: 'PRODUCTIVITY',
  HEALTH: 'HEALTH',
  FINANCE: 'FINANCE',
  EDUCATION: 'EDUCATION',
  OTHER: 'OTHER',
} as const;

export const UsageRatingEnum = {
  ACTIVE: 'ACTIVE',
  RARELY: 'RARELY',
  NEVER: 'NEVER',
} as const;

registerEnumType(SubscriptionCategoryEnum, { name: 'SubscriptionCategory' });
registerEnumType(UsageRatingEnum, { name: 'UsageRating' });

@ObjectType('Subscription')
export class SubscriptionItem {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  company: string;

  @Field(() => SubscriptionCategoryEnum)
  category: SubscriptionCategory;

  @Field(() => Float, { nullable: true })
  costPerMonth?: number;

  @Field(() => Float, { nullable: true })
  costPerYear?: number;

  @Field()
  renewsAt: Date;

  @Field(() => UsageRatingEnum)
  usageRating: UsageRating;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

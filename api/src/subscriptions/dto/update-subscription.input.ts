import { Field, Float, ID, InputType } from '@nestjs/graphql';
import type { SubscriptionCategory, UsageRating } from '@prisma/client';
import { SubscriptionCategoryEnum, UsageRatingEnum } from '../subscription.model';

@InputType()
export class UpdateSubscriptionInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  company?: string;

  @Field(() => SubscriptionCategoryEnum, { nullable: true })
  category?: SubscriptionCategory;

  @Field(() => Float, { nullable: true })
  costPerMonth?: number;

  @Field(() => Float, { nullable: true })
  costPerYear?: number;

  @Field({ nullable: true })
  renewsAt?: Date;

  @Field(() => UsageRatingEnum, { nullable: true })
  usageRating?: UsageRating;
}

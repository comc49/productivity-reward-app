import { Field, Float, ID, InputType } from '@nestjs/graphql';
import { SubscriptionCategory, UsageRating } from '@prisma/client';

@InputType()
export class UpdateSubscriptionInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  company?: string;

  @Field(() => SubscriptionCategory, { nullable: true })
  category?: SubscriptionCategory;

  @Field(() => Float, { nullable: true })
  costPerMonth?: number;

  @Field(() => Float, { nullable: true })
  costPerYear?: number;

  @Field({ nullable: true })
  renewsAt?: Date;

  @Field(() => UsageRating, { nullable: true })
  usageRating?: UsageRating;
}

import { Field, Float, InputType } from '@nestjs/graphql';
import type { SubscriptionCategory } from '@prisma/client';
import { SubscriptionCategoryEnum } from '../subscription.model';

@InputType()
export class CreateSubscriptionInput {
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
}

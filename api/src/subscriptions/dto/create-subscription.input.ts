import { Field, Float, InputType } from '@nestjs/graphql';
import { SubscriptionCategory } from '@prisma/client';

@InputType()
export class CreateSubscriptionInput {
  @Field()
  name: string;

  @Field()
  company: string;

  @Field(() => SubscriptionCategory)
  category: SubscriptionCategory;

  @Field(() => Float, { nullable: true })
  costPerMonth?: number;

  @Field(() => Float, { nullable: true })
  costPerYear?: number;

  @Field()
  renewsAt: Date;
}

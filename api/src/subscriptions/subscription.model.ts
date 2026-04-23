import { Field, Float, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { SubscriptionCategory, UsageRating } from '@prisma/client';

registerEnumType(SubscriptionCategory, { name: 'SubscriptionCategory' });
registerEnumType(UsageRating, { name: 'UsageRating' });

@ObjectType()
export class Subscription {
  @Field(() => ID)
  id: string;

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

  @Field(() => UsageRating)
  usageRating: UsageRating;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

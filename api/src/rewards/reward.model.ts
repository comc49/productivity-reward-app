import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Reward {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int)
  coinCost!: number;

  @Field()
  isRedeemed!: boolean;
}

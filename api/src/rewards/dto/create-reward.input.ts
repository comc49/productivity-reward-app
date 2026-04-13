import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateRewardInput {
  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int)
  coinCost: number;
}

import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateDailyTaskInput {
  @Field()
  title!: string;

  @Field(() => Int)
  coinReward!: number;
}

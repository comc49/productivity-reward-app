import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DailyTask {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field(() => Int)
  coinReward: number;

  @Field({ nullable: true })
  lastCompletedDate?: string;
}

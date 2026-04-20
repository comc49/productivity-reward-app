import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class WatchTimePurchase {
  @Field(() => Int, { description: 'Updated watch balance in seconds' })
  watchBalance: number;

  @Field(() => Int, { description: 'Updated coin balance after deduction' })
  coinBalance: number;
}

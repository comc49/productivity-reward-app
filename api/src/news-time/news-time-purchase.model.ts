import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class NewsTimePurchase {
  @Field(() => Int, { description: 'Updated news balance in seconds' })
  newsBalance!: number;

  @Field(() => Int, { description: 'Updated coin balance after deduction' })
  coinBalance!: number;
}

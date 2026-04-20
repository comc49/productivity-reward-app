import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { Request } from 'express';
import { PrismaModule } from '../prisma/prisma.module';
import { TasksModule } from '../tasks/tasks.module';
import { RewardsModule } from '../rewards/rewards.module';
import { FirebaseModule } from '../firebase/firebase.module';
import { WatchTimeModule } from '../watch-time/watch-time.module';

@Module({
  imports: [
    PrismaModule,
    FirebaseModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'schema.gql'),
      sortSchema: true,
      context: ({ req }: { req: Request }) => ({ req }),
    }),
    TasksModule,
    RewardsModule,
    WatchTimeModule,
  ],
})
export class AppModule {}

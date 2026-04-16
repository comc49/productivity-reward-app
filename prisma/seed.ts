import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL'] });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.task.createMany({
    data: [
      {
        title: 'Read for 30 minutes',
        description: 'Read a book or article to expand your knowledge.',
        coinReward: 20,
      },
      {
        title: 'Exercise',
        description: 'Do at least 30 minutes of physical activity.',
        coinReward: 50,
      },
      {
        title: 'Deep work session',
        description: 'Complete a 90-minute focused work block with no distractions.',
        coinReward: 100,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.reward.createMany({
    data: [
      {
        title: '30-minute gaming session',
        description: 'Guilt-free time to play your favourite game.',
        coinCost: 50,
      },
      {
        title: 'Order a treat',
        description: 'Treat yourself to a snack or meal you enjoy.',
        coinCost: 100,
      },
      {
        title: 'Movie night',
        description: 'Sit back and watch a film of your choice.',
        coinCost: 150,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.wallet.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton', balance: 0 },
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

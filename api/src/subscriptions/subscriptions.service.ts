import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionInput } from './dto/create-subscription.input';
import { UpdateSubscriptionInput } from './dto/update-subscription.input';
import { Subscription } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string): Promise<Subscription[]> {
    return this.prisma.subscription.findMany({
      where: { userId },
      orderBy: { renewsAt: 'asc' },
    });
  }

  async create(input: CreateSubscriptionInput, userId: string): Promise<Subscription> {
    return this.prisma.subscription.create({
      data: { ...input, userId },
    });
  }

  async update(input: UpdateSubscriptionInput, userId: string): Promise<Subscription> {
    const { id, ...data } = input;
    const existing = await this.prisma.subscription.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException(`Subscription ${id} not found`);
    return this.prisma.subscription.update({ where: { id }, data });
  }

  async delete(id: string, userId: string): Promise<Subscription> {
    const existing = await this.prisma.subscription.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException(`Subscription ${id} not found`);
    return this.prisma.subscription.delete({ where: { id } });
  }
}

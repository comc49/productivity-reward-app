import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from './auth.guard';
import { FirebaseService } from '../firebase/firebase.service';
import { PrismaService } from '../prisma/prisma.service';

const mockDbUser = {
  id: 'db-user-1',
  firebaseUid: 'firebase-uid-1',
  email: 'test@example.com',
  displayName: 'Test User',
};

const makeContext = (authHeader?: string) => {
  const req = { headers: { authorization: authHeader }, user: undefined as unknown };
  const gqlCtx = { getContext: () => ({ req }) };
  vi.spyOn(GqlExecutionContext, 'create').mockReturnValue(gqlCtx as never);
  return { executionContext: {} as ExecutionContext, req };
};

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let firebaseService: { getAuth: ReturnType<typeof vi.fn> };
  let prisma: { user: { upsert: ReturnType<typeof vi.fn> } };

  beforeEach(async () => {
    firebaseService = {
      getAuth: vi.fn().mockReturnValue({
        verifyIdToken: vi.fn().mockResolvedValue({
          uid: 'firebase-uid-1',
          email: 'test@example.com',
          name: 'Test User',
        }),
      }),
    };

    prisma = {
      user: {
        upsert: vi.fn().mockResolvedValue(mockDbUser),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: FirebaseService, useValue: firebaseService },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    guard = module.get(AuthGuard);
  });

  it('returns true and attaches user to request for a valid token', async () => {
    const { executionContext, req } = makeContext('Bearer valid-token');
    const result = await guard.canActivate(executionContext);
    expect(result).toBe(true);
    expect(req.user).toEqual(mockDbUser);
  });

  it('upserts user in the database on first sign-in', async () => {
    const { executionContext } = makeContext('Bearer valid-token');
    await guard.canActivate(executionContext);
    expect(prisma.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { firebaseUid: 'firebase-uid-1' },
      }),
    );
  });

  it('throws UnauthorizedException when Authorization header is missing', async () => {
    const { executionContext } = makeContext(undefined);
    await expect(guard.canActivate(executionContext)).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when header does not start with Bearer', async () => {
    const { executionContext } = makeContext('Basic some-token');
    await expect(guard.canActivate(executionContext)).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when Firebase rejects the token', async () => {
    firebaseService.getAuth.mockReturnValue({
      verifyIdToken: vi.fn().mockRejectedValue(new Error('Token expired')),
    });
    const { executionContext } = makeContext('Bearer expired-token');
    await expect(guard.canActivate(executionContext)).rejects.toThrow(UnauthorizedException);
  });
});

-- CreateEnum
CREATE TYPE "SubscriptionCategory" AS ENUM ('ENTERTAINMENT', 'PRODUCTIVITY', 'HEALTH', 'FINANCE', 'EDUCATION', 'OTHER');

-- CreateEnum
CREATE TYPE "UsageRating" AS ENUM ('ACTIVE', 'RARELY', 'NEVER');

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "category" "SubscriptionCategory" NOT NULL DEFAULT 'OTHER',
    "costPerMonth" DOUBLE PRECISION,
    "costPerYear" DOUBLE PRECISION,
    "renewsAt" TIMESTAMP(3) NOT NULL,
    "usageRating" "UsageRating" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

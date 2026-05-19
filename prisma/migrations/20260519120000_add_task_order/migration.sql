-- AlterTable
ALTER TABLE "Task" ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;

-- Backfill existing rows so per-user order matches current createdAt order
WITH ordered AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "createdAt" ASC) AS rn
  FROM "Task"
)
UPDATE "Task" t
SET "order" = ordered.rn
FROM ordered
WHERE t."id" = ordered."id";

-- CreateIndex
CREATE INDEX "Task_userId_order_idx" ON "Task"("userId", "order");

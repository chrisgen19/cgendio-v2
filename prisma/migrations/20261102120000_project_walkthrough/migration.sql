-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "contribution" TEXT,
ADD COLUMN     "decision" TEXT,
ADD COLUMN     "outcome" TEXT,
ADD COLUMN     "tour_stops" JSONB NOT NULL DEFAULT '[]';

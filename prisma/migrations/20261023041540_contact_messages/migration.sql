-- CreateEnum
CREATE TYPE "contact_project_type" AS ENUM ('WORDPRESS', 'NEXTJS', 'MIGRATION', 'JOB');

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "project_type" "contact_project_type" NOT NULL,
    "message" TEXT NOT NULL,
    "ip_hash" TEXT NOT NULL,
    "read_at" TIMESTAMP(3),
    "emailed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contact_messages_ip_hash_created_at_idx" ON "contact_messages"("ip_hash", "created_at");

-- CreateIndex
CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages"("created_at");

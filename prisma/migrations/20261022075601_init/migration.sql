-- CreateEnum
CREATE TYPE "content_status" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "project_group" AS ENUM ('CLIENT', 'PERSONAL');

-- CreateEnum
CREATE TYPE "project_theme" AS ENUM ('INK', 'LIME', 'TINT', 'GRAY');

-- CreateEnum
CREATE TYPE "timeline_dot" AS ENUM ('LIME', 'ACCENT', 'INK', 'PLACEHOLDER');

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "kind_label" TEXT NOT NULL,
    "group" "project_group" NOT NULL,
    "glyph" TEXT NOT NULL,
    "theme" "project_theme" NOT NULL,
    "span" INTEGER NOT NULL,
    "tags" TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "status" "content_status" NOT NULL DEFAULT 'DRAFT',
    "cover_image_url" TEXT,
    "case_study" TEXT,
    "live_url" TEXT,
    "repo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "read_minutes" INTEGER NOT NULL,
    "status" "content_status" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "cover_image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milestones" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_entries" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "when" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "org" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dot" "timeline_dot" NOT NULL,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timeline_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stack_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stack_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL DEFAULT 'site',
    "contact_email" TEXT NOT NULL,
    "open_to_projects" BOOLEAN NOT NULL DEFAULT true,
    "cv_url" TEXT,
    "socials" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");

-- CreateIndex
CREATE INDEX "projects_status_featured_order_idx" ON "projects"("status", "featured", "order");

-- CreateIndex
CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");

-- CreateIndex
CREATE INDEX "posts_status_published_at_idx" ON "posts"("status", "published_at");

-- CreateIndex
CREATE UNIQUE INDEX "milestones_key_key" ON "milestones"("key");

-- CreateIndex
CREATE UNIQUE INDEX "timeline_entries_key_key" ON "timeline_entries"("key");

-- CreateIndex
CREATE UNIQUE INDEX "stack_items_name_key" ON "stack_items"("name");

-- Selected work now shows client projects only. Remove the three personal projects a database seeded before this still
-- holds (their case study pages go with them). A database that never had them is unaffected.
DELETE FROM "projects" WHERE "slug" IN (
  'budget-tracker',
  'ph-job-board-scraper',
  'self-hosted-platform'
);

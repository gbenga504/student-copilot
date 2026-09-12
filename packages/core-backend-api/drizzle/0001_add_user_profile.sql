ALTER TABLE "users" ADD COLUMN "name" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "profile_completed_at" timestamp with time zone;--> statement-breakpoint
UPDATE "users" SET "profile_completed_at" = NOW();
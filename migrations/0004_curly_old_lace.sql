ALTER TABLE "attemtps" DROP CONSTRAINT "attemtps_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attemtps" DROP COLUMN "user_id";
ALTER TABLE "attemtps" DROP CONSTRAINT "attemtps_question_id_questions_id_fk";
--> statement-breakpoint
ALTER TABLE "attemtps" ADD CONSTRAINT "attemtps_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;
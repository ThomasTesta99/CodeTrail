CREATE INDEX "attempts_question_id_idx" ON "attemtps" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "attempts_created_at_idx" ON "attemtps" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "attempts_question_created_at_idx" ON "attemtps" USING btree ("question_id","created_at");--> statement-breakpoint
CREATE INDEX "questions_user_id_idx" ON "questions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "questions_created_at_idx" ON "questions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "questions_difficulty_idx" ON "questions" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX "questions_label_idx" ON "questions" USING btree ("label");--> statement-breakpoint
CREATE INDEX "questions_user_created_at_idx" ON "questions" USING btree ("user_id","created_at");
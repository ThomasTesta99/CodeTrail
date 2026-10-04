import { attempts, question } from "@/database/schema";
import { auth } from "@/lib/auth";
import type { Difficulty } from "@/lib/validations/question";

declare interface FooterProps {
  user?: User;
  type?: 'mobile' | 'desktop'
}

declare interface CreateUserInfo {
  name: string;
  email: string;
  password: string; 
}

declare interface SignInUserInfo{
  email: string;
  password: string;
}

export type AuthSession = typeof auth.$Infer.Session;

export type User = AuthSession["user"];
export type Session = AuthSession["session"];

declare interface UserProps{
  user?: User;
}

export type Action = 'ai-feedback' | 'password-reset' | 'verify-email';

export type DeleteType =  'delete-attempt' | 'delete-question';

export type Activity = {
  date: string, 
  attempts: number, 
}

export type GetUserActivityResult =
  | {
      success: true;
      activity: Activity[];
      message: string;
    }
  | {
      success: false;
      code: ActionErrorCode;
      message: string;
      activity: [];
    };


export type AIFeedbackAttempt = {
  solutionCode: string;
  language: string;
  neededHelp: boolean;
  durationMinutes: number;
  notes: string | null;
};

export type AIFeedbackQuestion = {
  title: string;
  description: string;
};

export type ActionErrorCode =
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "DATABASE_ERROR"
  | "RATE_LIMITED"
  | "SERVICE_UNAVAILABLE"
  | "INTERNAL_ERROR";

 export type RateLimitResult =
  | {
      status: "allowed";
      valid: true;
      message: "";
    }
  | {
      status: "denied";
      valid: false;
      message: string;
    }
  | {
      status: "unavailable";
      valid: false;
      message: string;
    };

export type AIFeedbackResponse = 
| {
    success: true, 
    feedback: string, 
  } | 
  {
    success: false, 
    error: string, 
  }


export type SortKey = "oldest" | "newest" | "difficultyAsc" | "difficultyDesc";

export type QuestionCardQuestion = Pick<
  Question,
  'id' | 'title' | 'description' | 'difficulty' | 'link'
> & {
  attempts?: Question['attempts'];
  attemptCount?: number;
  latestAttemptAt?: Date | null;
};

export type Attempt = AttemptRow;
export type QuestionRow = typeof question.$inferSelect;
export type AttemptRow = typeof attempts.$inferSelect;

export type Question = Omit<QuestionRow, "difficulty"> & {
  difficulty: Difficulty;
  attempts: AttemptRow[];
};
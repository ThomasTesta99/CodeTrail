declare interface FooterProps {
  user?: User;
  type?: 'mobile' | 'desktop'
}

declare interface User {
  id?: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  password?: string | null;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
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

declare interface UserProps{
  user?: User;
}

declare interface Attempt {
  id: string;
  solutionCode: string;
  neededHelp: boolean;
  durationMinutes: number;
  notes: string;
  createdAt: string;
}

declare interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  link?: string;
  attempts: Attempt[];
  createdAt: string;
}
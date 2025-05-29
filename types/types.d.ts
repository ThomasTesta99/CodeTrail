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
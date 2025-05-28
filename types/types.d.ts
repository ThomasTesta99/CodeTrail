declare interface FooterProps {
  user?: User;
  type?: 'mobile' | 'desktop'
}

declare interface User {
  id?: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  password: string | null;  // Assuming password is optional (for social logins)
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

declare interface CreateUserInfo {
  name: string;
  email: string;
  password: string; 
}
declare interface FooterProps {
  user?: User;
  type?: 'mobile' | 'desktop'
}

declare interface User {
  name: string;
  email: string;
}
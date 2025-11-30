import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      credits: number;
      phoneVerified?: boolean;
      phone?: string;
      countryCode?: string;
    };
  }

  interface User {
    id: string;
    credits?: number;
    phoneVerified?: boolean;
    phone?: string;
    countryCode?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    credits?: number;
    phoneVerified?: boolean;
    phone?: string;
    countryCode?: string;
  }
}

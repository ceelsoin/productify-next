import NextAuth, { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import TwitterProvider from 'next-auth/providers/twitter';
import { connectDB } from './mongodb';
import { User } from './models/User';
import { sendLoginAlert } from './notifications';

export const authConfig: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios');
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email }).select(
          '+password'
        );

        if (!user) {
          throw new Error('Usuário não encontrado');
        }

        if (!user.password) {
          throw new Error('Use o login social para acessar esta conta');
        }

        const isPasswordValid = await user.comparePassword(
          credentials.password as string
        );

        if (!isPasswordValid) {
          throw new Error('Senha incorreta');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== 'credentials') {
        await connectDB();

        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            provider: account?.provider,
            emailVerified: new Date(),
          });
        }
      }

      // Enviar notificação de login (async, não bloqueia o login)
      if (user.email && user.name) {
        sendLoginAlert({
          userName: user.name,
          userEmail: user.email,
          ip: 'N/A', // TODO: Capturar IP real do request
          device: 'Navegador',
          location: 'Brasil',
        }).catch((error) => {
          console.error('Erro ao enviar notificação de login:', error);
        });
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      // Get credits from database
      if (token.email) {
        await connectDB();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.credits = dbUser.credits;
          token.id = dbUser._id.toString();
          token.phoneVerified = dbUser.phoneVerified || false;
           token.phone = dbUser.phone;
           token.countryCode = dbUser.countryCode;
        }

       
      }

      return token;
    },
    async session({ session, token }) {
      // console.log(token, session)
      if (token && session.user) {
        session.user.phoneVerified = token.phoneVerified || false;
        session.user.id = token.id as string;
        session.user.credits = token.credits as number;
        session.user.phoneVerified = token.phoneVerified as boolean;
        session.user.phone = token.phone as string;
        session.user.countryCode = token.countryCode as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

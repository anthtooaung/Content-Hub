import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.users.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password_hash) {
          throw new Error('Invalid credentials');
        }

        const isPasswordValid = await compare(credentials.password, user.password_hash);

        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar_url || null,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || !user) return false;

      // For OAuth providers, store/update social connection
      if (account.provider !== 'credentials') {
        const provider = account.provider as 'google' | 'facebook';

        // Find or create the user first
        let dbUser = await prisma.users.findUnique({
          where: { email: user.email! },
        });

        if (!dbUser) {
          // Create new user from OAuth profile
          dbUser = await prisma.users.create({
            data: {
              email: user.email!,
              name: user.name,
              avatar_url: user.image,
              email_verified: true,
              primary_login_provider: provider,
            },
          });
        } else {
          // Update existing user with OAuth profile info
          await prisma.users.update({
            where: { id: dbUser.id },
            data: {
              avatar_url: user.image || dbUser.avatar_url,
              name: user.name || dbUser.name,
            },
          });
        }

        // Update the user.id to match our database
        user.id = dbUser.id;

        // Upsert social connection
        await prisma.social_connections.upsert({
          where: {
            user_id_provider_provider_user_id: {
              user_id: dbUser.id,
              provider: provider,
              provider_user_id: account.providerAccountId,
            },
          },
          update: {
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            token_expires_at: account.expires_at
              ? new Date(account.expires_at * 1000)
              : null,
            provider_username: profile?.name || (profile as any)?.login,
            used_for_login: true,
            is_active: true,
          },
          create: {
            user_id: dbUser.id,
            provider: provider,
            provider_user_id: account.providerAccountId,
            provider_username: profile?.name || (profile as any)?.login,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            token_expires_at: account.expires_at
              ? new Date(account.expires_at * 1000)
              : null,
            used_for_login: true,
            is_active: true,
          },
        });
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      // Store account provider in token for session
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};

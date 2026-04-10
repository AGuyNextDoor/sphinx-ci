import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as ReturnType<typeof PrismaAdapter>,
  session: { strategy: "jwt" },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      issuer: "https://github.com/login/oauth",
      authorization: { params: { scope: "read:user user:email repo" } },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          githubId: profile.id,
          githubLogin: profile.login,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.accessToken = account.access_token;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ghProfile = profile as any;
        token.githubId = ghProfile.id;
        token.githubLogin = ghProfile.login;

        // Force update the OAuth token in DB so it has the latest scopes
        if (account.access_token) {
          await prisma.account.updateMany({
            where: {
              provider: "github",
              providerAccountId: account.providerAccountId,
            },
            data: {
              access_token: account.access_token,
              scope: account.scope,
            },
          }).catch(() => {});
        }

        if (token.sub) {
          await prisma.user.update({
            where: { id: token.sub },
            data: {
              githubId: ghProfile.id,
              githubLogin: ghProfile.login,
            },
          }).catch(() => {});
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.githubLogin = token.githubLogin as string;
      }
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
});

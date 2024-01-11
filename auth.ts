// * Comnfiguration for authentication
import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { db } from "./lib/database.connection";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { getUserById } from "./lib/actions/user.action";
import { UserRole } from "@prisma/client";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  // * This is for solving errors when using linkAccount feature
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

  // * This is for linkAccount feature
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },

  callbacks: {
    // * (70)
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") return true;

      const exisitingUser = await getUserById(user.id);

      //* prevent sign in without email verification
      if (!exisitingUser?.emailVerified) return false;

      // TODO : Add 2FA check

      return true;
    },

    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }

      return session;
    },

    async jwt({ token }) {
      // fecthing the user

      if (!token.sub) return token;
      const exisitingUser = await getUserById(token.sub);
      if (!exisitingUser) return token;
      token.role = exisitingUser.role;

      return token;
    },
  },
  adapter: PrismaAdapter(db), // prisma adapter is supported on non edge
  session: { strategy: "jwt" },
  ...authConfig,
});

// * Comnfiguration for authentication
import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { db } from "./lib/database.connection";
import { PrismaAdapter } from "@auth/prisma-adapter";
export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  adapter: PrismaAdapter(db), // prisma adapter is supported on non edge
  session: { strategy: "jwt" },
  ...authConfig,
});

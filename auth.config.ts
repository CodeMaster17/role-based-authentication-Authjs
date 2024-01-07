// * This file is used to trigger the middleware on the edge
// * That is why we use auth.ts and auth.config.ts as seprate files

import bcrypt from "bcryptjs";
import Credentials from "next-auth/providers/credentials";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";
import { LoginSchema } from "./schema";
import { getUserByEmail } from "./lib/actions/user.action";

export default {
  providers: [
    Github({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials); // again doing validation
        if (validatedFields.success) {
          // if validation is successfull
          const { email, password } = validatedFields.data;

          const user = await getUserByEmail(email); // checking if user is present in database
          if (!user || !user.password) return null; // password will be null when user has registered using google or github

          const passwordsMatch = await bcrypt.compare(password, user.password); // comparing the hashed password

          if (passwordsMatch) {
            return user;
          }
        }
        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;

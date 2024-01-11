"use server"; // necessary in every auth action

import * as z from "zod";
import { LoginSchema } from "@/schema";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/route";
import { AuthError } from "next-auth";
import { getUserByEmail } from "@/lib/actions/user.action";
import { generateVerificationToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/mail";

export const Login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values); // valdiating the input values
  if (!validatedFields.success) {
    return { error: "Invalid fields! " };
  }
  const { email, password } = validatedFields.data;

  // * not allowing the user to login if the email is not verified (69)
  const exisitingUser = await getUserByEmail(email);

  if (!exisitingUser || !exisitingUser.password || !exisitingUser.email) {
    return { error: "Email does not exist" };
  }

  if (!exisitingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      exisitingUser.email
    );

    // * sending mail while logging in if email is not verified (72)
     await sendVerificationEmail(
       verificationToken.email,
       verificationToken.token
     );

    return { success: "Confirmation Email sent!" };
  }
  // * 

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }
    throw error;
  }
};

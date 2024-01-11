"use server";

import { RegisterSchema } from "@/schema";
import * as z from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/database.connection";
import { getUserByEmail } from "@/lib/actions/user.action";
import { generateVerificationToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/mail";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  // * check and store user in database

  const validatedFields = RegisterSchema.safeParse(values); // safeParse returns a ZodResult object, and it is used to validate the input values
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, name } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10); // 10 is the number of salt rounds

  //finding the email in database
  const exisitingUser = await getUserByEmail(email);

  // if user already exists, return error
  if (exisitingUser) {
    return { error: "Email already exists!" };
  }

  // if not, create and save it in database
  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // * generating the token after the user is created (68)
  const verificationToken = await generateVerificationToken(email);
  await sendVerificationEmail(verificationToken.email, verificationToken.token);

  return { success: "Email sent!" };
};

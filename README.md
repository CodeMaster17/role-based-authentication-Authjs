# NextJs V5 Authentication

7. Create Register page UI
8. Install prisma
   `npm i -D prisma`
9. install prisma client
   `npm i @prisma/client`
10. Go to `database.connection.ts` and add following code

```
import { PrismaClient } from "@prisma/client";
declare global {
  var prisma: PrismaClient | undefined;
}
export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db

```

11. Run command
    `npx prisma init`
12. We used `Neon DB` as our database
13. Got to `Neon DB ` to create a new database
14. Paste connection string in `schema.prisma` and `.env` file
15. Start creating schema in `schema.prisma` file
16. With help of `db` in `database.connection.ts` file we can access our models
17. Create `User` model in `schema.prisma` file
18. Should also run following command to access `User` model in `database.connection.ts` file
    `npx prisma generate`
19. To psuh your schema to database
    `npx prisma db push`

20. Move to `Auth JS site`
21. Select database adapter as `Prisma`
22. Install `@auth/prisma-adapter`
23. Comand to install `@auth/prisma-adapter`
    `npm i @auth/prisma-adapter`
24. Copy model `User` and paste in `schema.prisma` file
25. Copy model `Account` and paste in `schema.prisma` file ( We are not using session model from `Auth JS site`)
26. Push again to database
    `npx prisma generate` and `npx prisma db push`
27. Auth does not use `password` field in `User` model. So we need to add it to user model as optional because google aut h providers do not require password in `schema.prisma` file.
28. Add the code below to validate fields in `register.ts`

```
"use server";

import { RegisterSchema } from "@/schema";
import * as z from "zod";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
const validatedFields = RegisterSchema.safeParse(values); // safeParse returns a ZodResult object, and it is used to validate the input values
if (!validatedFields.success) {
 return { error: "Invalid fields!" };
}
return { success: "Email sent!" };
};

```

29. Install `bcrypt` to hash password
    `npm i bcrypt` and `npm i -D @types/bcrypt`
30. Create register function

```
export const register = async (values: z.infer<typeof RegisterSchema>) => {

  // * check and store user in database

  const validatedFields = RegisterSchema.safeParse(values); // safeParse returns a ZodResult object, and it is used to validate the input values
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, name } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10); // 10 is the number of salt rounds

  //finding the email in database
  const exisitingUser = await db.user.findUnique({
    where: {
      email,
    },
  });

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

  // TODO: send verification email

  return { success: "Email sent!" };
};

```

31. Create user actions in `user.action.ts` file, to get user by email and id

```
export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({ where: { email } });
    return user;
  } catch {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await db.user.findUnique({ where: { id } });
    return user;
  } catch {
    return null;
  }
};

```

32. Use it in `register.ts` function

```
 //finding the email in database
  const exisitingUser = await getUserByEmail(email)

```
33. Now, for `login` we have to install nextauth v5
    `npm i next-auth@beta`
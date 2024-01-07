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
34. Create `auth.ts` file in root directory for configuration
35. Add following code to `auth.ts` file
    - paste the code from website
36. Create `app/api/auth/[...nextauth].ts` file and paste the code from the wesbite

- remove the edge because prisma does not support it

37. Add `AUTH_SECRET` in `.env` file

- for the development mode we can use any string

38. Go to see logs `http://localhost:3000/api/auth/providers`

39. Create middleware in `middleware.ts` in root directory

- `middleware.ts` file is nextjs specific file
- update matcher to ` matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],` from clerk

40. Create `auth.config.ts` file in root directory

- paste the code from website

41. Update `auth.ts` file

```
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


```

42. Update `api/auth/[...nextauth].ts` file

```
// * middleware works on the edge

import authConfig from "./auth.config";
import NextAuth from "next-auth";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  // req.auth
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

```

43. Create `route.ts` file in root directory

- this file will contain all types of routes

44. Edit middleware.ts file

    - add routes condition in `middleware.ts` file

45. Do valdiations in `auth.config.ts` file

46. Edit `auth.ts` file

```
export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(db), // prisma adapter is supported on non edge
  session: { strategy: "jwt" },
  ...authConfig,
});

```

47. Implement functionality in `login.ts` file

```
"use server"; // necessary in every auth action

import * as z from "zod";
import { LoginSchema } from "@/schema";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/route";
import { AuthError } from "next-auth";

export const Login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values); // valdiating the input values
  if (!validatedFields.success) {
    return { error: "Invalid fields! " };
  }
  const { email, password } = validatedFields.data;
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

```

48. Go to settings page and add logout button, and its functionality in `settings.tsx` file

```
import { auth, signOut } from '@/auth'
import React from 'react'

const Settings = async () => {
    const user = await auth()
    return (
        <div>
            {JSON.stringify(user)}
            <form action={async () => {
                'use server'
                await signOut()
            }}>
                <button type='submit'>
                    Singout
                </button>
            </form>
        </div>
    )
}

export default Settings

```

#### Login/Logout completed succesfully

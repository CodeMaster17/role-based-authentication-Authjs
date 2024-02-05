# NextJs V5 Authentication

![image](https://github.com/CodeMaster17/role-based-authentication-Authjs/assets/96763776/7d84ec51-ca1b-4a20-839b-1262523fc51b)

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

## middlewares and login

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

## Callbacks

49. add callbacks in `auth.ts` - to check for tokens
    `export const {
handlers: { GET, POST },
auth,
signIn,
signOut,
} = NextAuth({
callbacks: {
async jwt({ token }) {
console.log({ token });
return token;
},
},
adapter: PrismaAdapter(db), // prisma adapter is supported on non edge
session: { strategy: "jwt" },
...authConfig,
});`

50. update callback in `auth.ts` file

```
 async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      return session;
    },
```

51. Update schema in `schema.prisma` file

```
role UserRole @default(USER)
```

52. Close the server
    - run command `npx prisma generate` and then `npx prisma migrate reset` and then `npx prisma db push`
    - you can check the db status, users would be 0

### Role based authentication is developed with help of middleware and token in callback

### Query is much faste in case of finding by id rather than by an email

53. Update the callback in `auth.ts` file

```
async session({ token, session }) {
      console.log({
        sessionToken: token,
      });

      if (token.sub && session.user) {
        session.user.id = token.sub;
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

```

#### you must be start seeing the role in the token

54. Update session function

```
async session({ token, session }) {

      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if(token.role && session.user){
        session.user.role = token.role  // you will be seeing here a typescript error
      }

      return session;
    },
```

55. Update in `auth.ts` file

```
if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }
```

- and create a `next-auth.d.ts` file in root directory
- and paste the code

```
import { UserRole } from "@prisma/client";
import NextAuth from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
role: UserRole;  // this is the type of role
};

declare module "next-auth" {
interface Session {
  user: ExtendedUser;
}
}

```

#### Now you can see the role of the user in the session

## Adding Google and Github providers

56. Add google and github providers inside providers in `auth.config.ts` file from

```
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";
```

```
 Github({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
```

57. Add secrets to env file

    - `GOOGLE_CLIENT_ID`
    - `GOOGLE_CLIENT_SECRET`
    - `GITHUB_CLIENT_ID`
    - `GITHUB_CLIENT_SECRET`

58. Test google and github in `social.tsx`

```
"use client";

import { signIn } from "next-auth/react"; // this is we have to import when in client side
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
// import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DEFAULT_LOGIN_REDIRECT } from "@/route";

export const Social = () => {
    // const searchParams = useSearchParams();
    // const callbackUrl = searchParams.get("callbackUrl");

    const onClick = (provider: "google" | "github") => {
        signIn(provider, {
            callbackUrl: DEFAULT_LOGIN_REDIRECT,
        });
    }

    return (
        <div className="flex items-center w-full gap-x-2">
            <Button
                size="lg"
                className="w-full"
                variant="outline"
                onClick={() => onClick("google")}
            >
                <FcGoogle className="h-5 w-5" />
            </Button>
            <Button
                size="lg"
                className="w-full"
                variant="outline"
                onClick={() => onClick("github")}
            >
                <FaGithub className="h-5 w-5" />
            </Button>
        </div>
    );
};

```

59. linkAccount from Auth.js site can be used to directly register in case of google and github when the user does not exist and and there will be no need for register page

- update auth.ts `events`

```
  // * This is for linkAccount feature
 events:{
   async linkAccount({user}){
     await db.user.update({
       where :{id : user.id},
       data : {emailVerified: new Date()}
     })
   }
 },
```

60. Add this too

```
 // * This is for solving errors when using linkAccount feature
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
```

61. Create 2 new files, error-card.tsx and error.tsx in `auth`folder and `components/auth` folder respectively

62. Update `routes.ts` file to

```
export const authRoutes = ["/auth/login", "/auth/register", "/auth/error"];
```

63. Get the error of 59 and display it in login form itself in `LoginForm.tsx` file

```
  // * for getting search params for error in case not logged in
    const searchParams = useSearchParams()
    const urlError = searchParams.get("error") === "OAuthAccountNotLinked" ? "Email already with different mail provider" : ""

```

and

```
      <FormError message={error || urlError} />
```

#### Oauth completed here.

## Email verification for OAuth users

64. Go to `schema.prisma` to add new model for `VerificiationToken`

65. Push the schema to database
    `npx prisma generate` and `npx prisma db push`

66. create `verification-token.ts` file in `lib/actions/auth` folder

```
import { db } from "@/lib/database.connection";

export const getVerificationTokenByToken = async (token: string) => {
  try {
    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
    });

    return verificationToken;
  } catch {
    return null;
  }
};

export const getVerificationTokenByEmail = async (email: string) => {
  try {
    const verificationToken = await db.verificationToken.findFirst({
      where: { email },
    });

    return verificationToken;
  } catch {
    return null;
  }
};
```

67. Create a `lib` to generate token in `lib/token` file

- For generating token we use `uuid` package
- `npm i uuid` and `npm i --save-dev @types/uuid`

```
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { db } from "./database.connection";
import { getVerificationTokenByEmail } from "./actions/auth/verification-token";

export const generateVerificationToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000);


  const existingToken = await getVerificationTokenByEmail(email);

  if (existingToken) {
    await db.verificationToken.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  const verficationToken = await db.verificationToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return verficationToken;
};


```

68. Now generate the token when user is created

- Do it in `register.ts` file

```
const verificationToken = await generateVerificationToken(email);
```

69. Not allowing the user to login until he verifies his email
    for that:

```
 // * not allowing the user to login if the email is not verified
  const exisitingUser = await getUserByEmail(email);
  if (!exisitingUser || !exisitingUser.password || !exisitingUser.email) {
    return { error: "Email does not exist" };
  }

  if (!exisitingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      exisitingUser.email
    );
    return { success: "Confirmation Email sent!" };
  }
  // *
```

70. adding callback to `auth.ts` file

```
 async signIn({ user, account }) {
      if (account?.provider !== "credentials") return true;

      const exisitingUser = await getUserById(user.id);

      if (!exisitingUser?.emailVerified) return false;

      // TODO : Add 2FA check

      return true;
    },
```

71. Setting up mail provider

- using `resend`
- `npm install resned`
- add api key in .env file
- before hosting, we can only send mail to oursleves, by the account which we have created in resend
- after hosting and adding domain of '.com' we can send mail to anyone, but that also has some limitations
- create `mail.ts` file in `lib` folder

```
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);
export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `http://localhost:3000/auth/new-verification?token=${token}`;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Confirm your email",
    html: `<p>Click <a href="${confirmLink}">here</a> to confirm email.</p>`,
  });
};

```

73. Sending mail while logging in too, if email is not verfied in `login.ts` file

```
// * sending mail while logging in if email is not verified
     await sendVerificationEmail(
       verificationToken.email,
       verificationToken.token
     );
```

74. Add new route to `routes.ts` file i.e. `export const publicRoutes = ["/", "/auth/new-verfiiation"];`
75. Create `new-verification.tsx` file in `pages/auth` folder
76. Create `new-verification-form.tsx` file in `components/auth` folder

```
'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { CardWrapper } from './card-wrapper'
import { BeatLoader } from 'react-spinners'
import { useSearchParams } from 'next/navigation'

const NewVerficationForm = () => {

    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();

    const searchParams = useSearchParams();

    const token = searchParams.get("token");

    const onSubmit = useCallback(() => {
        if (success || error) return;

        console.log("token", token)

        if (!token) {
            setError("Missing token!");
            return;
        }

        // newVerification(token)
        //     .then((data) => {
        //         setSuccess(data.success);
        //         setError(data.error);
        //     })
        //     .catch(() => {
        //         setError("Something went wrong!");
        //     })
    }, [token, success, error]);

    useEffect(() => {
        onSubmit();
    }, [onSubmit]);
    return (
        <CardWrapper
            headerLabel="Confirming your verification"
            backButtonLabel="Back to login"
            backButtonHref="/auth/login"
        >
            <div className="flex items-center w-full justify-center">
                <BeatLoader />
            </div>
        </CardWrapper>
    )
}

export default NewVerficationForm

```

77. Create new action in `/actions/auth` folder

```
"use server";

import { getVerificationTokenByToken } from "@/lib/actions/auth/verification-token";
import { getUserByEmail } from "@/lib/actions/user.action";
import { db } from "@/lib/database.connection";



export const newVerification = async (token: string) => {
  const existingToken = await getVerificationTokenByToken(token);

  if (!existingToken) {
    return { error: "Token does not exist!" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token has expired!" };
  }

  const existingUser = await getUserByEmail(existingToken.email);

  if (!existingUser) {
    return { error: "Email does not exist!" };
  }

  // when user updates his email, we create a token and send it to new mail, when user verifies it, we update the email
  await db.user.update({
    where: { id: existingUser.id },
    data: {
      emailVerified: new Date(),
      email: existingToken.email,
    },
  });

  await db.verificationToken.delete({
    where: { id: existingToken.id },
  });

  return { success: "Email verified!" };
};
```

78. Uncomment the lines code in `new-verification-form.tsx` file
79. To show loader and message, add the following code in `new-verification-form.tsx` file

```
 <div className="flex items-center w-full justify-center">
                {!success && !error && (
                    <BeatLoader />
                )}
                <FormSuccess message={success} />
                {!success && (
                    <FormError message={error} />
                )}
            </div>

```

## Reset password email functionality

80. Create a new page `/auth/reset` in which you need to import the form from `components/auth` folder

81. Create a new form in `components/auth` folder i.e `reset-form.tsx` which will only contain the email field

82. Create a new action in `/actions/auth` folder i.e `reset.ts` file

```
"use server";

import { getUserByEmail } from "@/lib/actions/user.action";
import { ResetSchema } from "@/schema";
import * as z from "zod";

export const reset = async (values: z.infer<typeof ResetSchema>) => {
  const validatedFields = ResetSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid emaiL!" };
  }

  const { email } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return { error: "Email not found!" };
  }

  //   const passwordResetToken = await generatePasswordResetToken(email);
  //   await sendPasswordResetEmail(
  //     passwordResetToken.email,
  //     passwordResetToken.token
  //   );

  return { success: "Reset email sent!" };
};

```

83. In `reset-form.tsx` file, add the following code

```
"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { CardWrapper } from "@/components/auth/card-wrapper"
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { ResetSchema } from "@/schema";
import { FormSuccess } from "../form-sucess";
import { reset } from "@/actions/auth/reset";


export const ResetForm = () => {
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof ResetSchema>>({
        resolver: zodResolver(ResetSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = (values: z.infer<typeof ResetSchema>) => {
        setError("");
        setSuccess("");

        startTransition(() => {
            reset(values)
                .then((data) => {
                    setError(data?.error);
                    setSuccess(data?.success);
                });
        });
    };

    return (
        <CardWrapper
            headerLabel="Forgot your password?"
            backButtonLabel="Back to login"
            backButtonHref="/auth/login"
        >
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            placeholder="john.doe@example.com"
                                            type="email"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormError message={error} />
                    <FormSuccess message={success} />
                    <Button
                        disabled={isPending}
                        type="submit"
                        className="w-full"
                    >
                        Send reset email
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    );
};
```

84. Also create a new schema in `schema/index.ts` file

```
// reset schema
export const ResetSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
});

```

85. Add the schema in `schema.prisma` file

```
// * for password reset
model PasswordResetToken {
  id String @id @default(cuid())
  email String
  token String @unique
  expires DateTime

  @@unique([email, token])
}


```

86. Now run the following command
    `npx prisma generate` and `npx prisma db push`

87. Create a new action in `lib/actions/auth` folder i.e `password-reset-token.ts` file using email and token

```
import { db } from "@/lib/database.connection";

export const getPasswordResetTokenByToken = async (token: string) => {
try {
  const passwordResetToken = await db.passwordResetToken.findUnique({
    where: { token },
  });

  return passwordResetToken;
} catch {
  return null;
}
};

export const getPasswordResetTokenByEmail = async (email: string) => {
try {
  const passwordResetToken = await db.passwordResetToken.findFirst({
    where: { email },
  });

  return passwordResetToken;
} catch {
  return null;
}
};
```

88. Create a new file `token.ts` in `lib` folder

```
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { db } from "./database.connection";
import { getVerificationTokenByEmail } from "./actions/auth/verification-token";
import { getPasswordResetTokenByEmail } from "./actions/auth/password-reset-token";

export const generateVerificationToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000); // * expiring in 1 hour

  const existingToken = await getVerificationTokenByEmail(email);

  if (existingToken) {
    await db.verificationToken.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  const verficationToken = await db.verificationToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return verficationToken;
};


// generating password reset token
export const generatePasswordResetToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await getPasswordResetTokenByEmail(email);

  if (existingToken) {
    await db.passwordResetToken.delete({
      where: { id: existingToken.id },
    });
  }

  const passwordResetToken = await db.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return passwordResetToken;
};
```

89. Write mail to send mail verification in `mail.ts` file

```
// sending password reset email
export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `http://localhost:3000/auth/new-password?token=${token}`;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Reset your password",
    html: `<p>Click <a href="${resetLink}">here</a> to reset password.</p>`,
  });
};
```

90. Uncomment the code in `reset.ts` file

## Reset Password Form

91. Add new route in `routes.ts` file i.e `export const resetRoutes = ["/auth/reset", "/auth/new-password"];`
92. Create the new schema in `schema/index.ts` file

```
// new password schema
export const NewPasswordSchema = z.object({
  password: z.string().min(6, {
    message: "Minimum of 6 characters required",
  }),
});

```

93. Create a new file in `components/auth` folder i.e `new-password-form.tsx` file which will be imported to `/auth/new-password.tsx` file

```
'use client'
import React, { useState, useTransition } from 'react'
import { CardWrapper } from './card-wrapper';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from "@/components/ui/input";
import { useForm } from 'react-hook-form';
import { NewPasswordSchema } from '@/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { FormError } from '../form-error';
import { FormSuccess } from '../form-sucess';
import { Button } from '../ui/button';
import { useSearchParams } from 'next/navigation';
import { newPassword } from '@/actions/auth/new-password';

const NewPasswordForm = () => {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof NewPasswordSchema>>({
        resolver: zodResolver(NewPasswordSchema),
        defaultValues: {
            password: "",
        },
    });

    const onSubmit = (values: z.infer<typeof NewPasswordSchema>) => {
        setError("");
        setSuccess("");

        startTransition(() => {
            newPassword(values, token)
                .then((data) => {
                    setError(data?.error);
                    setSuccess(data?.success);
                });
        });
    };

    return (
        <CardWrapper
            headerLabel="Enter a new password"
            backButtonLabel="Back to login"
            backButtonHref="/auth/login"
        >
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            placeholder="******"
                                            type="password"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormError message={error} />
                    <FormSuccess message={success} />
                    <Button
                        disabled={isPending}
                        type="submit"
                        className="w-full"
                    >
                        Reset password
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    )
}

export default NewPasswordForm

```

94. Create a new action in `/actions/auth` folder i.e `new-password.ts` file

```
"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { NewPasswordSchema } from "@/schema";
import { getPasswordResetTokenByToken } from "@/lib/actions/auth/password-reset-token";
import { getUserByEmail } from "@/lib/actions/user.action";
import { db } from "@/lib/database.connection";


export const newPassword = async (
  values: z.infer<typeof NewPasswordSchema>,
  token?: string | null
) => {
  if (!token) {
    return { error: "Missing token!" };
  }

  const validatedFields = NewPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { password } = validatedFields.data;

  const existingToken = await getPasswordResetTokenByToken(token);

  if (!existingToken) {
    return { error: "Invalid token!" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token has expired!" };
  }

  const existingUser = await getUserByEmail(existingToken.email);

  if (!existingUser) {
    return { error: "Email does not exist!" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.user.update({
    where: { id: existingUser.id },
    data: { password: hashedPassword },
  });

  await db.passwordResetToken.delete({
    where: { id: existingToken.id },
  });

  return { success: "Password updated!" };
};
```

It shoul now start working.

## 2Factor Authentication

95. Update `schema.prisma` file

- user model

```
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  password      String?
  accounts      Account[]
  role          UserRole @default(USER)
  isTwoFactorEnabled Boolean @default(false)
  twoFactorConfirmation TwoFactorConfirmation?
}
```

- isTwoFactorEnabled model

```
model TwoFactorToken {
  id String @id @default(cuid())
  email String
  token String @unique
  expires DateTime

  @@unique([email, token])
}
```

- TwoFactorConfirmation model

```
model TwoFactorConfirmation {
  id String @id @default(cuid())

  userId String
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId])
}
```

96. Now run the following command
    `npx prisma generate` and `npx prisma db push`

97. # Setting up two-factor-token

- Create a new file in `lib/actions/auth` folder i.e `two-factor-token.ts` file

```
import { db } from "@/lib/database.connection";

export const getTwoFactorTokenByToken = async (token: string) => {
  try {
    const twoFactorToken = await db.twoFactorToken.findUnique({
      where: { token },
    });

    return twoFactorToken;
  } catch {
    return null;
  }
};

export const getTwoFactorTokenByEmail = async (email: string) => {
  try {
    const twoFactorToken = await db.twoFactorToken.findFirst({
      where: { email },
    });

    return twoFactorToken;
  } catch {
    return null;
  }
};
```

- Setting up the action for confirming two-factor token in `lib/actions/auth` folder `two-factor-confirmation.ts` file

```
import { db } from "@/lib/database.connection";

export const getTwoFactorConfirmationByUserId = async (userId: string) => {
 try {
   const twoFactorConfirmation = await db.twoFactorConfirmation.findUnique({
     where: { userId },
   });

   return twoFactorConfirmation;
 } catch {
   return null;
 }
};

```

- Generating Two factor token in `lib/token` file

```
export const generateTwoFactorToken = async (email: string) => {
  const token = crypto.randomInt(100_000, 1_000_000).toString();
  const expires = new Date(new Date().getTime() + 5 * 60 * 1000);

  const existingToken = await getTwoFactorTokenByEmail(email);

  if (existingToken) {
    await db.twoFactorToken.delete({
      where: {
        id: existingToken.id,
      }
    });
  }

  const twoFactorToken = await db.twoFactorToken.create({
    data: {
      email,
      token,
      expires,
    }
  });

  return twoFactorToken;
}
```

- Sned two factor token email

```
export const sendTwoFactorTokenEmail = async (
  email: string,
  token: string
) => {
  await resend.emails.send({
    from: "mail@auth-masterclass-tutorial.com",
    to: email,
    subject: "2FA Code",
    html: `<p>Your 2FA code: ${token}</p>`
  });
};
```

98. Go to prisma studio and enable the 2FA for a user

99. Modify the login function in `auth.ts` file

```

      // * Prevent sign in without two factor confirmation  (99)
      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(
          existingUser.id
        );

        if (!twoFactorConfirmation) return false;

        // Delete two factor confirmation for next sign in
        await db.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id },
        });
      }
```

100. Add 2FA Verification in `login.ts` file

```
 //* 2FA verification
  if (exisitingUser.isTwoFactorEnabled && exisitingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(exisitingUser.email);

      if (!twoFactorToken) {
        return { error: "Invalid code!" };
      }

      if (twoFactorToken.token !== code) {
        return { error: "Invalid code!" };
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date();

      if (hasExpired) {
        return { error: "Code expired!" };
      }

      await db.twoFactorToken.delete({
        where: { id: twoFactorToken.id },
      });

      const existingConfirmation = await getTwoFactorConfirmationByUserId(
        exisitingUser.id
      );

      if (existingConfirmation) {
        await db.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id },
        });
      }

      await db.twoFactorConfirmation.create({
        data: {
          userId: exisitingUser.id,
        },
      });
    } else {
      const twoFactorToken = await generateTwoFactorToken(exisitingUser.email);
      await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token);

      return { twoFactor: true };
    }
  }
```

101. Update the login schema

```
export const LoginSchema = z.object({
email: z.string().email({
  message: "Email is required",
}),
password: z.string().min(1, {
  message: "Password is required",
}),
code: z.optional(z.string()),
});

```
102. Update the login form, based on the conditions (see the code directly from file)
- concept is to show 2FA code, when after the login button is clicked, and two factor is enabled
- (might be incomplete)





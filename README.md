
Home Page
![image](https://github.com/CodeMaster17/role-based-authentication-Authjs/assets/96763776/e1dfd40a-1dda-43ea-8f62-e839aadd30f5)

Login page
![image](https://github.com/CodeMaster17/role-based-authentication-Authjs/assets/96763776/9f0e2fad-b380-4f1c-a622-1b45ac9702f3)

Register Page
![image](https://github.com/CodeMaster17/role-based-authentication-Authjs/assets/96763776/91375ff6-d19d-47c3-be3e-d8893a6eff66)

Settings Page
![image](https://github.com/CodeMaster17/role-based-authentication-Authjs/assets/96763776/91663aaf-f2e1-4aa4-87fe-3b4fde78817d)

Description: <br/>
Welcome to our Next.js Authentication Guide, a comprehensive resource designed to empower developers with the tools and knowledge needed to implement a robust authentication system in their Next.js applications. Leveraging NextAuth.js, this guide covers everything from setting up basic login mechanisms to implementing advanced security features. 

Key Features:
- 🔐 Next-auth v5 (Auth.js)
- 🚀 Next.js 14 with server actions
- 🔑 Credentials Provider
- 🌐 OAuth Provider (Social login with Google & GitHub)
- 🔒 Forgot password functionality
- ✉️ Email verification
- 📱 Two factor verification
- 👥 User roles (Admin & User)
- 🔓 Login component (Opens in redirect or modal)
- 📝 Register component
- 🤔 Forgot password component
- ✅ Verification component
- ⚠️ Error component
- 🔘 Login button
- 🚪 Logout button
- 🚧 Role Gate
- 🔍 Exploring next.js middleware
- 📈 Extending & Exploring next-auth session
- 🔄 Exploring next-auth callbacks
- 👤 useCurrentUser hook
- 🛂 useRole hook
- 🧑 currentUser utility
- 👮 currentRole utility
- 🖥️ Example with server component
- 💻 Example with client component
- 👑 Render content for admins using RoleGate component
- 🛡️ Protect API Routes for admins only
- 🔐 Protect Server Actions for admins only
- 📧 Change email with new verification in Settings page
- 🔑 Change password with old password confirmation in Settings page
- 🔔 Enable/disable two-factor auth in Settings page
- 🔄 Change user role in Settings page (for development purposes only)

### Prerequisites

**Node version 18.7.x**

### Cloning the repository

```shell
git clone https://github.com/CodeMaster17/role-based-authentication-Authjs.git
```

### Install packages

```shell
npm i
```

### Setup .env file


```js
DATABASE_URL=
DIRECT_URL=

AUTH_SECRET=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

RESEND_API_KEY=

NEXT_PUBLIC_APP_URL=
```

### Setup Prisma
```shell
npx prisma generate
npx prisma db push
```

### Start the app

```shell
npm run dev
```

## Available commands

Running commands with npm `npm run [command]`

| command         | description                              |
| :-------------- | :--------------------------------------- |
| `dev`           | Starts a development instance of the app |

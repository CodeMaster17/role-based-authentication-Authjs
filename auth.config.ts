// * This file is used to trigger the middleware on the edge
// * That is why we use auth.ts and auth.config.ts as seprate files


import GitHub from "next-auth/providers/github";

import type { NextAuthConfig } from "next-auth";

export default {
  providers: [GitHub],
} satisfies NextAuthConfig;

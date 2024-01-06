import { PrismaClient } from "@prisma/client";

//decllaring type for globalTHis
declare global {
  var prisma: PrismaClient | undefined;
}

// we are doing this because of next js hot reload functionality, because it will create multiple instance of prisma client
//global this is not affected by hot reloed
export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;

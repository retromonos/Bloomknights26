import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import process from "process";
import { prisma } from "../app";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001/",
  emailAndPassword: { enabled: true },
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
});

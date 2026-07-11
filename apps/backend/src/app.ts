import express from "express";
// import cookieParser from "cookie-parser";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { toNodeHandler } from "better-auth/node";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import loadCounties from "./routes/geo.js";

import cors from "cors";
const app = express();

const port = process.env.PORT || 3001;
export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL || "postgresql://postgres:example@localhost:5432/postgres" })
});

// view engine setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}))

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001/",
  emailAndPassword: { enabled: true },
  trustedOrigins: ["http://localhost:3000"],
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
});

app.all("/api/auth/*", toNodeHandler(auth));

// error handler
app.use(function (
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

loadCounties()

export default app;

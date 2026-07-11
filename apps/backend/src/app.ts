import express from "express";
import path from "path";
// import cookieParser from "cookie-parser";
import createHttpError from "http-errors";
import usersRouter from "./routes/users.js";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";

var app = express();

const port = process.env.PORT || 3001;
export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

// view engine setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use("/api/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  next(createHttpError(404));
});

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

app.all("/api/auth/*", toNodeHandler(auth));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;

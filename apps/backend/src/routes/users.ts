import express from "express";
var usersRouter = express.Router();

/* GET users listing. */
usersRouter.get("/", function (req: express.Request, res: express.Response, next: express.NextFunction) {
  res.send("respond with a resource");
});

export default usersRouter;

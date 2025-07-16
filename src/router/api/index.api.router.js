import { Router } from "express";
import users from "./user.api.router.js";

const apiRouter = Router()

apiRouter.use('/users', users);

export default apiRouter
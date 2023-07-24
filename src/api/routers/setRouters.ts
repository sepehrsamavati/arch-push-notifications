import { Application, Router } from "express";
import serviceRouter from "./service.router.js";

export default function setRouters(app: Application) {
    const apiRouter = Router();

    apiRouter.use('/service', serviceRouter);

    app.use('/api', apiRouter);
}
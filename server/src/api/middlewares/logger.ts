import { RequestHandler } from "express";

export const httpLogger: RequestHandler = (req, res, next) => {
    const { ip, method, path } = req;
    const userAgent = req.headers?.["user-agent"];
    const startTime = performance.now();
    res.once("finish", () => {
        console.info(`${res.statusCode} ${ip} ${Math.round(performance.now() - startTime)}ms ${path} ${method} ${userAgent}`);
    });
    next();
};

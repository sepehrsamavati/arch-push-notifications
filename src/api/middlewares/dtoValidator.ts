import { json, RequestHandler } from "express";
import { validateSync } from "class-validator";
import { plainToClass } from "class-transformer";

export const validator = <T extends object>(Model: new () => T) => {

    const createInstance = (rawData: unknown): T => plainToClass(Model, rawData) ?? new Model();

    const middleware: RequestHandler = (req, res, next) => {
        const instance = createInstance(['GET', 'DELETE'].includes(req.method) ? req.query : req.body);
        const errors = validateSync(instance);
        if(errors.length)
            res.status(400).json(errors);
        else
        {
            res.locals.dto = instance;
            next();
        }
    };

    return [json(), middleware];
};

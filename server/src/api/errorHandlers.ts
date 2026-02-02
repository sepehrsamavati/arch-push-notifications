import { Request, Response, ErrorRequestHandler } from "express";

export const notFoundHandler = function(req: Request, res: Response) {
    res.status(404);

    // respond with json
    if (req.accepts('json')) {
        res.json({ message: 'Not found', errorCode: 404 });
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
};

export const errorRequestHandler: ErrorRequestHandler = function(err, req, res, next) {
    const errorCode = err.status || 500;
    res.status(errorCode);
    res.json({
        message: err.message,
        errorCode
    });
    console.error("Express error request handler, " + (err.message ?? err));
};

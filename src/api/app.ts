import 'reflect-metadata';
import express from "express";
import { Server } from "node:http";
import setRouters from "./routers/setRouters.js";
import { httpLogger } from './middlewares/logger.js';
import { errorRequestHandler, notFoundHandler } from "./errorHandlers.js";
import config from '../config.js';

export class ExpressApplication {
    #app: express.Application = express();
    #server?: Server;

    initServer() {
        if (this.#server) return this.#server;

        this.#app.disable("x-powered-by");
        this.#app.use(httpLogger);

        this.#app.use((req, res, next) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Headers', '*');
            res.setHeader('Access-Control-Allow-Methods', '*');
            next();
        });

        setRouters(this.#app);

        this.#app.use(notFoundHandler);
        this.#app.use(errorRequestHandler);

        this.#server = this.#app.listen(config.api.port);
        this.#server.once("listening", () => {
            console.info(`Express listening on http://127.0.0.1:${config.api.port}`);
        });

        return this.#server;
    }

    dispose(): Promise<void> {
        return this.shutdown();
    }

    shutdown() {
        return new Promise<void>(resolve => {
            const server = this.#server;
            if (!server) return;

            server.once("close", () => {
                console.info("✅ REST API server closed.");
                this.#server = undefined;
                resolve();
            });

            console.info("Closing REST API server...");
            server.close();
        });
    }
}

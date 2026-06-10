export { ExpressApplication } from "./api/app.js";
export { default as setRouters } from "./api/routers/setRouters.js";
export { default as config, sqliteStorage } from "./config.js";

import { ExpressApplication } from "./api/app.js";

/** Start the standalone APN HTTP server. */
export async function start() {
    const app = new ExpressApplication();
    return app.initServer();
}

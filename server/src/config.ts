import * as dotenv from "dotenv";
dotenv.config({ quiet: true });

const config = Object.freeze({
    sqliteUrl: process.env?.ARCH_WP_SQLITE_URI || "sqlite:./db.sqlite3",
    api: {
        port: parseInt(process.env?.ARCH_WP_API_PORT ?? "5086")
    },
});

export default config;

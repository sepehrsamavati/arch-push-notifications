import * as dotenv from "dotenv";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";

dotenv.config({ quiet: true });

function resolveSqliteStorage(): string {
    const envUri = process.env?.ARCH_WP_SQLITE_URI?.trim();

    if (envUri) {
        const storagePath = envUri.startsWith("sqlite:")
            ? envUri.slice("sqlite:".length)
            : envUri;

        return path.isAbsolute(storagePath)
            ? storagePath
            : path.resolve(process.cwd(), storagePath);
    }

    const dataDir = process.env?.ARCH_WP_DATA_DIR?.trim()
        || path.join(os.homedir(), ".arch-push-notifications");

    fs.mkdirSync(dataDir, { recursive: true });

    return path.join(dataDir, "db.sqlite3");
}

export const sqliteStorage = resolveSqliteStorage();

const config = Object.freeze({
    sqliteStorage,
    api: {
        port: parseInt(process.env?.ARCH_WP_API_PORT ?? "5086", 10),
    },
});

export default config;

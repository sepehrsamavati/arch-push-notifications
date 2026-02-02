import config from "../../config.js";
import { Sequelize } from "sequelize";
import Models from "./configuration/Models.js";

export default class SqliteConnection {
    public readonly instance = new Sequelize(config.sqliteUrl, { logging: false });
    public readonly models = new Models(this.instance);

    async close() {
        await this.instance.close();
    }
}

export const connection = new SqliteConnection();

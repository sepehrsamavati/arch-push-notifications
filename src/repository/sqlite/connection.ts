import { Sequelize } from "sequelize";
import Models from "./configuration/Models.js";

export default class SqliteConnection {
    public readonly instance = new Sequelize("sqlite:./db.sqlite3", { logging: false });
    public readonly models = new Models(this.instance);

    async close() {
        await this.instance.close();
    }
}

export const connection = new SqliteConnection();

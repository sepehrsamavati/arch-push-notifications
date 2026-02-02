import { WhereOptions } from "sequelize";
import { connection } from "./connection.js";
import { IPushDbModel } from "./configuration/entities.js";

class PushRepository {
    private database;

    constructor() {
        this.database = connection;
    }

    async create(push: Omit<IPushDbModel, 'id'>): Promise<number | null> {
        try {
            const createdUserRef = await this.database.models.push.create(push);

            const createdPushId = createdUserRef.get().id;

            if (!Number.isNaN(createdPushId))
                return createdPushId;

            return null;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    // async get(push: Partial<IPushDbModel>): Promise<IPushDbModel | null> {
    //     try {
    //         const _where: WhereOptions<IPushDbModel> = {
    //             isDeleted: false
    //         };

    //         if (push.id)
    //             _where.id = push.id;

    //         if (push.status)
    //             _where.status = push.status;

    //         const res = (await this.database.models.push.findOne({
    //             plain: true,
    //             where: _where,
    //             include: {
    //                 all: true,
    //             }
    //         }))?.toJSON();

    //         return res ?? null;
    //     } catch (err) {
    //         console.error(err);
    //         return null;
    //     }
    // }

    async update(id: number, push: Partial<IPushDbModel>): Promise<boolean> {
        try {
            await this.database.models.push.update(push, {
                returning: [],
                where: {
                    id
                },
            });

            return true;
        } catch (err) {
            console.log(err)
            return false;
        }
    }
}

export const instance = new PushRepository();

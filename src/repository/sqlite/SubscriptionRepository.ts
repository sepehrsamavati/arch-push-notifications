import { WhereOptions } from "sequelize";
import { connection } from "./connection";
import { ISubscriptionDbModel, ISubscriptionWithId } from "./configuration/entities";

class SubscriptionRepository {
    private database;

    constructor() {
        this.database = connection;
    }

    async create(subscription: Omit<ISubscriptionDbModel, 'id'>): Promise<boolean> {
        try {
            const createdUserRef = await this.database.models.subscription.create(subscription);

            const createdSubscriptionId = createdUserRef.get().id;

            if (typeof createdSubscriptionId === "number")
                return true;

            return false;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    async getMany(subscription: Partial<ISubscriptionDbModel>): Promise<ISubscriptionWithId[] | null> {
        try {
            const _where: WhereOptions<ISubscriptionDbModel> = {
                isDeleted: false
            };

            if (subscription.id)
                _where.id = subscription.id;

            if (subscription.scopeId)
                _where.scopeId = subscription.scopeId;

            const res = await this.database.models.subscription.findAll({
                plain: true,
                where: _where,
                include: {
                    all: true,
                }
            });

            return res ? res.map(item => item.toJSON()).map(item => ({
                id: item.id,
                auth: item.auth,
                encoding: item.encoding,
                endpoint: item.endpoint,
                isDeleted: item.isDeleted,
                p256dh: item.p256dh,
                scope: (item as unknown as ISubscriptionWithId).scope,
                scopeUserId: item.scopeUserId,
            } satisfies ISubscriptionWithId)) : null;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async update(id: number, subscription: Partial<ISubscriptionDbModel>): Promise<boolean> {
        try {
            await this.database.models.subscription.update(subscription, {
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

export const instance = new SubscriptionRepository();

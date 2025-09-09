import { WhereOptions } from "sequelize";
import { connection } from "./connection";
import { IScopeDbModel } from "./configuration/entities";

class ScopeRepository {
    private database;

    constructor() {
        this.database = connection;
    }

    async get(scope: Partial<IScopeDbModel>): Promise<IScopeDbModel | null> {
        try {
            const _where: WhereOptions<IScopeDbModel> = {
                isDeleted: false
            };

            if (scope.id)
                _where.id = scope.id;

            if (scope.uniqueName)
                _where.uniqueName = scope.uniqueName;

            if (scope.accessToken)
                _where.accessToken = scope.accessToken;

            const res = (await this.database.models.scope.findOne({
                plain: true,
                where: _where,
                include: {
                    all: true,
                }
            }))?.toJSON();

            return res ?? null;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async update(id: number, scope: Partial<IScopeDbModel>): Promise<boolean> {
        try {
            await this.database.models.scope.update(scope, {
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

export const instance = new ScopeRepository();

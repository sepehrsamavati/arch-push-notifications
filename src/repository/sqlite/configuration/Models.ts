import { ContentEncoding } from "../../../types/enums.js";
import { DataTypes, type Model, type Sequelize } from "sequelize";
import type { ISubscription } from "../../../types/entities/subscription.js";
import type { CreateModel, IScopeDbModel, ISubscriptionDbModel } from "./entities.js";

export default class Models {
    public readonly subscription;
    public readonly scope;

    constructor(
        sequelize: Sequelize
    ) {
        this.subscription = sequelize.define<Model<ISubscriptionDbModel, CreateModel<ISubscriptionDbModel>>>('subscription', {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },

            isDeleted: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            scopeId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'scopes',
                    key: 'id',
                },
            },
            scopeUserId: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            encoding: {
                type: DataTypes.ENUM(ContentEncoding.AESGCM, ContentEncoding.AES128GCM),
                allowNull: false,
            },
            endpoint: {
                type: DataTypes.STRING(1e3),
                allowNull: false,
                unique: true,
                validate: {
                    len: [5, 1e3],
                    isUrl: true,
                },
            },
            auth: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    is: /^[A-Za-z0-9\-_+=/]+$/i, // Simple base64-like check
                    len: [10, 100],
                },
            },
            p256dh: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    is: /^[A-Za-z0-9\-_+=/]+$/i, // Simple base64-like check
                    len: [30, 150],
                },
            },
            expirationTime: {
                type: DataTypes.DOUBLE,
                allowNull: true,
                defaultValue: null,
            },
        }, {
            tableName: 'subscriptions',
            timestamps: true,
            underscored: false,
            indexes: [
                {
                    unique: false,
                    fields: ["scopeId", "scopeUserId"] satisfies Array<keyof ISubscriptionDbModel>
                }
            ]
        });

        this.scope = sequelize.define<Model<IScopeDbModel>>('scope', {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            isDeleted: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            uniqueName: {
                type: DataTypes.STRING(50),
                unique: true,
                allowNull: false,
            },
            getUserIdEndpoint: {
                type: DataTypes.STRING(500),
                allowNull: false,
            },
            accessToken: {
                type: DataTypes.STRING(500),
                allowNull: false,
                unique: true,
            },
            subject: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            publicKey: {
                type: DataTypes.STRING(200),
                allowNull: false,
            },
            privateKey: {
                type: DataTypes.STRING(200),
                allowNull: false,
            },
        }, {
            tableName: 'scopes',
            timestamps: true,
            underscored: false,
        });

        this.scope.hasMany(this.subscription, {
            foreignKey: 'scopeId' satisfies keyof ISubscriptionDbModel,
        });

        this.subscription.belongsTo(this.scope, {
            foreignKey: 'scopeId' satisfies keyof ISubscriptionDbModel,
            as: 'scope' satisfies keyof ISubscription,
        });

        sequelize.sync();
    }
}
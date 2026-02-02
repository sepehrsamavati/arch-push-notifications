import { DataTypes, type Model, type Sequelize } from "sequelize";
import { ContentEncoding, PushStatus } from "../../../types/enums.js";
import type { ISubscription } from "../../../types/entities/subscription.js";
import type { CreateModel, IPushDbModel, IScopeDbModel, ISubscriptionDbModel } from "./entities.js";

export default class Models {
    public readonly subscription;
    public readonly scope;
    public readonly push;

    constructor(
        sequelize: Sequelize
    ) {
        this.subscription = sequelize.define<Model<ISubscriptionDbModel, CreateModel<ISubscriptionDbModel>>>('Subscription', {
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

        this.scope = sequelize.define<Model<IScopeDbModel>>('Scope', {
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

        this.push = sequelize.define<Model<IPushDbModel, CreateModel<IPushDbModel>>>('Push', {
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
            date: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            content: {
                type: DataTypes.STRING(5e3),
                allowNull: false,
            },
            status: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: PushStatus.Pending,
                validate: {
                    isIn: [
                        [PushStatus.Pending, PushStatus.OK, PushStatus.Failed, PushStatus.Canceled],
                    ]
                }
            },
            subscriptionId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'subscriptions',
                    key: 'id',
                },
            },
        }, {
            tableName: 'pushes',
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
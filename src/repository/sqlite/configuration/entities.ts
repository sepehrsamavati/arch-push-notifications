import type { IScope } from "../../../types/entities/scope.js";
import type { ISubscription } from "../../../types/entities/subscription.js";

type WithIncrementalId<T> = T & {
    id: number;
};

export type CreateModel<T> = Omit<T, 'id'>;

export type ISubscriptionDbModel = WithIncrementalId<Omit<ISubscription, 'scope'> & { scopeId: number }>;
export type IScopeDbModel = WithIncrementalId<IScope>;

export type ISubscriptionWithId = WithIncrementalId<Omit<ISubscription, 'scope'> & { scope: IScopeDbModel }>;

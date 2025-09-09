import type { IScope } from "../../../types/entities/scope";
import type { ISubscription } from "../../../types/entities/subscription";

type WithIncrementalId<T> = T & {
    id: number;
};

export type CreateModel<T> = Omit<T, 'id'>;

export type ISubscriptionDbModel = WithIncrementalId<Omit<ISubscription, 'scope'> & { scopeId: number }>;
export type IScopeDbModel = WithIncrementalId<IScope>;

export type ISubscriptionWithId = WithIncrementalId<Omit<ISubscription, 'scope'> & { scope: IScopeDbModel }>;

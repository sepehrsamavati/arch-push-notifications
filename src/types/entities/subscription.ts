import type { IScope } from "./scope";
import type { ContentEncoding } from "../enums";

export type ISubscription = {
    scope: IScope;
    scopeUserId: string;
    isDeleted: boolean;

    endpoint: string;
    encoding: ContentEncoding;
    auth: string;
    p256dh: string;
};

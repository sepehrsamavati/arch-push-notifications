import type { PushStatus } from "../enums";
import type { ISubscription } from "./subscription";

export type IPush = {
    date: Date;
    content: string;
    isDeleted: boolean;
    status: PushStatus;
    subscription: ISubscription;
};

import type { PushStatus } from "../enums";
import type { ISubscription } from "./subscription";

export type IPush = {
    date: number;
    content: string;
    isDeleted: boolean;
    status: PushStatus;
    subscription: ISubscription;
};

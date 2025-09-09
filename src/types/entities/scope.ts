export type IScope = {
    uniqueName: string;
    isDeleted: boolean;
    /** VAPID subject */
    subject: string;
    /** VAPID public key */
    publicKey: string;
    /** VAPID private key */
    privateKey: string;
    /** Used for HTTP authentication (scope application to notification service) */
    accessToken: string;
    getUserIdEndpoint: string;
};

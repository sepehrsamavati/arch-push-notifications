export type IWebPushClientSetupArguments = {
    serverUrl: string;
    scope: string;
    serviceWorkerPath: string;
    onStateChange?: () => void;
    getAccessToken: () => Promise<string | null>;
    serviceWorkerVersion?: string;
    subscriptionEndpointLocalStorageKey?: string;
    serviceWorkerVersionLocalStorageKey?: string;
}
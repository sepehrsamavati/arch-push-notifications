export type IWebPushClientSetupArguments = {
    serverUrl: string;
    scope: string;
    serviceWorkerPath: string;
    onStateChange?: () => void;
    getAccessToken: () => Promise<string | null>;
    serviceWorkerVersion?: string;
    subscriptionEndpointLocalStorageKey?: string;
    serviceWorkerVersionLocalStorageKey?: string;
    /** Pre-registered service worker; use when the host app registers the SW itself */
    serviceWorkerRegistration?: ServiceWorkerRegistration | (() => ServiceWorkerRegistration | Promise<ServiceWorkerRegistration | undefined>);
}
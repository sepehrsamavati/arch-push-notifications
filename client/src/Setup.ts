import type { IWebPushClientSetupArguments } from "./types/clientSetupArguments";

export default class WebPushClientSetup {
    #args: Required<IWebPushClientSetupArguments>;

    get args() {
        return this.#args;
    }

    static arrayBufferToBase64(buffer: ArrayBuffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        bytes.forEach(b => binary += String.fromCharCode(b));
        return btoa(binary);
    }

    constructor(args: IWebPushClientSetupArguments) {
        this.#args = Object.freeze({
            ...JSON.parse(JSON.stringify(args)) as IWebPushClientSetupArguments,
            onStateChange: args.onStateChange ?? (() => null),
            serviceWorkerVersion: args.serviceWorkerVersion || "0.0.0-unspecified",
            serviceWorkerVersionLocalStorageKey: args.serviceWorkerVersionLocalStorageKey || "installed_service_worker_version",
            subscriptionEndpointLocalStorageKey: args.subscriptionEndpointLocalStorageKey || "push_subscription_endpoint",
        } satisfies Required<IWebPushClientSetupArguments>);
    }

    /** Get public key of scope from push server */
    async getWebPushPublicKey() {
        let publicKey: string;

        try {
            publicKey = await (await fetch(this.#args.serverUrl + "/api/service/publicKey?scope=" + this.#args.scope)).text();
        } catch (err) {
            console.error('Get public key', err);
            return;
        }

        return publicKey;
    }

    /** Register/install service worker file to client */
    async setupServiceWorker(doNotCheckForUpdates = false) {
        let registration: ServiceWorkerRegistration;

        try {
            registration = await navigator.serviceWorker.register(this.#args.serviceWorkerPath);
            // console.log('Service worker registered');
        } catch (err) {
            console.error('Service worker not registered -->', err);
            return;
        }

        if (registration && !doNotCheckForUpdates)
            this.#checkSwUpdate(registration);

        return registration;
    }

    /** Register client subscription to push server */
    async registerWebPush(accessToken: string, subscription: PushSubscription) {
        const auth = subscription.getKey('auth');
        const p256dh = subscription.getKey('p256dh');

        if (!(auth && p256dh)) return;

        try {
            const res = await fetch(this.#args.serverUrl + "/api/service/register", {
                method: 'POST',
                headers: {
                    'Content-Type': "application/json"
                },
                body: JSON.stringify({
                    scope: this.#args.scope,
                    accessToken: accessToken,
                    endpoint: subscription.endpoint,
                    encoding: "aes128gcm",
                    auth: WebPushClientSetup.arrayBufferToBase64(auth),
                    p256dh: WebPushClientSetup.arrayBufferToBase64(p256dh),
                    expirationTime: subscription.expirationTime,
                })
            });

            const data = await res.json() as { ok?: boolean; message?: string };

            if (typeof data?.message === "string") {
                data.message; // error message
            }

            if (typeof res?.ok === "boolean") {
                return data.ok; // created or not
            }

            return false;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    async #checkSwUpdate(serviceWorker: ServiceWorkerRegistration) {
        if (!('localStorage' in window && serviceWorker)) return;

        const version = this.#args.serviceWorkerVersion;
        const key = this.#args.serviceWorkerVersionLocalStorageKey;

        const installedVersion = window.localStorage.getItem(key);
        if (installedVersion !== version) {
            try {
                await serviceWorker?.update();
            } catch { }
            window.localStorage.setItem(key, version);
        }
    }
}
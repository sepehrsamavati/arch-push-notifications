import Setup from "./Setup";
import type { IRegisterErrorText } from "./types/errorText";
import type { IWebPushClientSetupArguments } from "./types/clientSetupArguments";

export default class WebPushClient {
    #setup;

    constructor(setupArgs: IWebPushClientSetupArguments) {
        this.#setup = new Setup(setupArgs);
    }

    async setupServiceWorkerAsync() {
        const registration = await this.#setup.setupServiceWorker();

        if (registration) {
            this.#serviceWorker = registration;
            this.#setup.args.onStateChange();
        }

        return registration;
    }

    setupServiceWorkerSync(cb?: (swr?: ServiceWorkerRegistration) => void) {
        this.setupServiceWorkerAsync().then(cb);
        return this;
    }

    initialize() {
        if (this.#initialized || !this.#serviceWorker) return;
        this.#initialized = true;
        this.#setup.getWebPushPublicKey()
            .then(publicKey => {
                if (publicKey) {
                    this.#publicKey = publicKey;

                    this.#serviceWorker?.pushManager
                        .getSubscription()
                        .then(subscription => {
                            if (subscription) {
                                window.localStorage.setItem(this.#setup.args.subscriptionEndpointLocalStorageKey, subscription.endpoint);
                                this.#subscriptionExists(subscription.endpoint)
                                    .then(existsOnServer => {
                                        this.subscriptionRegistered = existsOnServer;
                                        this.#setup.args.onStateChange();
                                    });
                            }
                            else {
                                this.subscriptionRegistered = false;
                                this.#setup.args.onStateChange();
                            }
                        });
                }
            });
    }

    async #subscriptionExists(endpoint: string) {
        try {
            const query = new URLSearchParams();
            query.append("scope", this.#setup.args.scope);
            query.append("url", endpoint);
            const res = await fetch(this.#setup.args.serverUrl + "/api/service/subscriptionExists?" + query, { method: "GET" });
            if (res.status === 200) {
                const data = await res.json();
                return Boolean(data.ok);
            }
        } catch { }
        return false;
    }

    async #deleteSubscription(endpoint: string) {
        try {
            const query = new URLSearchParams();
            query.append("scope", this.#setup.args.scope);
            query.append("url", endpoint);
            const res = await fetch(this.#setup.args.serverUrl + "/api/service/subscription?" + query, { method: "DELETE" });
            if (res.status === 200) {
                const data = await res.json();
                return Boolean(data.ok);
            }
        } catch { }
        return false;
    }

    #initialized = false;
    #publicKey?: string;
    #serviceWorker?: ServiceWorkerRegistration;
    subscriptionRegistered: boolean | null = null;

    get inactive() {
        return !this.webPushIsSupported || this.#publicKey
    }

    get webPushIsSupported() {
        return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    }

    async #getNewWebPushSubscription() {
        if (!(this.#publicKey && this.#serviceWorker)) return;

        let subscription = await this.#serviceWorker.pushManager.getSubscription();

        await this.unsubscribe(subscription);

        this.subscriptionRegistered = false;

        subscription = await this.#serviceWorker?.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.#publicKey
        });

        window.localStorage.setItem(this.#setup.args.subscriptionEndpointLocalStorageKey, subscription.endpoint);

        return subscription;
    }

    async unsubscribe(subscription?: PushSubscription | null) {
        if (!subscription && this.webPushIsSupported)
            subscription = await this.#serviceWorker?.pushManager.getSubscription();

        const endpoint = subscription?.endpoint || window.localStorage.getItem(this.#setup.args.subscriptionEndpointLocalStorageKey);
        if (!endpoint) return;

        const [unsubscribed, deleted] = await Promise.all([
            subscription?.unsubscribe(),
            this.#deleteSubscription(endpoint),
        ]);

        if (unsubscribed || deleted) {
            this.subscriptionRegistered = false;
            window.localStorage.removeItem(this.#setup.args.subscriptionEndpointLocalStorageKey);
        }

        this.#setup.args.onStateChange();
    }

    async grantAccessAndRegister(): Promise<IRegisterErrorText | null> {

        if (!this.webPushIsSupported)
            return "webPushIsSupported";

        try {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                const token = await this.#setup.args.getAccessToken();
                if (!token) return "couldNotGetAccessToken";

                const subscription = await this.#getNewWebPushSubscription();
                if (!subscription) return "couldNotGetSubscription";

                const registered = await this.#setup.registerWebPush(token, subscription);

                if (registered) {
                    this.subscriptionRegistered = true;
                    this.#setup.args.onStateChange();
                    return null;
                } else {
                    return "errorOccurred";
                }
            }
            else {
                return "notificationAccessNotGranted";
            }
        } catch (err) {
            console.error(err);

            if (err instanceof Error && err.message.toLowerCase().includes('error retrieving push subscription')) {
                return "errorOccurredWhileTransferringData";
            }

            return "unknownError";
        }
    }

}

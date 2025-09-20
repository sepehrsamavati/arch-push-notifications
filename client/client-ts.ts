// Web push
const serverUrl = "https://...";
const scope = "drp-web";
const serviceWorkerPath = "/public/js/service-worker.js";
const serviceWorkerVersion = "1.0.0";
const swVersionLocalStorageKey = 'installed_service_worker_version';

function arrayBufferToBase64(buffer: ArrayBuffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary);
}

async function getWebPushPublicKey() {
    let publicKey: string;

    try {
        publicKey = await (await fetch(serverUrl + "/api/service/publicKey?scope=" + scope)).text();
    } catch (err) {
        console.error('Get public key', err);
        return;
    }

    return publicKey;
}

async function setupServiceWorker() {
    let registration: ServiceWorkerRegistration;

    try {
        registration = await navigator.serviceWorker.register(serviceWorkerPath);
        // console.log('Service worker registered');
    } catch (err) {
        console.error('Service worker not registered -->', err);
        return;
    }

    return registration;
}

async function registerWebPush(accessToken: string, subscription: PushSubscription) {
    const auth = subscription.getKey('auth');
    const p256dh = subscription.getKey('p256dh');

    if (!(auth && p256dh)) return;

    try {
        const res = await fetch(serverUrl + "/api/service/register", {
            method: 'POST',
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify({
                scope: scope,
                accessToken: accessToken,
                endpoint: subscription.endpoint,
                encoding: "aes128gcm",
                auth: arrayBufferToBase64(auth),
                p256dh: arrayBufferToBase64(p256dh),
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

class WebPushClient {
    constructor() {
        setupServiceWorker()
            .then(registration => {
                if (registration) {
                    this.#serviceWorker = registration;
                    this.#checkSwUpdate();
                    this.#refreshUI();
                }
            });
    }

    async #checkSwUpdate() {
        if (!('localStorage' in window && this.#serviceWorker)) return;

        const installedVersion = window.localStorage.getItem(swVersionLocalStorageKey);
        if (installedVersion !== serviceWorkerVersion) {
            try {
                await this.#serviceWorker?.update();
            } catch { }
            window.localStorage.setItem(swVersionLocalStorageKey, serviceWorkerVersion);
        }
    }

    #refreshUI() {
        // for react context set state
    }

    initialize() {
        if (this.#initialized || !this.#serviceWorker) return;
        this.#initialized = true;
        getWebPushPublicKey()
            .then(publicKey => {
                if (publicKey) {
                    this.#publicKey = publicKey;

                    this.#serviceWorker?.pushManager
                        .getSubscription()
                        .then(subscription => {
                            if (subscription)
                                this.#subscriptionExists(subscription.endpoint)
                                    .then(existsOnServer => {
                                        this.subscriptionRegistered = existsOnServer;
                                        this.#refreshUI();
                                    });
                            else {
                                this.subscriptionRegistered = false;
                                this.#refreshUI();
                            }
                        });
                }
            });
    }

    async #subscriptionExists(endpoint: string) {
        try {
            const query = new URLSearchParams();
            query.append("scope", scope);
            query.append("url", endpoint);
            const res = await fetch(serverUrl + "/api/service/subscriptionExists?" + query, { method: "GET" });
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
            query.append("scope", scope);
            query.append("url", endpoint);
            const res = await fetch(serverUrl + "/api/service/subscription?" + query, { method: "DELETE" });
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
    subscriptionRegistered = true;

    get inactive() {
        return !this.webPushIsSupported || this.#publicKey
    }

    get webPushIsSupported() {
        return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    }

    async getWebPushSubscription() {
        if (!(this.#publicKey && this.#serviceWorker)) return;

        let subscription = await this.#serviceWorker.pushManager.getSubscription();

        await this.unsubscribe(subscription);

        this.subscriptionRegistered = false;

        subscription = await this.#serviceWorker?.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.#publicKey
        });

        return subscription;
    }

    async unsubscribe(subscription?: PushSubscription | null) {
        if (!subscription)
            subscription = await this.#serviceWorker?.pushManager.getSubscription();

        if (!subscription) return;

        const [unsubscribed, deleted] = await Promise.all([
            subscription.unsubscribe(),
            this.#deleteSubscription(subscription.endpoint),
        ]);

        if (unsubscribed || deleted)
            this.subscriptionRegistered = false;

        this.#refreshUI();
    }

    async grantAccessAndRegister() {
        if (!this.webPushIsSupported) return;
        try {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                const token = ""; // client access token
                if (!token) return;

                const subscription = await this.getWebPushSubscription();
                if (!subscription) return;

                const registered = await registerWebPush(token, subscription);

                if (registered) {
                    this.subscriptionRegistered = true;
                    this.#refreshUI();
                } else {
                    console.error("Error occurred");
                }

                return registered;
            }
            else {
                console.error("Access not granted");
            }
        } catch (err) {
            console.error("Error occurred", err);
        }
    }

}

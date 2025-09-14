document.addEventListener('DOMContentLoaded', initWebPushClient, false);

function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary);
}

async function subscriptionExists(scope, endpoint) {
    try {
        const query = new URLSearchParams();
        query.append("scope", scope);
        query.append("url", endpoint);
        const res = await fetch(serverUrl + "/api/service/subscriptionExistsHandler?" + query);
        if (res.status === 200) {
            const data = await res.json();
            return Boolean(data.ok);
        }
    } catch { }
    return false;
}

async function initWebPushClient() {
    const serverUrl = "http://HOST:PORT";
    const accessToken = "123";
    const scope = "test";
    const serviceWorkerPath = "service-worker.js";

    const publicKey = await (await fetch(serverUrl + "/api/service/publicKey?scope=" + scope)).text();

    const registration = await navigator.serviceWorker.ready;

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register(serviceWorkerPath)
            .then((reg) => {
                console.log('Service worker registered -->', reg);
            }, (err) => {
                console.error('Service worker not registered -->', err);
            });
    }

    const renewSubscription = async () => {
        let subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            const existsOnServer = await subscriptionExists(scope, subscription.endpoint);
            if (existsOnServer)
                await subscription.unsubscribe();
            else
                return subscription;
        }

        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: publicKey
        });

        return subscription;
    };

    const subscription = await renewSubscription();

    if (subscription)
        fetch(serverUrl + "/api/service/register", {
            method: 'POST',
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify({
                scope: scope,
                accessToken: accessToken,
                endpoint: subscription.endpoint,
                encoding: "aes128gcm",
                auth: arrayBufferToBase64(subscription.getKey('auth')),
                p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
                expirationTime: subscription.expirationTime,
            })
        })
            .then(res => res.json())
            .then(res => {
                if ('message' in res && typeof res.message === "string") {
                    res.message; // error message
                } else if ('ok' in res && typeof res.ok === "boolean") {
                    res.ok; // created or not
                }
            });

}
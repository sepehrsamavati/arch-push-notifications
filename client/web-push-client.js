document.addEventListener('DOMContentLoaded', initWebPushClient, false);

function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary);
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
            if (arrayBufferToBase64(subscription.getKey('p256dh')) !== publicKey)
                await subscription.unsubscribe();
            else return null;
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
            .then(res => res.text())
            .then(console.log);

}
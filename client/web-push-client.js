document.addEventListener('DOMContentLoaded', initWebPushClient, false);
async function initWebPushClient() {
    const serverUrl = "http://HOST:PORT";
    const serviceWorkerPath = "service-worker.js";

    const publicKey = await (await fetch(serverUrl + "/WebPush/GetPublicKeyPath")).text();

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
            if (subscription.getKey('p256dh') !== publicKey)
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
        fetch(serverUrl + "/WebPush/Register", {
            method: 'POST',
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify({
                id: 123,
                endpoint: subscription.endpoint,
                encoding: "aes128gcm",
                auth: subscription.getKey('auth'),
                p256dh: subscription.getKey('p256dh'),
                expirationTime: subscription.expirationTime,
            })
        })
            .then(res => res.text())
            .then(console.log);

}
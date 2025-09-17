/// <reference lib="webworker" /> // 
// @ts-check
/** @type {ServiceWorkerGlobalScope} */
// @ts-ignore
const sw = self;

'use strict';

sw.addEventListener('install', () => {
    sw.skipWaiting();
});

sw.addEventListener('push', function (event) {
    let notificationTitle = 'NO_TITLE';
    /** @type {Partial<NotificationOptions>} */
    let notificationOptions = {
        icon: '../favicon.ico',
        badge: '../pwa-192x192-white.png',
        data: {
            url: "https://sepehrsamavati.ir/"
        },
    };

    if (event.data) {
        const data = event.data.json();
        notificationTitle = data.title;

        notificationOptions = {
            ...notificationOptions,
            ...data,
        };

        if (data.url)
            notificationOptions.data.url = data.url;
    }

    event.waitUntil(
        sw.registration.showNotification(
            notificationTitle,
            notificationOptions,
        ),
    );
});

sw.addEventListener('notificationclick', function (event) {
    if (!event.notification?.data?.url) return;

    event.preventDefault();

    event.notification.close();

    const targetUrl = event.notification.data.url;

    event.waitUntil(sw.clients.matchAll({
        type: "window",
        includeUncontrolled: true
    }).then(function (clientList) {
        if (targetUrl) {
            let client = null;

            for (let i = 0; i < clientList.length; i++) {
                let item = clientList[i];

                if (item.url) {
                    client = item;
                    break;
                }
            }

            if (client && 'navigate' in client) {
                client.focus();
                event.notification.close();
                return client.navigate(targetUrl);
            }
            else {
                event.notification.close();
                // if client doesn't have navigate function, try to open a new browser window
                return sw.clients.openWindow(targetUrl);
            }
        }
    }));
});

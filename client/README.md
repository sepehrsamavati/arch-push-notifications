# @semizero/web-push-client

Browser helper for registering and managing web push subscriptions against an [Arch Push Notifications](https://github.com/sepehrsamavati/arch-push-notifications) server.

## Install

```bash
npm install @semizero/web-push-client
```

## Requirements

- A browser with Service Workers, Push API, and Notifications
- A service worker file hosted by your app (not bundled in this package)
- A running APN server (`arch-push-notifications`)

## Quick start

```ts
import { WebPushClient } from "@semizero/web-push-client";

const client = new WebPushClient({
    serverUrl: "https://push.example.com",
    scope: "my-app",
    serviceWorkerPath: "/service-worker.js",
    serviceWorkerVersion: "1.0.0",
    getAccessToken: async () => localStorage.getItem("accessToken"),
    onStateChange: () => {
        console.log("subscriptionRegistered:", client.subscriptionRegistered);
    },
});

// Option A: let the client register the service worker
await client.setupServiceWorkerAsync();

// Option B: inject your own registration
// await client.setServiceWorkerRegistration(await navigator.serviceWorker.register("/service-worker.js"));
// or pass serviceWorkerRegistration in the constructor

client.initialize();

const error = await client.grantAccessAndRegister();
if (error) console.error("Registration failed:", error);
```

## Service worker

You must provide your own service worker. See the sample in the repo at `client-samples/service-worker.js`.

## API

### `WebPushClient`

| Method / property | Description |
|---|---|
| `serviceWorkerRegistration` | Current `ServiceWorkerRegistration`, if set |
| `setServiceWorkerRegistration(registration)` | Inject a registration registered elsewhere |
| `useServiceWorkerRegistration(registration)` | Inject a registration or async resolver |
| `setupServiceWorkerAsync()` | Registers the service worker |
| `setupServiceWorkerSync(cb?)` | Fire-and-forget variant |
| `initialize()` | Fetches VAPID key and checks existing subscription |
| `getWebPushSubscription(renew?)` | Gets the browser push subscription (`renew` defaults to `true`) |
| `registerSubscription(subscription, accessToken?)` | POST subscription to the server for the current user |
| `registerForUser(options?)` | Gets subscription and POSTs it for the user (permission must already be granted) |
| `grantAccessAndRegister()` | Requests permission, subscribes, registers with server |
| `unsubscribe()` | Removes local and server subscription |
| `subscriptionRegistered` | `true` / `false` / `null` (loading) |
| `webPushIsSupported` | Browser capability check |
| `inactive` | `true` when push is unsupported or VAPID key is missing |

### Error codes (`grantAccessAndRegister`)

Returns `null` on success, otherwise one of:

- `webPushIsSupported`
- `notificationAccessNotGranted`
- `couldNotGetAccessToken`
- `couldNotGetSubscription`
- `errorOccurred`
- `errorOccurredWhileTransferringData`
- `unknownError`

## License

MIT

# arch-push-notifications

HTTP server for Arch Push Notifications (APN). Manages VAPID scopes, browser push subscriptions, and delivers notifications to registered clients.

## Install

```bash
npm install arch-push-notifications
```

## Run as a standalone server

```bash
# after build, or via npx
npx arch-push-notifications
```

Or programmatically:

```ts
import { start } from "arch-push-notifications";

await start();
```

## Configuration

Copy `.env.example` to `.env` or set environment variables:

| Variable | Default | Description |
|---|---|---|
| `ARCH_WP_API_PORT` | `5086` | HTTP listen port |
| `ARCH_WP_SQLITE_URI` | *(see below)* | SQLite file path (`sqlite:./db.sqlite3` or absolute path) |
| `ARCH_WP_DATA_DIR` | `~/.arch-push-notifications` | Data directory when `ARCH_WP_SQLITE_URI` is unset |

When neither `ARCH_WP_SQLITE_URI` nor `ARCH_WP_DATA_DIR` is set, the database is stored at `~/.arch-push-notifications/db.sqlite3` (not relative to `cwd`).

## Embed in your own Express app

```ts
import express from "express";
import { setRouters } from "arch-push-notifications";

const app = express();
setRouters(app);
app.listen(3000);
```

For full lifecycle control:

```ts
import { ExpressApplication } from "arch-push-notifications";

const apn = new ExpressApplication();
await apn.initServer();
// later
await apn.shutdown();
```

## API endpoints

All routes are under `/api/service`:

| Method | Path | Description |
|---|---|---|
| `GET` | `/publicKey?scope=` | VAPID public key for a scope |
| `POST` | `/register` | Register a browser push subscription |
| `GET` | `/subscriptionExists?scope=&url=` | Check if subscription exists |
| `DELETE` | `/subscription?scope=&url=` | Soft-delete a subscription |
| `POST` | `/push` | Send push notification to a user |

See the [root README](https://github.com/sepehrsamavati/arch-push-notifications) for scope setup and flow details.

## License

MIT

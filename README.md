# arch-push-notifications

## Definitions
- `Client`: Browser client that supports service workers and push notifications.
- `Scope application`: Backend server of the client.
- `APN`: This helper/service (arch push notifications).

```
Client <---> APN <---> SA (scope application)
```
### Client register
1. Client -Register-> APN
2. APN -Send client's access token-> SA
3. SA -Validate client token and return user ID-> APN
4. APN -Save subscription and send OK-> Client

### Push notification
1. SA -Request to send notification with access token-> APN
2. APN -Validates access token and sends in bulk-> Clients
3. APN -Return result-> SA
 
## Flow

### 1. Define scope
Defining scope (project/application) to `sqlite` db file.

| Value   |      Description      |
|----------|--------------|
| `uniqueName` | Client registers using this as a constant key/ID |
| <code style="color : greenyellow">accessToken</code> | Persistence access token that APN can authorize the request and do pushing |
| VAPID `subject`/`publicKey`/`privateKey` | Used in web push protocol (public key is shared via API to the client) |
| `getUserIdEndpoint` | Scope application endpoint that receives client <code style="color : orange">accessToken</code> in header with key 'ClientAccessToken' in a <ins>HTTP Get</ins> request and <ins>returns user ID</ins> (plain string as body of response) with HTTP code <code style="color : greenyellow">200</code> |

### 2. Client register
Client registers its browser subscription (FireFox, Chrome, Safari)

1. Grant notification access
2. Get <code style="color : orange">accessToken</code> from scope application (Client access token that the scope application can authenticate user with it)
3. Get public key of scope from push service
4. Register service worker (sample in git `./client/service-worker.js`)
5. Submit request to push service (sample in git `./client/web-push-client.js`)

## 3. Push service validate and register subscription
This service inquires user ID from scope application using `getUserIdEndpoint`

## 4. Scope application pushes notification to its user
Send <ins>HTTP Post</ins> request to push service `/api/service/push`  
With JSON body:

| Value   |      Description      |
|----------|--------------|
| `key` | Same as <code style="color : greenyellow">accessToken</code>; Defined in scope |
| `userId` | User ID (returned on inquiry when registering) |
| `title` | Title of notification |
| `bodyText` | Content of notification |
| `url` | URL opens when user clicks on this notification |

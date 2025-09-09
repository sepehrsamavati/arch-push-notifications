# arch-push-notifications
 
## Flow

### Define scope
Defining scope (project/application) to `sqlite` db file.

| Value   |      Description      |
|----------|--------------|
| `uniqueName` | Client registers using this as a constant key/ID |
| `accessToken` | Client access token that the scope application can authenticate user with it |
| VAPID `subject`/`publicKey`/`privateKey` | Used in web push protocol (public key is shared via API to the client) |
| `getUserIdEndpoint` | Scope application endpoint that receives client `accessToken` in header with key 'ClientAccessToken' in a <ins>HTTP Get</ins> request and <ins>returns user ID</ins> (plain string as body of response) with HTTP code <code style="color : greenyellow">200</code> |
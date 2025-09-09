# arch-push-notifications
 
## Flow

### Define scope
Defining scope (project/application) to `sqlite` db file.

`uniqueName`; Client registers using this as a key/ID  
VAPID `subject`/`publicKey`/`privateKey` used in web push protocol  
`accessToken`; Client access token that the scope application can authenticate user with it  
`getUserIdEndpoint`; Scope application endpoint that receives client `accessToken` in header with key 'ClientAccessToken' in a HTTP Get request and returns user ID (plain string as body of response) with HTTP code 200


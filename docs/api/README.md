Basic setup for testing API on command line:

- install `httpie` or `curl` if you prefer

- save the API base endpoint to an env variable

 `# export FLYPTOX_API=localhost:9999/api`

## Authentication
### Signup
This method is used for registering a new user account in the exchange.

 request

| verb      | URL | request body| query |
|-----------|-----|--------------|--------------|
| POST | /api/auth/signup| `{ "email": "test@gmail.com", "password": "123" }`| n/a |

 response

| Status Code      | response body | details |
|------------------|---------------|--------------|
| 200              | `{"token":"120938sd......"}` | signup was successful, and an authentication token is returned |
| 400              | {"message":"error message..."} | missing email and password |
| 403             | {"message":"error message..."} | error creating account |
| 500             | {"message":"error message..."} | internal server error |


 Example:

 `# http POST $FLYPTOX_API/auth/signup email=test@gmail.com password=123 --json`

On success

```
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 144
Content-Type: application/json; charset=utf-8
Date: Mon, 20 Jul 2015 22:40:32 GMT
X-Powered-By: Express

{
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.IjdlYTJhMTAyLWM5Y2YtNDE1OC05YWE1LTg3MTllMGNjNGVmYSI.Zt7kf-mf5k-PccYCFz2cywj_sKWfXSYGyqBr0brS-Rc"
}
 ```
On error
```
HTTP/1.1 403 Forbidden
Connection: keep-alive
Content-Length: 33
Content-Type: application/json; charset=utf-8
Date: Mon, 20 Jul 2015 22:59:45 GMT
X-Powered-By: Express

{
    "message": "error creating account"
}
```

### Sign-in
This method is to signin to the exchange with an existing account.

 request

| verb      | URL | request body| query |
|-----------|-----|--------------|--------------|
| POST | /api/auth/signin| `{ "email": "test@gmail.com", "password": "123" }`| n/a |

 response

| Status Code      | response body | details |
|------------------|---------------|--------------|
| 200              | `{"token":"120938sd......"}` | signin was successful, and an authentication token is returned |
| 400              | {"message":"error message..."} | missing email and password |
| 401             | {"message":"error message..."} | authentication failed |
| 500             | {"message":"error message..."} | internal server error |


 Example:

 `# http POST $FLYPTOX_API/auth/signin email=test@gmail.com password=123 --json`

On success

```
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 144
Content-Type: application/json; charset=utf-8
Date: Mon, 20 Jul 2015 22:40:32 GMT
X-Powered-By: Express

{
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.IjdlYTJhMTAyLWM5Y2YtNDE1OC05YWE1LTg3MTllMGNjNGVmYSI.Zt7kf-mf5k-PccYCFz2cywj_sKWfXSYGyqBr0brS-Rc"
}
 ```
On error
```
HTTP/1.1 401 Forbidden
Connection: keep-alive
Content-Length: 33
Content-Type: application/json; charset=utf-8
Date: Mon, 20 Jul 2015 22:59:45 GMT
X-Powered-By: Express

{
    "message": "invalid email and password"
}
```

### User Profile Information
This method is for retrieving an authenticated user's personal information.

 request

| verb      | URL | required HTTP Header | details |
|-----------|-----|----------------------|---------|
| GET | /api/auth/whoami| x-access-token | token provided at sign-in |

 response

| Status Code      | response body | details |
|------------------|---------------|--------------|
| 200              | `{"email":"test@gmail.com", ...}` | contains profile information |
| 401             | {"message":"error message..."} | access denied |
| 500             | {"message":"error message..."} | internal server error |


 Example:

`# export $TOKEN="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1......."`

 `# http GET $FLYPTOX_API/auth/whoami email=test@gmail.com password=123 x-access-token:$TOKEN`

On success

```
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 43
Content-Type: application/json; charset=utf-8
Date: Tue, 21 Jul 2015 02:26:10 GMT
ETag: W/"2b-1380469457"
X-Powered-By: Express

{
    "email": "test@gmail.com",
    "fullname": null
}
 ```

If no valid token is provided.

```
HTTP/1.1 401 Unauthorized
Connection: keep-alive
Content-Length: 29
Content-Type: application/json; charset=utf-8
Date: Tue, 21 Jul 2015 02:26:50 GMT
ETag: W/"1d-2987808927"
X-Powered-By: Express

{
    "message": "malformed token"
}
```

If no token is included in the http headers, a 401 status code is returned with a message: "missing token"

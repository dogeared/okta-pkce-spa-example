## SPA + Okta = Authorization Code with PKCE Flow

This is example is a pure SPA app that uses the OAuth 2.0 [Authorization Code with PKCE]() flow.

You need to configure your Okta org for this to work.

### Okta Config

Setup a trusted origin so the javascript can fetch the `well-known` configuration endpoint.

1. Login to your admin console
2. Browse to: **Security -> API**
3. Click: **Trusted Origins**
4. Click: **Add Origin**
5. Set:
    1. **Name**
    2. **Origin URL** to: `http://localhost:8000`
    3. Click: **CORS** checkbox
    4. Click **Save**

Setup a SPA app that supports the Authroization Code flow

1. Login to your admin console
2. Browse to: **Applications**
3. Click: **Add Application**
4. Click: **Create New App**
5. Select: **Single Page App (SPA)**
6. Click: **Create**
7. Set:
    1. **Name**
    2. **Login redirect URIs** to: `http://localhost:8000/redirect.html`
    3. Click: **Save**
8. Capture the **Client ID** 
9. Click: **Assignments**
10. Click: **Assign** -> **Assign to Groups**
11. Click: **Assign** to the right of `Everyone`
12. Click: **Done**

### App Config

Update the [index.ts](index.ts) file with your Okta org settings:

1. Set `openIdConnectUrl` to your base okta org url, like: `https://dev-micah.okta.com`
2. Set `clientId` to the value you captured above.

### App Build

1. Run: `npm run-script compile` to build the SPA app.

### App Run

1. Run: `npm run-script app` to run the SPA app.

You should now be able to browse to: [http://localhost:8000](http://localhost:8000)


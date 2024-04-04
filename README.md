# expo-msal

Native MSAL auth for ios and android. This was made for one of my projects. As such the not all methods of MSAL are implimented (less than a quarter of them). Furthermore the way they are implimented are for a very specific use case and use a single account. If you need more functionality I would be happy to accept the pull request. Finally, this library uses MSAL for react, ios and android.

# Installation in managed Expo projects

For [managed](https://docs.expo.dev/archive/managed-vs-bare/) Expo projects, please follow the installation instructions in the [API documentation for the latest stable release](#api-documentation). If you follow the link and there is no documentation available then this library is not yet usable within managed projects &mdash; it is likely to be included in an upcoming Expo SDK release.

# Installation in bare React Native projects

For bare React Native projects, you must ensure that you have [installed and configured the `expo` package](https://docs.expo.dev/bare/installing-expo-modules/) before continuing.

> [!NOTE]
> Make sure to configure Azure redirects

### Add the package to your npm dependencies

```
npm install expo-msal
```

### Configure ClientId and tenantId in env
add EXPO_PUBLIC_CLIENTID this is needed for web implimentation. The clientId is what is passed to the public client application


# Reference
## useMsal
This is the main comonent to access the api. See example on how it is used.
Three methods
1. acquireTokenInteractively
On web this redirects the user returns nothing. Prompts user and then returns access token.
2. acquireTokenSilently 
On web this handles the redrect on native retrieves from store (managed by the native msal sdk). Returns a string which is either the api token or "Error".
3. signOut
Signs the user out. Returns a boolean on the result.
## ExpoMsalProvider
The provider does nothing on native and returns the child, if a web implamentation doesn't exist there is no need for it.
On it web starts a public client application and intilizes it. This provider needs to be in a root component (that doesn't get unmounted). Furthermore the useMsal hook can't be used in the component the provider is in or any of that components parents.

# Contributing

Contributions are very welcome! Make a pull request or an issue.

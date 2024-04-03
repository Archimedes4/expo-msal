import { IPublicClientApplication, InteractionStatus } from "@azure/msal-browser";
import { ExpoMsalConfig } from "./ExpoMsal.types";

export default {
  async acquireTokenInteractively(config: ExpoMsalConfig, instance: IPublicClientApplication, inProgress: InteractionStatus): Promise<undefined> {
    if (inProgress !== InteractionStatus.None) {
      return
    }
    instance.loginRedirect({
      scopes: config.scopes,
      redirectUri: `${window.location.protocol}//${window.location.host}/`,
    });
  },
  async acquireTokenSilently(config: ExpoMsalConfig, instance: IPublicClientApplication, inProgress: InteractionStatus): Promise<string> {
    // handle auth redired/do all initial setup for msal
    const redirectResult = await instance.handleRedirectPromise();
    if (
      redirectResult !== null &&
      inProgress === InteractionStatus.HandleRedirect &&
      redirectResult.account !== null
    ) {
      instance.setActiveAccount(redirectResult.account);
      return redirectResult.accessToken
    }
    if (inProgress !== InteractionStatus.None) {
      return "Error"
    }
    // checking if an account exists
    const accounts = instance.getAllAccounts();
    if (accounts.length > 0) {
      // getting the first account
      instance.setActiveAccount(accounts[0]);
      const accountResult = await instance.getActiveAccount();
      if (accountResult !== null) {
        const result = await instance.acquireTokenSilent({
          scopes: config.scopes,
        });
        return result.accessToken
      }
    }
    return "Error"
  },
  async signOut(instance: IPublicClientApplication, inProgress: InteractionStatus): Promise<boolean> {
    if (inProgress !== InteractionStatus.None) {
      return false
    }
    const account = instance.getActiveAccount();
    instance.logoutPopup({
      account,
    });
    return true
  }
};

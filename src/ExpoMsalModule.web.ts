import { IPublicClientApplication, InteractionStatus } from "@azure/msal-browser";
import { ExpoMsalConfig, ResultState, TokenResult } from "./ExpoMsal.types";

export default {
  async acquireTokenInteractively(config: ExpoMsalConfig, instance: IPublicClientApplication, inProgress: InteractionStatus): Promise<undefined> {
    if (inProgress !== InteractionStatus.None) {
      return
    }
    instance.loginRedirect({
      scopes: config.scopes,
      redirectStartPage: config.redirectUri,
    });
    return
  },
  async acquireTokenSilently(config: ExpoMsalConfig, instance: IPublicClientApplication, inProgress: InteractionStatus): Promise<TokenResult> {
    // handle auth redired/do all initial setup for msal
    const redirectResult = await instance.handleRedirectPromise();
    if (
      redirectResult !== null &&
      inProgress === InteractionStatus.HandleRedirect &&
      redirectResult.account !== null
    ) {
      instance.setActiveAccount(redirectResult.account);
      return {
        result: ResultState.success,
        data: redirectResult.accessToken
      }
    }
    if (inProgress !== InteractionStatus.None && inProgress !== InteractionStatus.Startup) {
      return {
        result: ResultState.error,
        data: "Interaction state not ready"
      }
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
        return {
          result: ResultState.success,
          data: result.accessToken
        }
      }
    }
    return {
      result: ResultState.error,
      data: "No Token Has been found"
    }
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

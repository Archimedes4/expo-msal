// Import the native module. On web, it will be resolved to ExpoMsal.web.ts
// and on native platforms to ExpoMsal.ts
import { useMsal } from '@azure/msal-react';
import { ExpoFunctionConfig, ExpoMsalConfig, TokenResult } from './ExpoMsal.types';
import ExpoMsalModule from './ExpoMsalModule';

export function useMSAL(config: ExpoMsalConfig): {
  acquireTokenSilently: (functionConfig?: ExpoFunctionConfig) => Promise<TokenResult>,
  acquireTokenInteractively: (functionConfig?: ExpoFunctionConfig) => Promise<TokenResult | undefined>,
  signOut: (functionConfig?: ExpoFunctionConfig) => Promise<boolean> 
} {
  const { instance, inProgress } = useMsal();
  async function acquireTokenSilently(functionConfig?: ExpoFunctionConfig) {
    return await ExpoMsalModule.acquireTokenSilently({
      clientId: config.clientId,
      scopes: functionConfig ? functionConfig.scopes:config.scopes,
      authority: config.authority,
      redirectUri: config.redirectUri
     } satisfies ExpoMsalConfig, instance, inProgress)
  }
  async function acquireTokenInteractively(functionConfig?: ExpoFunctionConfig) {
    return await ExpoMsalModule.acquireTokenInteractively({
     clientId: config.clientId,
     scopes: functionConfig ? functionConfig.scopes:config.scopes,
     authority: config.authority,
     redirectUri: config.redirectUri
    } satisfies ExpoMsalConfig, instance, inProgress)
  }
  async function signOut(functionConfig?: ExpoFunctionConfig) {
    return await ExpoMsalModule.signOut(instance, inProgress)
  }
  return {
    acquireTokenInteractively,
    acquireTokenSilently,
    signOut
  }
}
// Import the native module. On web, it will be resolved to ExpoMsal.web.ts
// and on native platforms to ExpoMsal.ts
import { ExpoFunctionConfig, ExpoMsalConfig, TokenResult } from './ExpoMsal.types';
import ExpoMsalModule from './ExpoMsalModule';

export function useMSAL(config: ExpoMsalConfig): {
  acquireTokenSilently: (functionConfig?: ExpoFunctionConfig) => Promise<TokenResult>,
  acquireTokenInteractively: (functionConfig?: ExpoFunctionConfig) => Promise<TokenResult | undefined>,
  signOut: (functionConfig?: ExpoFunctionConfig) => Promise<boolean> 
} {
  async function acquireTokenSilently(functionConfig?: ExpoFunctionConfig) {
    return await ExpoMsalModule.acquireTokenSilently({
      clientId: config.clientId,
      scopes: functionConfig ? functionConfig.scopes:config.scopes,
      authority: config.authority,
      redirectUri: config.redirectUri
     } satisfies ExpoMsalConfig)
  }
  async function acquireTokenInteractively(functionConfig?: ExpoFunctionConfig) {
    return await ExpoMsalModule.acquireTokenInteractively({
      clientId: config.clientId,
      scopes: functionConfig ? functionConfig.scopes:config.scopes,
      authority: config.authority,
      redirectUri: config.redirectUri
     } satisfies ExpoMsalConfig)
  }
  async function signOut(functionConfig?: ExpoFunctionConfig) {
    return await ExpoMsalModule.signOut({
      clientId: config.clientId,
      scopes: functionConfig ? functionConfig.scopes:config.scopes,
      authority: config.authority,
      redirectUri: config.redirectUri
     } satisfies ExpoMsalConfig)
  }
  return {
    acquireTokenInteractively,
    acquireTokenSilently,
    signOut
  }
}
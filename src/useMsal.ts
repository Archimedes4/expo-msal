// Import the native module. On web, it will be resolved to ExpoMsal.web.ts
// and on native platforms to ExpoMsal.ts
import { ExpoMsalConfig, TokenResult } from './ExpoMsal.types';
import ExpoMsalModule from './ExpoMsalModule';

export function useMSAL(config: ExpoMsalConfig): {
  acquireTokenSilently: () => Promise<TokenResult>,
  acquireTokenInteractively: () => Promise<TokenResult>,
  signOut: () => Promise<boolean> 
} {
  async function acquireTokenSilently() {
    return await ExpoMsalModule.acquireTokenSilently(config)
  }
  async function acquireTokenInteractively() {
    return await ExpoMsalModule.acquireTokenInteractively(config)
  }
  async function signOut() {
    return await ExpoMsalModule.signOut(config)
  }
  return {
    acquireTokenInteractively,
    acquireTokenSilently,
    signOut
  }
}
// Import the native module. On web, it will be resolved to ExpoMsal.web.ts
// and on native platforms to ExpoMsal.ts
import { useMsal } from '@azure/msal-react';
import { ExpoMsalConfig } from './ExpoMsal.types';
import ExpoMsalModule from './ExpoMsalModule';

export function useMSAL(config: ExpoMsalConfig): {
  acquireTokenSilently: () => Promise<string>,
  acquireTokenInteractively: () => Promise<string>,
  signOut: () => Promise<boolean> 
} {
  const { instance, inProgress } = useMsal();
  async function acquireTokenSilently() {
    return await ExpoMsalModule.acquireTokenSilently(config, instance, inProgress)
  }
  async function acquireTokenInteractively() {
    return await ExpoMsalModule.acquireTokenInteractively(config, instance, inProgress)
  }
  async function signOut() {
    return await ExpoMsalModule.signOut(instance, inProgress)
  }
  return {
    acquireTokenInteractively,
    acquireTokenSilently,
    signOut
  }
}
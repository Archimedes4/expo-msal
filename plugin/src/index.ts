// Taken from https://github.com/stashenergy/react-native-msal/tree/master/plugin
import { ConfigPlugin, withPlugins } from '@expo/config-plugins';

import { withIosMSAL } from './withiOSMSAL';
import { withAndroidMSAL } from './withAndroidMSAL';

const withReactNativeMSAL: ConfigPlugin<{ androidPackageSignatureHash: string, clientId: string, tenantId: string }> = (
  config,
  { androidPackageSignatureHash }
) => {
  return withPlugins(config, [[withAndroidMSAL, androidPackageSignatureHash], withIosMSAL]);
};

export default withReactNativeMSAL;
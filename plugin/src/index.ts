// Taken from https://github.com/stashenergy/react-native-msal/tree/master/plugin
import { ConfigPlugin, withPlugins } from '@expo/config-plugins';

import { withAndroidMSAL } from './withAndroidMSAL';
import { withIosMSAL } from './withiOSMSAL';

const withReactNativeMSAL: ConfigPlugin<{ androidPackageSignatureHash: string }> = (
  config,
  { androidPackageSignatureHash }
) => {
  return withPlugins(config, [[withAndroidMSAL, androidPackageSignatureHash], withIosMSAL]);
};

export default withReactNativeMSAL;
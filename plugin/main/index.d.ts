import { ConfigPlugin } from '@expo/config-plugins';
declare const withReactNativeMSAL: ConfigPlugin<{
    androidPackageSignatureHash: string;
    clientId: string;
    tenantId: string;
}>;
export default withReactNativeMSAL;

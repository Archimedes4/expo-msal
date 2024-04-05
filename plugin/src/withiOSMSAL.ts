
import { ConfigPlugin, withInfoPlist, withEntitlementsPlist, withPlugins} from '@expo/config-plugins';

const withIosUrlScheme: ConfigPlugin = (config) => {
  if (!config.ios?.bundleIdentifier) {
    throw new Error('ios.bundleIdentifier is required in your expo config');
  }

  const QUERY_SCHEMES = ['msauthv2', 'msauthv3'];
  const URL_SCHEME = { CFBundleURLSchemes: [`msauth.${config.ios.bundleIdentifier}`] };

  return withInfoPlist(config, (mod) => {
    mod.modResults.CFBundleURLTypes = [URL_SCHEME, ...(mod.modResults.CFBundleURLTypes || [])];
    mod.modResults.LSApplicationQueriesSchemes = [
      ...new Set((mod.modResults.LSApplicationQueriesSchemes ?? []).concat(QUERY_SCHEMES)),
    ];
    return mod;
  });
};

const withIosKeychainGroup: ConfigPlugin = (config) => {
  const KEYCHAIN_GROUP = '$(AppIdentifierPrefix)com.microsoft.adalcache';

  return withEntitlementsPlist(config, (mod) => {
    const existingAccessGroups = (mod.modResults['keychain-access-groups'] || []) as string[];
    mod.modResults['keychain-access-groups'] = [...new Set(existingAccessGroups.concat(KEYCHAIN_GROUP))];
    return mod;
  });
};

export const withIosMSAL: ConfigPlugin = (config) => {
  return withPlugins(config, [withIosUrlScheme, withIosKeychainGroup]);
};
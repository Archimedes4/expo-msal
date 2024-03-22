"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withIosMSAL = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const withIosUrlScheme = (config) => {
    if (!config.ios?.bundleIdentifier) {
        throw new Error('ios.bundleIdentifier is required in your expo config');
    }
    const QUERY_SCHEMES = ['msauthv2', 'msauthv3'];
    const URL_SCHEME = { CFBundleURLSchemes: [`msauth.${config.ios.bundleIdentifier}`] };
    return (0, config_plugins_1.withInfoPlist)(config, (mod) => {
        mod.modResults.CFBundleURLTypes = [URL_SCHEME, ...(mod.modResults.CFBundleURLTypes || [])];
        mod.modResults.LSApplicationQueriesSchemes = [
            ...new Set((mod.modResults.LSApplicationQueriesSchemes ?? []).concat(QUERY_SCHEMES)),
        ];
        return mod;
    });
};
const withIosKeychainGroup = (config) => {
    const KEYCHAIN_GROUP = '$(AppIdentifierPrefix)com.microsoft.adalcache';
    return (0, config_plugins_1.withEntitlementsPlist)(config, (mod) => {
        const existingAccessGroups = (mod.modResults['keychain-access-groups'] || []);
        mod.modResults['keychain-access-groups'] = [...new Set(existingAccessGroups.concat(KEYCHAIN_GROUP))];
        return mod;
    });
};
const withIosMSAL = (config) => {
    return (0, config_plugins_1.withPlugins)(config, [withIosUrlScheme, withIosKeychainGroup]);
};
exports.withIosMSAL = withIosMSAL;

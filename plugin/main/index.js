"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Taken from https://github.com/stashenergy/react-native-msal/tree/master/plugin
const config_plugins_1 = require("@expo/config-plugins");
const withiOSMSAL_1 = require("./withiOSMSAL");
const withAndroidMSAL_1 = require("./withAndroidMSAL");
const withReactNativeMSAL = (config, { androidPackageSignatureHash }) => {
    return (0, config_plugins_1.withPlugins)(config, [[withAndroidMSAL_1.withAndroidMSAL, androidPackageSignatureHash], withiOSMSAL_1.withIosMSAL]);
};
exports.default = withReactNativeMSAL;

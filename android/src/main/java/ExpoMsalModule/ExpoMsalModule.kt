package expo.modules.msal

import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class ExpoMsalModule: Module() {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('<%- project.name %>')` in JavaScript.
    Name("ExpoMsal")

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("acquireTokenInteractively") { config: MSALConfig, promise: Promise ->
      promise.resolve("Thing")
    }
    AsyncFunction("acquireTokenSilently") { config: MSALConfig, promise: Promise ->
      promise.resolve("Thing")
    }
    AsyncFunction("signOut") { config: MSALConfig, promise: Promise ->
      promise.resolve("Thing")
    }
  }
  suspend fun loadApplication() {
    PublicClientApplication.createSingleAccountPublicClientApplication(
      appContext.activityProvider?.currentActivity?.window?.context,
      R.raw.auth_config_single_account,
      object : ISingleAccountApplicationCreatedListener {
        override fun onCreated(application: ISingleAccountPublicClientApplication) {
          /*
               * This test app assumes that the app is only going to support one account.
               * This requires "account_mode" : "SINGLE" in the config json file.
               */
          mSingleAccountApp = application
          loadAccount()
        }

        override fun onError(exception: MsalException) {
          displayError(exception)
        }
      })
  }
}

class MSALConfig: Record {
  @Field
  var clientId: String = ""
  @Field
  var scopes: Array<String> = arrayOf()
  @Field
  var authority: String = ""
  @Field
  var redirectUri: String = ""
}

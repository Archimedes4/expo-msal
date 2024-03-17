
package expo.modules.expomsal

import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class ExpoMsal: Module() {
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

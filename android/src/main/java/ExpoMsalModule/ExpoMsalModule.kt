package expo.modules.msal

import android.util.Log
import com.microsoft.identity.client.IPublicClientApplication
import com.microsoft.identity.client.ISingleAccountPublicClientApplication
import com.microsoft.identity.client.PublicClientApplication
import com.microsoft.identity.client.exception.MsalException
import expo.modules.kotlin.Promise
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import kotlinx.coroutines.suspendCancellableCoroutine
import org.json.JSONObject
import java.io.File
import java.io.FileWriter
import kotlin.coroutines.resume


class ExpoMsalModule: Module() {
  private var mSingleAccountApp: ISingleAccountPublicClientApplication? = null
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
    AsyncFunction("acquireTokenInteractively") Coroutine { config: MSALConfig, promise: Promise ->
      val application: ISingleAccountPublicClientApplication = loadApplication(config) ?:run {
        promise.resolve("No Public Client Application")
        return@Coroutine
      }

      promise.resolve("This thing does have an application" + application.currentAccount.currentAccount.authority)
    }
    AsyncFunction("acquireTokenSilently") Coroutine { config: MSALConfig, promise: Promise ->
      promise.resolve("Thing")
    }
    AsyncFunction("signOut") Coroutine { config: MSALConfig, promise: Promise ->
      promise.resolve("Thing")
    }
  }
  suspend fun loadApplication(config: MSALConfig): ISingleAccountPublicClientApplication? = suspendCancellableCoroutine {  continuation ->
    if (mSingleAccountApp != null) {
      continuation.resume(mSingleAccountApp)
      return@suspendCancellableCoroutine
    }
    val context = appContext.activityProvider?.currentActivity?.window?.context
    if (context == null) {
      continuation.resume(null)
      return@suspendCancellableCoroutine
    }
    try {
      val msalConfigJsonObj: JSONObject = JSONObject()

      // Account mode. Required to be SINGLE for this library
      msalConfigJsonObj.put("account_mode", "SINGLE")

      // Authority
      msalConfigJsonObj.put("authority", config.authority)

      // Client id
      msalConfigJsonObj.put("client_id", config.clientId)

      // Redirect URI
      msalConfigJsonObj.put(
        "redirect_uri",
        config.redirectUri
      )


      val audience: JSONObject = JSONObject()
      audience.put("type", "AzureADMultipleOrgs")
      val authority: JSONObject = JSONObject()
      authority.put("type","AAD")
      authority.put("audience", audience)
      val authoritiesJsonArr: Array<JSONObject> = arrayOf(authority)
      msalConfigJsonObj.put("authorities", authoritiesJsonArr)


      // Serialize the JSON config to a string
      val serializedMsalConfig: String = msalConfigJsonObj.toString()

      // Create a temporary file and write the serialized config to it
      val file = File.createTempFile("RNMSAL_msal_config", ".tmp")
      file.deleteOnExit()
      val writer = FileWriter(file)
      writer.write(serializedMsalConfig)
      writer.close()
      PublicClientApplication.createSingleAccountPublicClientApplication(
        context,
        file,
        object : IPublicClientApplication.ISingleAccountApplicationCreatedListener {
          override fun onCreated(application: ISingleAccountPublicClientApplication) {
            continuation.resume(application)
          }

          override fun onError(exception: MsalException) {
            continuation.resume(null)
          }
        })
    } catch (error: Error) {
      continuation.resume(null)
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

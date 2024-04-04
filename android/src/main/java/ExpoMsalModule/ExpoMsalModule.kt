package expo.modules.msal

import android.app.Activity
import com.microsoft.identity.client.AcquireTokenSilentParameters
import com.microsoft.identity.client.AuthenticationCallback
import com.microsoft.identity.client.IAccount
import com.microsoft.identity.client.IAuthenticationResult
import com.microsoft.identity.client.IPublicClientApplication
import com.microsoft.identity.client.ISingleAccountPublicClientApplication
import com.microsoft.identity.client.PublicClientApplication
import com.microsoft.identity.client.SignInParameters
import com.microsoft.identity.client.SilentAuthenticationCallback
import com.microsoft.identity.client.exception.MsalException
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import kotlinx.coroutines.suspendCancellableCoroutine
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.io.FileWriter
import java.util.Arrays
import kotlin.coroutines.resume


class ExpoMsalModule: Module() {
  private var mSingleAccountApp: ISingleAccountPublicClientApplication? = null
  private var mAccount: IAccount? = null
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
    AsyncFunction("acquireTokenInteractively") Coroutine { config: MSALConfig ->
      val application: ISingleAccountPublicClientApplication = loadApplication(config) ?: run {
        return@Coroutine TokenResult(result = 1, data = "No Public Client Application")
      }
      val activity: Activity = appContext.activityProvider?.currentActivity ?: run {
        return@Coroutine TokenResult(result = 1, data = "No Actitivty")
      }

      return@Coroutine getTokenInteractively(config, activity, application)
    }
    AsyncFunction("acquireTokenSilently") Coroutine { config: MSALConfig ->
      val application: ISingleAccountPublicClientApplication = loadApplication(config) ?: run {
        return@Coroutine TokenResult(result = 1, data = "No Public Client Application")
      }
      val account: IAccount = loadAccount(application) ?: run {
        return@Coroutine TokenResult(result = 1, data = "No Account")
      }

      return@Coroutine getTokenSilently(config, application, account)
    }
    AsyncFunction("signOut") Coroutine { config: MSALConfig ->
      val application: ISingleAccountPublicClientApplication = loadApplication(config) ?: run {
        return@Coroutine false
      }
      return@Coroutine signOut(application)
    }
  }
  private suspend fun getTokenInteractively(config: MSALConfig, activity: Activity, application: ISingleAccountPublicClientApplication): TokenResult = suspendCancellableCoroutine { continuation ->
    val signInParameters: SignInParameters = SignInParameters.builder()
      .withActivity(activity)
      .withLoginHint(null)
      .withScopes(Arrays.asList(*config.scopes))
      .withCallback(object : AuthenticationCallback {
        override fun onSuccess(authenticationResult: IAuthenticationResult) {
          /* Successfully got a token, use it to call a protected resource - MSGraph */
          continuation.resume(TokenResult(result = 0, data = authenticationResult.accessToken))
        }

        override fun onError(exception: MsalException) {
          continuation.resume(TokenResult(result = 1, data = (exception.localizedMessage ?: "Something went wrong!")))
        }

        override fun onCancel() {
          continuation.resume(TokenResult(result = 1, data = "Canceled"))
        }
      })
      .build()
    application.signIn(signInParameters)
  }
  private suspend fun loadAccount(application: ISingleAccountPublicClientApplication): IAccount? = suspendCancellableCoroutine { continuation ->
    if (mAccount !== null) {
      continuation.resume(mAccount)
      return@suspendCancellableCoroutine
    }
    application.getCurrentAccountAsync(object :
      ISingleAccountPublicClientApplication.CurrentAccountCallback {
        override fun onAccountLoaded(activeAccount: IAccount?) {
          // You can use the account data to update your UI or your app database.
          mAccount = activeAccount
          continuation.resume(activeAccount)
        }

        override fun onAccountChanged(priorAccount: IAccount?, currentAccount: IAccount?) {
          if (currentAccount == null) {
            // Perform a cleanup task as the signed-in account changed.
            mAccount = null
          }
        }

        override fun onError(exception: MsalException) {
          continuation.resume(null)
        }
    })
  }
  private suspend fun getTokenSilently(config: MSALConfig, application: ISingleAccountPublicClientApplication, account: IAccount): TokenResult = suspendCancellableCoroutine { continuation ->
    val silentParameters = AcquireTokenSilentParameters.Builder()
      .fromAuthority(account.authority)
      .forAccount(account)
      .withScopes(listOf(*config.scopes))
      .withCallback(object : SilentAuthenticationCallback {
        override fun onSuccess(authenticationResult: IAuthenticationResult) {
          continuation.resume(TokenResult(result = 0, data = authenticationResult.accessToken))
        }

        override fun onError(exception: MsalException) {
          continuation.resume(TokenResult(result = 1, data = (exception.localizedMessage ?: "Something went wrong!")))
        }
      })
      .build()
    application.acquireTokenSilentAsync(silentParameters)
  }
  private suspend fun loadApplication(config: MSALConfig): ISingleAccountPublicClientApplication? = suspendCancellableCoroutine { continuation ->
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

      msalConfigJsonObj.put("authorization_user_agent", "WEBVIEW")


      val audience: JSONObject = JSONObject()
      audience.put("type", "AzureADMultipleOrgs")
      val authority: JSONObject = JSONObject()
      authority.put("type","AAD")
      authority.put("audience", audience)
      val authoritiesJsonArr: JSONArray = JSONArray(arrayOf(authority).asList())
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
  private suspend fun signOut(application: ISingleAccountPublicClientApplication): Boolean = suspendCancellableCoroutine { continuation ->
    application.signOut(object : ISingleAccountPublicClientApplication.SignOutCallback {
      override fun onSignOut() {
        mAccount = null
        continuation.resume(true)
      }

      override fun onError(exception: MsalException) {
        continuation.resume(false)
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

// 0 success 1 error
class TokenResult(
  @Field var result: Int = 1,
  @Field var data: String = ""
): Record
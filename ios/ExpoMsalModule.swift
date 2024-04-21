import ExpoModulesCore
import MSAL

public class ExpoMsalModule: Module {
    var applicationContext : MSALPublicClientApplication?
    var account : MSALAccount?
    // Each module class must implement the definition function. The definition consists of components
    // that describes the module's functionality and behavior.
    // See https://docs.expo.dev/modules/module-api for more details about available components.
    public func definition() -> ModuleDefinition {
        // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
        // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
        // The module will be accessible from `requireNativeModule('<%- project.name %>')` in JavaScript.
        var active = false
        Name("ExpoMsal")
        
        // Defines a JavaScript function that always returns a Promise and whose native code
        // is by default dispatched on the different thread than the JavaScript runtime runs on.
        AsyncFunction("acquireTokenInteractively") { (config: MSALConfig, promise: Promise) in
            if (active == true) {
                promise.resolve(TokenResult(result: ResultState.error.rawValue, data: "Active"))
            }
            
            active = true
            
            if (applicationContext === nil) {
                let result = loadApplication(config: config)
                if (result != "Okay") {
                    promise.resolve(TokenResult(result: ResultState.error.rawValue, data: result))
                    active = false
                    return
                }
            }
            guard let applicationContext = self.applicationContext else {
                promise.resolve(TokenResult(result: ResultState.error.rawValue, data: "No Application"))
                active = false
                return
            }
            let keyWindow = UIApplication.shared.windows.filter {$0.isKeyWindow}.first
            
            if var topController = keyWindow?.rootViewController {
                while let presentedViewController = topController.presentedViewController {
                    topController = presentedViewController
                }
                let webViewParamaters = MSALWebviewParameters(authPresentationViewController: topController)
                let parameters = MSALInteractiveTokenParameters(scopes: config.scopes, webviewParameters: webViewParamaters)
                parameters.promptType = .selectAccount
                
                applicationContext.acquireToken(with: parameters) { (result, error) in
                    guard let result = result else {
                        guard let error = error else {
                            promise.resolve(TokenResult(result: ResultState.error.rawValue, data: "Something went wrong, no error produced."))
                            active = false
                            return
                        }
                        promise.resolve(TokenResult(result: ResultState.error.rawValue, data: error.localizedDescription))
                        active = false
                        return
                    }
                    
                    promise.resolve(TokenResult(result: ResultState.success.rawValue, data: result.accessToken))
                    active = false
                }
            } else {
                promise.resolve(TokenResult(result: ResultState.error.rawValue, data: "Could not find root view controller"))
                active = false
            }
        }.runOnQueue(.main)
        AsyncFunction("acquireTokenSilently") { (config: MSALConfig, promise: Promise) in
            if (active == true) {
                promise.resolve(TokenResult(result: ResultState.error.rawValue, data: "Active"))
            }
            
            active = true
            
            if (applicationContext === nil) {
                let result = loadApplication(config: config)
                if (result != "Okay") {
                    promise.resolve(TokenResult(result: ResultState.error.rawValue, data: result))
                    active = false
                    return
                }
            }
            guard let applicationContext = self.applicationContext else {
                promise.resolve(TokenResult(result: ResultState.error.rawValue, data: "No Application"))
                active = false
                return
            }
            let msalParameters = MSALParameters()
            msalParameters.completionBlockQueue = DispatchQueue.main
            getAccount() { currentAccount in
                if let currentAccount = currentAccount {
                    let parameters = MSALSilentTokenParameters(scopes: config.scopes, account: currentAccount)
                    applicationContext.acquireTokenSilent(with: parameters) { (result, error) in
                        guard let result = result else {
                            active = false
                            promise.resolve(TokenResult(result: ResultState.error.rawValue, data: "Something went wrong"))
                            return
                        }
                        active = false
                        promise.resolve(TokenResult(result: ResultState.success.rawValue, data: result.accessToken))
                        return
                    }
                } else {
                    active = false
                    promise.resolve(TokenResult(result: ResultState.error.rawValue, data: "No Token Has been found"))
                }
            }
        }.runOnQueue(.main)
        AsyncFunction("signOut") { (config: MSALConfig, promise: Promise) in
            if (active == true) {
                promise.resolve(TokenResult(result: ResultState.error.rawValue, data: "Active"))
                return
            }
            
            active = true
            
            if (applicationContext === nil) {
                let result = loadApplication(config: config)
                if (result != "Okay") {
                    active = false
                    promise.resolve(TokenResult(result: ResultState.error.rawValue, data: result))
                    return
                }
            }
            guard let applicationContext = self.applicationContext else {
                active = false
                promise.resolve(false);
                return
            }
            let keyWindow = UIApplication.shared.windows.filter {$0.isKeyWindow}.first
            
            if var topController = keyWindow?.rootViewController {
                while let presentedViewController = topController.presentedViewController {
                    topController = presentedViewController
                }
                let msalParameters = MSALParameters()
                msalParameters.completionBlockQueue = DispatchQueue.main
                getAccount() { currentAccount in
                    if let currentAccount = currentAccount {
                        let parameters = MSALSilentTokenParameters(scopes: config.scopes, account: currentAccount)
                        let webViewParamaters = MSALWebviewParameters(authPresentationViewController: topController)
                        let signOutParams = MSALSignoutParameters(webviewParameters: webViewParamaters)
                        applicationContext.signout(with: currentAccount, signoutParameters: signOutParams) {result,_ in
                            active = false
                            promise.resolve(result)
                            return
                        }
                    } else {
                        active = false
                        promise.resolve(false)
                    }
                }
            } else {
                active = false
                promise.resolve(false)
            }
        }.runOnQueue(.main)
    }
    
    func loadApplication(config: MSALConfig) -> String {
        do {
            guard let authorityURL = URL(string: config.authority) else {
                  return "Invalid Authority"
            }
            let authority = try MSALAADAuthority(url: authorityURL)
                    
            let msalConfiguration = MSALPublicClientApplicationConfig(clientId: config.clientId, redirectUri: config.redirectUri, authority: authority)
            self.applicationContext = try MSALPublicClientApplication(configuration: msalConfiguration)
            return "Okay"
        } catch {
            return error.localizedDescription
        }
    }
    func getAccount(completion: @escaping (MSALAccount?) -> Void) {
        if (self.account != nil) {
            completion(self.account)
            return
        }
        guard let applicationContext = self.applicationContext else {
            completion(nil)
            return
        }
        let msalParameters = MSALParameters()
        msalParameters.completionBlockQueue = DispatchQueue.main
        var completed = false
        applicationContext.getCurrentAccount(with: msalParameters, completionBlock: { (currentAccount, previousAccount, error) in
            self.account = currentAccount
            if (!completed) {
                completion(currentAccount)
                completed = true
            }
        })
    }
}

struct MSALConfig: Record {
    @Field
    var clientId: String = "";
    @Field
    var scopes: [String] = [];
    @Field
    var authority: String = "";
    @Field
    var redirectUri: String = "";
}

enum ResultState: Int, Enumerable {
    case success = 0
    case error = 1
}

struct TokenResult: Record {
    @Field
    var result: Int = 1;
    @Field
    var data: String = "";
}

public class ExpoMsalBroker: ExpoAppDelegateSubscriber {
  public func applicationDidBecomeActive(_ application: UIApplication) {
    // The app has become active.
  }

  public func applicationWillResignActive(_ application: UIApplication) {
    // The app is about to become inactive.
  }

  public func applicationDidEnterBackground(_ application: UIApplication) {
    // The app is now in the background.
  }

  public func applicationWillEnterForeground(_ application: UIApplication) {
    // The app is about to enter the foreground.
  }

  public func applicationWillTerminate(_ application: UIApplication) {
    // The app is about to terminate.
  }
    public func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
      return MSALPublicClientApplication.handleMSALResponse(url, sourceApplication: options[UIApplication.OpenURLOptionsKey.sourceApplication] as? String)
    }
}

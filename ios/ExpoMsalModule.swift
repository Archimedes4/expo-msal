import ExpoModulesCore
import MSAL

public class ExpoMsalModule: Module {
    var applicationContext : MSALPublicClientApplication?
    // Each module class must implement the definition function. The definition consists of components
    // that describes the module's functionality and behavior.
    // See https://docs.expo.dev/modules/module-api for more details about available components.
    public func definition() -> ModuleDefinition {
        // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
        // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
        // The module will be accessible from `requireNativeModule('<%- project.name %>')` in JavaScript.
        Name("ExpoMsal")
        
        // Defines a JavaScript function that always returns a Promise and whose native code
        // is by default dispatched on the different thread than the JavaScript runtime runs on.
        AsyncFunction("acquireTokenInteractively") { (config: MSALConfig, promise: Promise) in
            if (applicationContext === nil) {
                loadApplication(config: config)
            }
            guard let applicationContext = self.applicationContext else {
                promise.resolve("Error")
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
                        promise.resolve("Error")
                        return
                    }
                    
                    promise.resolve(result.accessToken)
                }
            } else {
                promise.resolve("Error")
            }
        }.runOnQueue(.main)
        AsyncFunction("acquireTokenSilently") { (config: MSALConfig, promise: Promise) in
            if (applicationContext === nil) {
                loadApplication(config: config)
            }
            guard let applicationContext = self.applicationContext else {
                promise.resolve("Error")
                return
            }
            let msalParameters = MSALParameters()
            msalParameters.completionBlockQueue = DispatchQueue.main
            applicationContext.getCurrentAccount(with: msalParameters, completionBlock: { (currentAccount, previousAccount, error) in
                if let currentAccount = currentAccount {
                    let parameters = MSALSilentTokenParameters(scopes: config.scopes, account: currentAccount)
                    
                    applicationContext.acquireTokenSilent(with: parameters) { (result, error) in
                        guard let result = result else {
                            promise.resolve("Error")
                            return
                        }
                        promise.resolve(result.accessToken)
                        return
                    }
                }
            })
        }.runOnQueue(.main)
        AsyncFunction("signOut") { (config: MSALConfig, promise: Promise) in
            if (applicationContext === nil) {
                loadApplication(config: config)
            }
            guard let applicationContext = self.applicationContext else {
                promise.resolve(false)
                return
            }
            let keyWindow = UIApplication.shared.windows.filter {$0.isKeyWindow}.first
            
            if var topController = keyWindow?.rootViewController {
                while let presentedViewController = topController.presentedViewController {
                    topController = presentedViewController
                }
                let msalParameters = MSALParameters()
                msalParameters.completionBlockQueue = DispatchQueue.main
                applicationContext.getCurrentAccount(with: msalParameters, completionBlock: { (currentAccount, previousAccount, error) in
                    if let currentAccount = currentAccount {
                        let parameters = MSALSilentTokenParameters(scopes: config.scopes, account: currentAccount)
                        let webViewParamaters = MSALWebviewParameters(authPresentationViewController: topController)
                        let signOutParams = MSALSignoutParameters(webviewParameters: webViewParamaters)
                        applicationContext.signout(with: currentAccount, signoutParameters: signOutParams) {result,_ in
                            promise.resolve(result)
                        }
                    }
                })
            } else {
                promise.resolve(false)
            }
        }.runOnQueue(.main)
    }
    
    func loadApplication(config: MSALConfig) {
        do {
            guard let authorityURL = URL(string: config.authority) else {
                  return
            }
            let authority = try MSALAADAuthority(url: authorityURL)
                    
            let msalConfiguration = MSALPublicClientApplicationConfig(clientId: config.clientId,
                                                                      redirectUri: config.redirectUri,
                                                                      authority: authority)
            self.applicationContext = try MSALPublicClientApplication(configuration: msalConfiguration)
        } catch {
            
        }
    }
}

struct MSALConfig: Record {
    @Field
    var clientId: String;
    @Field
    var scopes: [String];
    @Field
    var authority: String;
    @Field
    var redirectUri: String;
}

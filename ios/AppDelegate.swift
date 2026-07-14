import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import GoogleSignIn

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

  var window: UIWindow?
  var reactNativeFactory: RCTReactNativeFactory?
  var reactNativeDelegate: ReactNativeDelegate?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    self.reactNativeDelegate = delegate
    self.reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "CarAppClean",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }

  func application(_ app: UIApplication,
                   open url: URL,
                   options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
      return GIDSignIn.sharedInstance.handle(url)
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {

  override init() {
    super.init()
    self.dependencyProvider = RCTAppDependencyProvider()
  }

  override func bundleURL() -> URL? {
    #if DEBUG
      return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    #else
      return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    #endif
  }
}

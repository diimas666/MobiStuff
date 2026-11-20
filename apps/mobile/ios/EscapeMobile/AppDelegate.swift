import UIKit
import UserNotifications
import StoreKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    // Push: показуємо банери і в відкритому застосунку; токен оновлюємо при кожному запуску,
    // якщо дозвіл уже надано (сам дозвіл запитується з JS через mobistuff://push-enable)
    UNUserNotificationCenter.current().delegate = self
    UNUserNotificationCenter.current().getNotificationSettings { settings in
      if settings.authorizationStatus == .authorized || settings.authorizationStatus == .provisional {
        DispatchQueue.main.async { application.registerForRemoteNotifications() }
      }
    }

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "MobistuffMobile",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }

  // Посилання mobistuff://… (з SMS, сайту, сповіщень) відкривають потрібний екран
  func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    // Службове посилання: запит дозволу на сповіщення (викликається з JS)
    // Службове посилання: системний запит оцінки App Store (Apple сам вирішує, чи показати)
    if url.scheme == "mobistuff" && url.host == "request-review" {
      if let scene = app.connectedScenes.first(where: { $0.activationState == .foregroundActive }) as? UIWindowScene {
        SKStoreReviewController.requestReview(in: scene)
      }
      return true
    }
    if url.scheme == "mobistuff" && url.host == "push-enable" {
      UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, _ in
        UserDefaults.standard.set(granted ? "granted" : "denied", forKey: "pushPermission")
        if granted {
          DispatchQueue.main.async { app.registerForRemoteNotifications() }
        }
      }
      return true
    }
    return RCTLinkingManager.application(app, open: url, options: options)
  }

  // Токен APNs → UserDefaults; JS читає його через Settings.get('pushToken') і реєструє на сервері
  func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    let token = deviceToken.map { String(format: "%02x", $0) }.joined()
    UserDefaults.standard.set(token, forKey: "pushToken")
  }

  func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
    UserDefaults.standard.removeObject(forKey: "pushToken")
  }

  // Сповіщення при відкритому застосунку — теж показуємо банер
  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    completionHandler([.banner, .list, .sound])
  }

  // Натискання на сповіщення → відкриваємо екран з поля "url" (mobistuff://orders тощо)
  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping () -> Void
  ) {
    if let link = response.notification.request.content.userInfo["url"] as? String,
       let url = URL(string: link), url.scheme == "mobistuff" {
      DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) {
        _ = RCTLinkingManager.application(UIApplication.shared, open: url, options: [:])
      }
    }
    completionHandler()
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}

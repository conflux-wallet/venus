package io.bimwallet
import android.content.res.Configuration
import expo.modules.ApplicationLifecycleDispatcher
import expo.modules.ReactNativeHostWrapper

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
// import com.facebook.react.bridge.JSIModulePackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
//import com.facebook.react.flipper.ReactNativeFlipper
import com.facebook.soloader.SoLoader
import com.facebook.react.common.assets.ReactFontManager;
import com.facebook.react.soloader.OpenSourceMergedSoMapping

//import com.microsoft.codepush.react.CodePush
//import io.bimwallet.bsimsdk.BSIMSDKPackage
import com.nozbe.watermelondb.jsi.WatermelonDBJSIPackage;


class MainApplication : Application(), ReactApplication {

    override val reactNativeHost: ReactNativeHost =
        ReactNativeHostWrapper(this, object : DefaultReactNativeHost(this) {
            override fun getPackages(): List<ReactPackage> =
                PackageList(this).packages.apply {
                    // Packages that cannot be autolinked yet can be added manually here, for example:
                    // add(MyReactNativePackage())
                    // see: https://github.com/Nozbe/WatermelonDB/issues/1769#issuecomment-2507899744
                    add(WatermelonDBJSIPackage())
                }
            override fun getJSMainModuleName(): String = "index"
            override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG
            override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
            override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
//            fun getJSIModulePackage(): JSIModulePackage? {
//                return WatermelonDBJSIPackage()
//            }
//            override fun getJSBundleFile(): String? {
//                return CodePush.getJSBundleFile()
//            }
        })

    override val reactHost: ReactHost
        get() = ReactNativeHostWrapper.createReactHost(applicationContext, reactNativeHost)


    override fun onCreate() {
        super.onCreate();
        SoLoader.init(this, OpenSourceMergedSoMapping)
        ReactFontManager.getInstance().addCustomFont(this, "Sora", R.font.sora)
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            // If you opted-in for the New Architecture, we load the native entry point for this app.
            load()
        }
      ApplicationLifecycleDispatcher.onApplicationCreate(this)
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig)
  }
}
package com.appblocker;

import android.app.AppOpsManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.provider.Settings;
import android.text.TextUtils;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class AppBlockerModule extends ReactContextBaseJavaModule {
  public static final String NAME = "AppBlockerModule";
  private static final String PREFS = "APP_BLOCKER_PREFS";
  private static final String BLOCKED_APPS_KEY = "BLOCKED_APPS";
  private static AppBlockerModule instance;
  private static String lastBlockedPackage = "";
  private final SharedPreferences preferences;

  public AppBlockerModule(ReactApplicationContext reactContext) {
    super(reactContext);
    preferences = reactContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    instance = this;
  }

  @NonNull
  @Override
  public String getName() {
    return NAME;
  }

  private PackageManager getPackageManager() {
    return getReactApplicationContext().getPackageManager();
  }

  @ReactMethod
  public void requestAllPermissions(Promise promise) {
    try {
      Context context = getReactApplicationContext();
      boolean usage = hasUsageAccess(context);
      boolean overlay = Settings.canDrawOverlays(context);
      if (!usage) {
        Intent usageIntent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
        usageIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(usageIntent);
      }
      if (!overlay) {
        Intent overlayIntent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
            Uri.parse("package:" + context.getPackageName()));
        overlayIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(overlayIntent);
      }
      WritableMap result = Arguments.createMap();
      result.putBoolean("usage", usage);
      result.putBoolean("overlay", overlay);
      promise.resolve(result);
    } catch (Exception exception) {
      promise.reject("permission_error", exception);
    }
  }

  private boolean hasUsageAccess(Context context) {
    AppOpsManager appOps = (AppOpsManager) context.getSystemService(Context.APP_OPS_SERVICE);
    int mode = appOps.unsafeCheckOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS,
        android.os.Process.myUid(), context.getPackageName());
    return mode == AppOpsManager.MODE_ALLOWED;
  }

  @ReactMethod
  public void getInstalledApps(Promise promise) {
    try {
      PackageManager pm = getPackageManager();
      List<PackageInfo> packages = pm.getInstalledPackages(0);
      WritableArray array = Arguments.createArray();
      for (PackageInfo info : packages) {
        ApplicationInfo appInfo = info.applicationInfo;
        if ((appInfo.flags & ApplicationInfo.FLAG_SYSTEM) != 0) {
          continue;
        }
        WritableMap map = Arguments.createMap();
        map.putString("packageName", info.packageName);
        map.putString("label", pm.getApplicationLabel(appInfo).toString());
        map.putString("icon", "");
        array.pushMap(map);
      }
      promise.resolve(array);
    } catch (Exception ex) {
      promise.reject("installed_apps_error", ex);
    }
  }

  @ReactMethod
  public void setBlockedApps(ReadableArray packages, Promise promise) {
    try {
      List<String> values = new ArrayList<>();
      for (int i = 0; i < packages.size(); i++) {
        values.add(packages.getString(i));
      }
      preferences.edit().putString(BLOCKED_APPS_KEY, TextUtils.join(",", values)).apply();
      promise.resolve(null);
    } catch (Exception ex) {
      promise.reject("blocked_apps_error", ex);
    }
  }

  @ReactMethod
  public void getLastBlockedPackage(Promise promise) {
    promise.resolve(lastBlockedPackage);
  }

  public static boolean isPackageBlocked(Context context, String packageName) {
    SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    String csv = prefs.getString(BLOCKED_APPS_KEY, "");
    if (csv == null || csv.isEmpty()) {
      return false;
    }
    Set<String> blocked = new HashSet<>(Arrays.asList(csv.split(",")));
    return blocked.contains(packageName);
  }

  public static void notifyBlocked(String packageName) {
    lastBlockedPackage = packageName;
    if (instance == null) {
      return;
    }
    WritableMap map = Arguments.createMap();
    map.putString("packageName", packageName);
    instance
        .getReactApplicationContext()
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
        .emit("AppBlockedEvent", map);
  }

  @ReactMethod
  public void showBlockingOverlay(String packageName, Promise promise) {
    try {
      Context context = getReactApplicationContext();
      Intent intent = new Intent(context, com.appblocker.services.OverlayService.class);
      intent.putExtra("packageName", packageName);
      context.startService(intent);
      promise.resolve(null);
    } catch (Exception ex) {
      promise.reject("overlay_error", ex);
    }
  }

  @ReactMethod
  public void hideBlockingOverlay(Promise promise) {
    try {
      Context context = getReactApplicationContext();
      Intent intent = new Intent(context, com.appblocker.services.OverlayService.class);
      context.stopService(intent);
      promise.resolve(null);
    } catch (Exception ex) {
      promise.reject("overlay_error", ex);
    }
  }
}

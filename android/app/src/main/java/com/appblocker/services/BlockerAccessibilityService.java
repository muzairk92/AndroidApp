package com.appblocker.services;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.content.Intent;
import android.util.Log;
import android.view.accessibility.AccessibilityEvent;

import com.appblocker.AppBlockerModule;

public class BlockerAccessibilityService extends AccessibilityService {
  private static final String TAG = "BlockerService";

  @Override
  protected void onServiceConnected() {
    super.onServiceConnected();
    AccessibilityServiceInfo info = new AccessibilityServiceInfo();
    info.eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED;
    info.feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC;
    info.flags = AccessibilityServiceInfo.FLAG_INCLUDE_NOT_IMPORTANT_VIEWS;
    setServiceInfo(info);
    Log.d(TAG, "Accessibility service connected");
  }

  @Override
  public void onAccessibilityEvent(AccessibilityEvent event) {
    if (event == null || event.getPackageName() == null) {
      return;
    }
    String packageName = event.getPackageName().toString();
    if (AppBlockerModule.isPackageBlocked(this, packageName)) {
      Log.d(TAG, "Blocked package detected: " + packageName);
      AppBlockerModule.notifyBlocked(packageName);
      Intent overlayIntent = new Intent(this, OverlayService.class);
      overlayIntent.putExtra("packageName", packageName);
      startService(overlayIntent);
    }
  }

  @Override
  public void onInterrupt() {
    Log.d(TAG, "Accessibility service interrupted");
  }
}

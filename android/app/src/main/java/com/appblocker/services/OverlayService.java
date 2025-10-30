package com.appblocker.services;

import android.app.Service;
import android.content.Intent;
import android.graphics.PixelFormat;
import android.os.Build;
import android.os.IBinder;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.Nullable;

import com.appblocker.MainActivity;
import com.appblocker.R;

public class OverlayService extends Service {
  private WindowManager windowManager;
  private View overlayView;
  private String blockedPackage;

  @Nullable
  @Override
  public IBinder onBind(Intent intent) {
    return null;
  }

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    if (overlayView != null) {
      removeOverlay();
    }
    blockedPackage = intent != null ? intent.getStringExtra("packageName") : "";
    showOverlay(blockedPackage);
    return START_STICKY;
  }

  @Override
  public void onDestroy() {
    super.onDestroy();
    removeOverlay();
  }

  private void showOverlay(String packageName) {
    windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
    int layoutFlag = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
        ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        : WindowManager.LayoutParams.TYPE_PHONE;

    WindowManager.LayoutParams params = new WindowManager.LayoutParams(
        WindowManager.LayoutParams.MATCH_PARENT,
        WindowManager.LayoutParams.MATCH_PARENT,
        layoutFlag,
        WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN
            | WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
            | WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON,
        PixelFormat.TRANSLUCENT);
    params.gravity = Gravity.CENTER;

    LayoutInflater inflater = LayoutInflater.from(this);
    overlayView = inflater.inflate(R.layout.overlay_blocker, null);

    TextView title = overlayView.findViewById(R.id.overlayTitle);
    Button unlockButton = overlayView.findViewById(R.id.overlayUnlockButton);
    Button closeButton = overlayView.findViewById(R.id.overlayCloseButton);

    title.setText(String.format("%s is blocked", packageName));
    unlockButton.setOnClickListener(v -> openAppForUnlock());
    closeButton.setOnClickListener(v -> removeOverlay());

    windowManager.addView(overlayView, params);
  }

  private void openAppForUnlock() {
    Intent launchIntent = new Intent(this, MainActivity.class);
    launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
    launchIntent.putExtra("blockedPackage", blockedPackage);
    startActivity(launchIntent);
    removeOverlay();
  }

  private void removeOverlay() {
    if (windowManager != null && overlayView != null) {
      windowManager.removeView(overlayView);
      overlayView = null;
    }
    stopSelf();
  }
}

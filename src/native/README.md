# Native Android Services

This directory documents the native building blocks that power the Focus Guardian app blocking experience.

## Files

| File | Purpose |
|------|---------|
| `android/app/src/main/java/com/appblocker/AppBlockerModule.java` | React Native bridge exposing installed apps, permission helpers, and overlay controls. |
| `android/app/src/main/java/com/appblocker/services/BlockerAccessibilityService.java` | Accessibility service that watches foreground apps and signals React Native when blocked packages appear. |
| `android/app/src/main/java/com/appblocker/services/OverlayService.java` | Foreground service displaying a full-screen overlay with unlock/back actions. |
| `android/app/src/main/res/layout/overlay_blocker.xml` | UI layout inflated by the overlay service. |

## How It Works

1. React Native persists the list of blocked packages using `AppBlockerModule.setBlockedApps`.
2. The accessibility service retrieves the list from shared preferences and listens for window state changes.
3. When a blocked package gains focus, `AppBlockerModule.notifyBlocked` emits an event to JavaScript and `OverlayService` launches.
4. The overlay prevents interaction with the target app. Selecting **Unlock temporarily** re-opens Focus Guardian for password verification.

## Extending

- To add schedule-based blocking, extend `AppBlockerModule` to include timing metadata and consult it inside `BlockerAccessibilityService`.
- To customize the overlay UI, edit `overlay_blocker.xml` and update the service click listeners as needed.
- For analytics, emit additional events from `AppBlockerModule` and capture them in JavaScript via `NativeEventEmitter`.

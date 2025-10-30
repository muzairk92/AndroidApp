# Focus Guardian (Android App Blocker)

Focus Guardian is a React Native application designed as a digital wellbeing companion. It allows you to protect your attention by blocking distracting applications, enforcing password-protected access to settings, and displaying a native overlay whenever a restricted application is opened.

## Key Features

- **Guided onboarding** with permission education and password setup.
- **Secure authentication** using `react-native-keychain` plus security question recovery.
- **Installed apps discovery** with search, bulk select, and default blocking for YouTube & Facebook.
- **Background enforcement** via an Android accessibility service and overlay window that intercepts blocked apps.
- **Statistics dashboard** summarising blocked apps and time saved.
- **Settings hub** to change password, toggle notifications, and reset the application.
- **Session timeout** that requires re-authentication after inactivity.

## Project Structure

```
android/                   Native Android implementation (modules, services, manifest)
src/
  components/              Shared UI components (password input, list items, overlay)
  navigation/              Stack navigator definition
  screens/                 React screens for onboarding, auth, dashboard, settings
  services/                Business logic (auth, storage, native bridge)
  utils/                   Helpers for permissions and constants
App.js                     App entry point with AuthContext and navigation bootstrap
index.js                   React Native registry
```

## Native Services Overview

| Component | Responsibility |
|-----------|----------------|
| `AppBlockerModule` | Bridge between React Native and Android for permissions, installed app list, and overlay control. |
| `BlockerAccessibilityService` | Observes foreground app changes and triggers overlays when a blocked package is detected. |
| `OverlayService` | Displays a full-screen blocking UI with options to return home or reopen the app for password unlock. |

## Getting Started

1. **Install dependencies**
   ```bash
   yarn install
   ```

2. **Android preparation**
   - Ensure Android Studio / SDK 33+ is installed.
   - Create a local `android/local.properties` pointing to your SDK (standard React Native setup).

3. **Run the application**
   ```bash
   yarn android
   ```

4. **Grant permissions** during first launch:
   - Usage access
   - Display over other apps
   - Accessibility service activation (`Focus Guardian Accessibility`)

5. **Create a password** and security answer. You will be prompted whenever a blocked app is accessed.

## Blocking Workflow

1. Accessibility service detects a blocked application.
2. `OverlayService` displays a blocking screen, preventing interaction with the target app.
3. Selecting _Unlock temporarily_ returns to Focus Guardian, where password authentication is required.
4. Successful authentication records statistics and allows you to continue if desired.

## Security Notes

- Passwords are stored securely using the device keystore via `react-native-keychain`.
- Security answers are hashed (`sha256`) before persistence.
- After five consecutive failures the app temporarily locks, forcing a cool-down.
- A session timeout automatically logs out after inactivity/backgrounding.

## Optional Enhancements

- Time-based schedules for blocking sets of apps.
- Detailed analytics (daily/weekly charts).
- Cloud backup of blocked lists using secure storage.
- Dark mode theme toggles and localization.

## Testing Checklist

- [ ] Password creation and confirmation
- [ ] Login success and lockout after repeated failures
- [ ] Forgot password flow with security question
- [ ] Blocked apps selection and default YouTube/Facebook blocking
- [ ] Overlay display when opening a blocked app
- [ ] Stats update after block events
- [ ] Settings adjustments (notifications, password change, reset)

## Disclaimer

This project is provided for educational purposes. When distributing, ensure compliance with Google Play policies around accessibility services, overlay permissions, and user privacy disclosures.

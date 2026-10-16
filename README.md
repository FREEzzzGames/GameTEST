# WatchKey

Android prototype for assigning installed apps to media-button events (Play/Pause, Next, Previous).

## Build
Run `gradle assembleDebug` with JDK 17 and Android SDK platform/build-tools 35. The GitHub Actions workflow builds and uploads a debug APK.

## Compatibility limitation
Android and the watch companion app decide which media session receives hardware events. WatchKey cannot guarantee that Redmi Watch 5 Active forwards these events to this app. The watch's Find Phone feature is not remapped. Test on the target phone/watch before relying on it.

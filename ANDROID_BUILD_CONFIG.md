# Android Build Configuration

This document provides detailed instructions on how to build and sign your Android application.

## Prerequisites
- **Java JDK**: Make sure you have the latest version of the JDK installed.
- **Android SDK**: Install Android Studio to get the SDK and additional build tools.
- **Gradle**: Use the Gradle build system for building your Android project.

## Building the APK
1. Open your project in Android Studio.
2. Compile the project by selecting `Build > Make Project` from the top menu.
3. To generate the APK, navigate to `Build > Build Bundle(s) / APK(s) > Build APK(s)`. You can find the generated APK in `{project-root}/app/build/outputs/apk/`

## Signing the APK
To release your Android app, you must sign it. Here’s how:

1. **Create a Keystore**:
   Run the following command to create a keystore file (change `my-release-key.jks` to your desired filename):
   ```bash
   keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
   ```
   Fill in the required information when prompted.

2. **Sign the APK**:
   To sign the APK, navigate to `Build > Generate Signed Bundle / APK`. Follow the prompts and select your keystore file, enter your keystore password, key alias, and key password.

3. **Verify the APK**:
   You can verify your signed APK with the following command:
   ```bash
   jarsigner -verify -verbose -certs my-app-release.apk
   ```

## Tips
- Always back up your keystore file. Losing it means you cannot update your app.
- For better security, consider using **Google Play App Signing**.

---

Feel free to modify this document to better fit your needs!
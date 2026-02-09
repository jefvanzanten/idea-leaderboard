# Tauri v2 Android Setup Guide

## Vereisten

- Android SDK met NDK 27+ geinstalleerd
- `ANDROID_HOME` / `ANDROID_SDK_ROOT` environment variabelen gezet
- ADB beschikbaar in PATH
- Tauri CLI (`@tauri-apps/cli` v2)

## Eerste keer setup

```bash
# Initialiseer Android project (maakt src-tauri/gen/android/ aan)
bun run tauri android init
```

## Bouwen en installeren

```bash
# Debug APK bouwen + installeren via ADB
bun run tauri:android:install

# Of handmatig:
bunx tauri android build --debug
adb install -r src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk

# Release APK (geoptimaliseerd, geminificeerd)
bunx tauri android build
```

**Let op:** `npx tauri` werkt niet altijd. Gebruik `bunx tauri` als je Bun gebruikt.

## Veelvoorkomende problemen

### Wit scherm op Android

**Oorzaak:** De APK bevat een stale (oude) frontend build.

**Hoe het werkt:** Tauri bundelt de frontend assets (uit `build/`) in de native library (.so). Als de frontend niet opnieuw wordt gebuild voor de Android build, bevat de APK oude of ontbrekende code.

**Oplossing:** Zorg dat je opnieuw bouwt met `bunx tauri android build --debug`. Dit draait automatisch `bun run build` (de `beforeBuildCommand` uit tauri.conf.json) waarna de verse frontend in de APK wordt gebundeld.

**Verificatie:** Check logcat voor JavaScript console output:
```bash
adb logcat -d --pid=$(adb shell pidof <package_name>) | grep "Tauri/Console"
```
Als er GEEN Tauri/Console regels zijn, laadt de frontend niet.

### Wit scherm met dev URL (http://192.168.x.x:1420)

**Oorzaak:** Je draait `tauri android dev` in plaats van `tauri android build`. Dev mode verwacht een actieve dev server op je PC die bereikbaar is vanaf je telefoon.

**Voorwaarden voor dev mode:**
- `bun run dev` moet actief zijn op je PC
- Telefoon en PC moeten op hetzelfde WiFi netwerk zitten
- Windows Firewall moet poort 1420 doorlaten

**Oplossing voor standalone APK:** Gebruik `tauri android build --debug` in plaats van `tauri android dev`.

### APK pad mismatch

De build kan verschillende APK varianten produceren:
- `arm64/debug/app-arm64-debug.apk` - alleen ARM64
- `universal/debug/app-universal-debug.apk` - alle architecturen

Check welk pad je install-script gebruikt en of dat overeenkomt met de build output.

## Database (SQLite)

### Pad per platform

| Platform | Database locatie |
|----------|-----------------|
| Windows  | `%APPDATA%\<identifier>\idea-leaderboard.db` |
| Android  | `/data/data/<package_name>/idea-leaderboard.db` |
| Linux    | `~/.local/share/<identifier>/idea-leaderboard.db` |
| macOS    | `~/Library/Application Support/<identifier>/idea-leaderboard.db` |

Belangrijk: `identifier` (tauri.conf.json) gebruikt hyphens (`com.jvanz.idea-leaderboard`), maar de Android `package_name` gebruikt underscores (`com.jvanz.idea_leaderboard`).

### Desktop DB naar Android kopieren

```bash
# 1. Stop de app
adb shell am force-stop com.jvanz.idea_leaderboard

# 2. Push DB naar sdcard als temp bestand
adb push "%APPDATA%\com.jvanz.idea-leaderboard\idea-leaderboard.db" //sdcard/idea-leaderboard-tmp.db

# 3. Kopieer naar app data (run-as omzeilt root vereiste)
adb shell "cat /sdcard/idea-leaderboard-tmp.db | run-as com.jvanz.idea_leaderboard sh -c 'cat > idea-leaderboard.db'"

# 4. Verwijder WAL bestanden (voorkomt corruptie)
adb shell "run-as com.jvanz.idea_leaderboard rm -f idea-leaderboard.db-shm idea-leaderboard.db-wal"

# 5. Cleanup temp bestand
adb shell rm /sdcard/idea-leaderboard-tmp.db
```

**Let op:** Afbeeldingen die in de desktop DB staan verwijzen naar lokale paden op Windows. Deze bestanden bestaan niet op Android en geven een "No such file or directory" error.

## Debugging

### Logcat filteren op je app

```bash
# Alles van de app
adb logcat -d --pid=$(adb shell pidof com.jvanz.idea_leaderboard)

# Alleen JavaScript console output
adb logcat -d --pid=$(adb shell pidof com.jvanz.idea_leaderboard) | grep "Tauri/Console"

# Errors
adb logcat -d --pid=$(adb shell pidof com.jvanz.idea_leaderboard) | grep -iE "error|exception|Uncaught"
```

### Logcat clearen en app herstarten

```bash
adb logcat -c && \
adb shell am force-stop com.jvanz.idea_leaderboard && \
sleep 1 && \
adb shell am start -n com.jvanz.idea_leaderboard/.MainActivity && \
sleep 4 && \
adb logcat -d --pid=$(adb shell pidof com.jvanz.idea_leaderboard)
```

## Tauri plugins op Android

Plugins moeten geregistreerd zijn op twee plekken:

1. **Rust** (src-tauri/src/lib.rs):
   ```rust
   .plugin(tauri_plugin_sql::Builder::default().build())
   ```

2. **Android Gradle** (src-tauri/gen/android/app/tauri.build.gradle.kts):
   Dit wordt automatisch gegenereerd door `tauri android init`. Als een plugin ontbreekt, draai opnieuw `tauri android init` of voeg handmatig toe:
   ```kotlin
   implementation(project(":tauri-plugin-sql"))
   ```

## Configuratie referentie

### tauri.conf.json build sectie
```json
{
  "build": {
    "beforeDevCommand": "bun run dev",
    "devUrl": "http://localhost:1420",
    "beforeBuildCommand": "bun run build",
    "frontendDist": "../build"
  }
}
```

- `beforeBuildCommand` draait automatisch bij `tauri android build`
- `frontendDist` is relatief aan `src-tauri/`
- `devUrl` wordt alleen gebruikt bij `tauri android dev`

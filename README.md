# SBL EHS Mobile Control Tower 📱🛡️ (Apple iOS & Android Edition)

Mobile Application for **SBL Specialty Coatings** (Master EHS Portal & Command Node // Lalru Unit-3).
Engineered to work seamlessly across **Apple iPhones (iOS / Safari PWA / Native Xcode)** and **Android devices**.

---

## 🍏 Dedicated Apple iPhone / iOS Capabilities

1. **Apple Human Interface Guidelines (Cupertino HIG) Design**:
   - SF Pro / iOS system typography, continuous squircle radii (`rounded-[20px]`).
   - Frosted Glass materials (`backdrop-blur-2xl` vibrancy) on top navigation and bottom tab bars.
   - Dynamic Island / iPhone Notch safe area handling (`env(safe-area-inset-top)` & `env(safe-area-inset-bottom)`).
   - Apple Segmented Control sliders, iOS Inset Grouped lists, and Apple Cupertino Modal Sheets with pull grabber handles.

2. **Apple Taptic Audio & Haptic Simulation**:
   - Real-time Cupertino micro-clicks and success confirmation chimes powered by Web AudioContext.

3. **In-App Safari View Controller Architecture**:
   - All 16 Google Workspace apps (PTW Dashboard, Engineering Portal, Create PTW, Kaizen Hub, UA/C, LMS, 5S, Fire Protection, etc.) open directly inside the iOS app frame with a dedicated `Done` / `Back` button, reload, and secure session indicator.

4. **Dedicated Standalone Apple iPhone App (`sbl-ehs-apple-ios.html`)**:
   - Standalone single-file edition built from the ground up specifically for Apple iPhone Safari.
   - Requires zero installation or Node.js runtime—load via AirDrop, Safari link, or email!

5. **Native iOS Xcode Project (`ios/App/App.xcodeproj`)**:
   - Pre-configured with `@capacitor/ios` and ready to open in Xcode.
   - Production `Info.plist` with Apple App Store compliance permissions (`NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`, `NSMicrophoneUsageDescription`, `NSSpeechRecognitionUsageDescription`).

---

## 🌟 Core App Features

1. **Facility Risk Index & Dynamic ECG Oscilloscope**
   - Real-time 4-Pillar risk calculation (Ops Baseline + High-Risk PTW penalty + Unresolved CAPA backlog penalty + LMS compliance deficit).
   - Dynamic oscillating ECG waveform (Optimal Emerald, Elevated Amber, Critical Red).

2. **J.A.R.V.I.S. Predictive Safety AI Cortex (Password Protected)**
   - **Director Clearance Gate**: Password protected with default code `SBL-COMMAND` (matching production specification).
   - Instant re-lock capability right from the J.A.R.V.I.S. header or Settings modal.
   - Customizable clearance passcode in App Settings.
   - Powered by **Google Gemini API** (`gemini-2.5-flash`).
   - Integrated Speech Recognition (voice dictation on mobile) and natural Speech Synthesis (voice playback upon authorization: *"Security protocols bypassed. I am online and monitoring the facility."*).
   - Plant-contextual safety analysis, critical hazard alerts, and automated shift briefings.

3. **Tactical Shift Handover Generator**
   - Temporal memory (automatically compares Monday to Saturday, or weekday to yesterday).
   - Generates three clear pillars: *Previous Shift Review*, *Live Operational Status*, *Compliance & Backlog*.
   - One-tap **Copy to Clipboard** and **Native iOS Share Sheet** (WhatsApp, AirDrop, Messages, Mail).

4. **Rapid Mobile Field Observation Logger**
   - Log Unsafe Conditions, Unsafe Acts, or Near Misses directly on the shop floor.
   - iPhone camera / photo library attachment.
   - Automatically recalculates Facility Risk Index in real time.

5. **Integrated In-App Google Workspace Viewer (No External Browser Required)**
   - All 16 SBL EHS Google Apps, dashboards, and Google Forms open **directly inside the mobile application**.
   - Includes full In-App Top Bar with:
     - `← Back` button to effortlessly return to the EHS Control Tower.
     - Status indicator (*"In-App Live Session"*).
     - `🔄 Reload / Refresh` button.
     - `↕ Fullscreen` toggle.
     - Optional external browser escape icon.
   - Modules supported in-app:
     - *Engineering Portal*
     - *PTW Dashboard & Create PTW Form*
     - *Kaizen Hub*
     - *UA/C & NM Hub and Observation Forms*
     - *Digital LMS Training Portal*
     - *5S Audit Dashboard*
     - *Fire Protection System*
     - *Vehicle Safety & Safety Shower Checks*
     - *Incident Investigation & Mock Drill Reports*
     - *First Aid Box Inspection & EHS SOPs Library*
     - *Industrial Hygiene Dashboard*

6. **Environmental Resource Telemetry & CAPA Matrix**
   - Daily Power Consumption (Grid kWh, DG 750 KVA, DG 400 KVA).
   - Fluids: Fresh Water intake vs ETP Discharge (PCB limit compliant).
   - Atmospheric VOC emissions gauge (Safe/Elevated).
   - Hazardous Waste Manifest (Used Oil, Waste Paint, Drums, ETP Sludge).
   - Compliance & CAPA Velocity Matrix with real-time Master Ledger tracking.

7. **Offline-First & Field Ready**
   - Seamless offline caching with LocalStorage.
   - Works even in plant dead zones without internet connectivity.

---

## 🚀 How to Run the Mobile App

### Method 1: Instant Windows Batch Launcher (Recommended)
Double-click:
```bash
start-mobile-app.bat
```
This automatically boots up the local mobile dev server with network access.

### Method 2: NPM Command Line
```bash
# Start mobile dev server (accessible across your local Wi-Fi / LAN)
npm run dev -- --host

# Or build and test production bundle
npm run build
npm run preview
```

### Method 3: Dedicated Apple iOS Standalone Edition
Open [sbl-ehs-apple-ios.html](file:///d:/Budhi%20Parkash/Drive%20D/EHS%20Online%20Management%20System/Mobile%20App/sbl-ehs-apple-ios.html) directly in Safari on any iPhone, iPad, or desktop browser!

---

## 📲 How to Install on Apple iPhone & iPad (Safari PWA)

1. Connect your iPhone to the same Wi-Fi network as your computer and open:
   `http://<YOUR-PC-IP>:5173` (or `http://<YOUR-PC-IP>:5173/sbl-ehs-apple-ios.html`)
2. In **Safari**, tap the **Share** button (the square with an arrow pointing upward at the bottom of the screen).
3. Scroll down the Share sheet and tap **"Add to Home Screen"**.
4. Tap **"Add"** in the top right.
5. The **SBL EHS** app icon will appear directly on your iPhone Home Screen and opens full-screen without Safari browser address bars or navigation tabs!

---

## 🍏 How to Open & Build the Native iOS App (Xcode)

The native iOS Xcode project has been generated and configured in `ios/App`:

```bash
# Sync latest production web assets into iOS project
npm run build
npx cap sync ios

# Open the project in Xcode (on macOS)
npx cap open ios
```
In Xcode:
1. Select your target device (iPhone 15 / 16 / Pro or connected physical iPhone).
2. Set your Apple Developer Team under **Signing & Capabilities**.
3. Click **Product > Run** to install directly on your physical iPhone or simulator.

---

## 🤖 How to Build a Native Android APK (Capacitor)

To package for Android:
```bash
npm install @capacitor/android
npx cap add android
npm run build
npx cap sync
npx cap open android
```
Then in Android Studio, click **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

---

## 📁 Project Structure

```
Mobile App/
├── ios/                           # Native Apple iOS Xcode Project
│   └── App/
│       ├── App.xcodeproj          # Xcode project file
│       ├── App/
│       │   ├── AppDelegate.swift  # iOS Application lifecycle
│       │   ├── Info.plist         # Apple permissions (Camera, Mic, Speech)
│       │   └── public/            # Bundled web assets for offline iOS
├── public/
│   ├── manifest.json              # Mobile Web App Manifest
│   ├── sbl-ehs-apple-ios.html     # Dedicated standalone Apple iOS web app
│   └── sbl-ehs-mobile-standalone.html # Standalone mobile app
├── src/
│   ├── components/
│   │   ├── Header.tsx             # Plant switcher, connection status, user profile
│   │   ├── BottomNav.tsx          # 5-tab mobile navigation bar
│   │   ├── RiskCard.tsx           # Facility Risk Index & ECG Oscilloscope
│   │   ├── AlertBanner.tsx        # Real-time alert triggers
│   │   ├── TelemetryView.tsx      # PTW, Kaizen, LMS, Incidents deep dive
│   │   ├── LaunchpadView.tsx      # 16 SBL EHS Google Apps launcher
│   │   ├── ResourcesAndCapaView.tsx # Power, fluids, VOC, waste & CAPA matrix
│   │   ├── JarvisView.tsx         # J.A.R.V.I.S. 3D atomic AI cortex
│   │   ├── InAppWorkspaceViewer.tsx # In-App Safari view controller for 16 apps
│   │   ├── ShiftHandoverModal.tsx # Tactical Shift Handover briefing
│   │   ├── QuickReportModal.tsx   # Fast field observation logger
│   │   ├── AuthModal.tsx          # Employee identity verification
│   │   ├── FacilityModal.tsx      # Facility selector (Unit-3 Lalru, Unit-1, Unit-2)
│   │   └── SettingsModal.tsx      # API key, passcode, Apple mode toggle & PWA guide
│   ├── services/
│   │   ├── appleHaptics.ts        # Apple Taptic & audio micro-haptic simulation
│   │   ├── dataService.ts         # Telemetry calculations & offline storage
│   │   └── geminiService.ts       # Google Gemini API & speech cortex
│   ├── types/
│   │   └── index.ts               # TypeScript data definitions
│   ├── App.tsx                    # Main Mobile App Shell
│   ├── index.css                  # Tailored mobile animations & Apple Cupertino CSS
│   └── main.tsx                   # App Entrypoint
├── sbl-ehs-apple-ios.html         # Dedicated standalone Apple iOS Edition
├── sbl-ehs-mobile-standalone.html # Universal standalone mobile web app
├── capacitor.config.ts            # Native Android/iOS mobile wrapper config
├── start-mobile-app.bat           # 1-click launcher for Windows
└── package.json                   # Dependencies & build scripts
```

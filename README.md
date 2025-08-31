# Welcome to the **Chimera Devices Mobile App** by **NeuroHackers**!

We did a React Native mobile app built with [Expo](https://expo.dev/) and [Expo Router](https://expo.github.io/router/docs/).  
It connects to a FastAPI backend to to give you an interactive, visual way to explore and manage your devices.

---

## 🚀 Features

- Clean, modern React Native app using Expo Router for navigation
- Connects seamlessly to a FastAPI backend (see the `/api` folder)
- Modular structure for easy updates or feature additions
-Interactive device visualizations and quick actions

---

## 📦 Folder Structure

```
app-mobile/
  app/            # App entry point and screens (Expo Router)
  components/     # Reusable UI components
  constants/      # App-wide constants
  hooks/          # Custom React hooks
  scripts/        # Utility scripts
  package.json    # Project dependencies and scripts
  tsconfig.json   # TypeScript configuration
```

---

## 🛠️ Prerequisites

Before running the app, make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [Yarn](https://classic.yarnpkg.com/lang/en/) or [npm](https://www.npmjs.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- (Optional) [VS Code](https://code.visualstudio.com/) for development
- install expo go app after you can scan the QR-code from your pc using your mobile
---

## ⚡ Getting Started

1. **Clone the repository:**
   ```sh
   git clone https://github.com/Antoine44Sarkis/NeuroHackers.git
   ```
2. **Backend Setup (Terminal 1)**
   Navigate to the API directory: ``` cd api ```
   (use python3 if python is not recognized)
   Create virtual environment: ``` python -m venv venv ```
   Activate it (Windows): ``` venv\Scripts\activate ```
   Or (Mac/Linux): ``` source venv/bin/activate ```
   (You should see (venv) in your prompt)
   upgrade pip, setuptools, wheel: ``` python -m pip install --upgrade pip setuptools wheel ```
   Install Python dependencies: ``` pip install -r requirements.txt ```
   Start the backend server: ``` python main.py ```
   The API will run at http://localhost:8000
3. **Frontend Setup (Terminal 2)**
   ```sh
   cd app-mobile
   ```
   ``` yarn install ```(in the app-mobile:))
   # or
   ``` npm install ```
   Install dotenv support for React Native:
   ``` npm install react-native-dotenv ```
    create .env file in the app-mobile folder then add this inside :
    API_BASE_URL=http://<your-ip>:8000
   (replace <your-ip> with your machine’s IP):
    Tip: On Windows, run ipconfig in the terminal to find your local IP address.
   Make sure your mobile device is on the same network as your backend.
   ```

4. **Start the Expo server:**
   
   ```sh
   npx expo start
   ```
   download expo go app on yoour mobile.
5. **Run on your device or emulator:**
   - Press `w` to open in your browser (web)
   - Press `a` for Android emulator/device
   - Press `i` for iOS simulator/device
   - scan QR Code into your expo go app mobile

---

## 📝 Notes

- Make sure your mobile device and backend server are on the same network for API requests.
- If you see errors about missing fonts or components, check that you have removed or replaced all unused imports.

---

# Chimera Devices Mobile App

This is a React Native mobile app built with [Expo](https://expo.dev/) and [Expo Router](https://expo.github.io/router/docs/).  
It connects to a FastAPI backend to display and manage device data.

---

## 🚀 Features

- Modern React Native app using Expo Router for navigation
- Connects to a FastAPI backend (see `/api` folder)
- Clean, modular structure for easy extension

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

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [Yarn](https://classic.yarnpkg.com/lang/en/) or [npm](https://www.npmjs.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- (Optional) [VS Code](https://code.visualstudio.com/) for development

---

## ⚡ Getting Started

1. **Clone the repository:**
   ```sh
   git clone <repo-url>
   cd app-mobile
   ```

2. **Install dependencies:**
   ```sh
   yarn install
   # or
   npm install
   install for .env:
    npm install react-native-dotenv
    create .env in the root : cd ../.env file then add this :
    API_BASE_URL=http://yourippc:8000
    you can get yourippc ipconfig for window ...
   ```

3. **Start the Expo development server:**
   ```sh
   yarn start
   # or
   npm start
   ```

4. **Run on your device or emulator:**
   - Press `w` to open in your browser (web)
   - Press `a` for Android emulator/device
   - Press `i` for iOS simulator/device

---

## 🔗 Backend API

- The app expects a FastAPI backend running (see the `/api` folder).
- Update the API base URL in your code if needed (e.g., in `app/index.tsx`).

---

## 📝 Notes

- Make sure your mobile device and backend server are on the same network for API requests.
- If you see errors about missing fonts or components, check that you have removed or replaced all unused imports.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

[MIT](LICENSE) (or your chosen license)

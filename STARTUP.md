# Glitch Broadcast Startup Guide

This guide outlines the step-by-step startup process to launch both the frontend and backend servers on your local machine.

---

## 1. Automated Setup & Dependency Installation

Before starting the servers for the first time, run the automated setup script in the project root directory. This script will copy configuration files and download all required node modules:

1. Open your terminal or Command Prompt in the project root folder.
2. Run the automation setup script:
   ```bash
   node setup.js
   ```
3. Open `backend/.env` in your text editor and add your API keys:
   - **`GEMINI_API_KEY`**: Obtain a free key from [Google AI Studio](https://aistudio.google.com/apikey).
   - **`SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY`**: Obtain from your Supabase Project Settings API tab.
   - **`DATABASE_URL`** (Optional): Add your direct Supabase connection string to automatically build SQL tables and indices.
4. Re-run `node setup.js` to run the connectivity tests and verify your API keys are active.

---

## 2. Launching in Development Mode (Recommended for testing)

To run the application with live hot-reloading (Vite & Express):

### Step A: Start the Backend API
1. Open a new terminal window.
2. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
3. Run the backend development script:
   ```bash
   npm run dev
   ```
   *The API will start on `http://localhost:8787`.*

### Step B: Start the Frontend Vite Server
1. Open a second terminal window.
2. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
3. Start the Vite server:
   ```bash
   npm run dev
   ```
   *The Vite server will start on `http://localhost:5173`.*

### Step C: Browse the App
Open your web browser and go to:
➡️ **[http://localhost:5173](http://localhost:5173)**

---

## 3. Launching in Background Mode (For daily production use)

To run the backend silently in the background on your PC without leaving terminal windows open:

1. Install PM2 globally:
   ```bash
   npm install pm2 -g
   ```
2. Navigate to the `backend` folder and start the server under PM2:
   ```bash
   cd backend
   pm2 start server.js --name "glitch-backend"
   ```
3. Start the frontend:
   - For local use: Navigate to the `frontend` folder and run `npm run dev`.
   - For free cloud hosting: Drag-and-drop the `frontend` folder into [Vercel](https://vercel.com) or [Netlify](https://netlify.com) and point the environment variables to your local IP or an Ngrok tunnel.

---

## 4. Diagnostics & Troubleshooting

* **Vite Webapp Loads, but displays "API Latency: Offline"**:
  - The React app is running in **Demo Mode**. Check that the backend server is running on `http://localhost:8787` and that no other application is blocking port 8787.
* **Puppeteer Browser Closes Instantly during Assisted posting**:
  - Make sure you are running on your local machine with a visible GUI (headed mode). Puppeteer will open a headed Chrome browser window on your desktop.
  - The first time it runs, **manually log in to Facebook** inside the opened Chrome window. Close it when done; subsequent runs will stay logged in.

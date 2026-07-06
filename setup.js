/**
 * GLITCH BROADCAST - Local setup & automation script
 * ----------------------------------------------------
 * Automates dependencies installation, environment template copies,
 * API connectivity checks, and database table installations.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = __dirname;
const BACKEND_DIR = path.join(ROOT, "backend");
const FRONTEND_DIR = path.join(ROOT, "frontend");

console.log("\n=============================================");
console.log("   GLITCH BROADCAST - SETUP AUTOMATOR");
console.log("=============================================\n");

// Step 1: Copy Environment Templates
console.log("[1/5] Checking environment files...");
const envExamplePath = path.join(BACKEND_DIR, ".env.example");
const envPath = path.join(BACKEND_DIR, ".env");

if (!fs.existsSync(envPath)) {
  try {
    fs.copyFileSync(envExamplePath, envPath);
    console.log("  ✔️  Created backend/.env from .env.example template.");
  } catch (err) {
    console.error("  ❌  Failed to copy env file:", err.message);
  }
} else {
  console.log("  ✔️  backend/.env already exists.");
}

// Step 2: Install Node Dependencies
console.log("\n[2/5] Checking dependencies...");
function checkNodeModules(dir, label) {
  const modulesPath = path.join(dir, "node_modules");
  if (!fs.existsSync(modulesPath)) {
    console.log(`  🔍  node_modules missing in ${label}. Installing dependencies (this may take a minute)...`);
    try {
      execSync("npm install", { cwd: dir, stdio: "ignore" });
      console.log(`  ✔️  Successfully installed ${label} dependencies.`);
    } catch (err) {
      console.log(`  ⚠️  Automated npm install failed in '${label}'.`);
      console.log(`      This is typically due to local network connectivity or proxy issues (e.g. ECONNRESET).`);
      console.log(`      To fix this, please run manually:`);
      console.log(`        cd ${label}`);
      console.log(`        npm install`);
    }
  } else {
    console.log(`  ✔️  ${label} dependencies already installed.`);
  }
}

checkNodeModules(BACKEND_DIR, "backend");
checkNodeModules(FRONTEND_DIR, "frontend");

// Step 3: Parse Environment Config
console.log("\n[3/5] Auditing environment parameters...");
let envConfig = {};
try {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.\-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let val = match[2] || "";
      // clean quotes/comments
      val = val.replace(/["']/g, "").split("#")[0].trim();
      envConfig[match[1]] = val;
    }
  });
} catch (err) {
  console.error("  ❌  Could not parse backend/.env:", err.message);
}

const isSupabaseConfigured = envConfig.SUPABASE_URL && envConfig.SUPABASE_URL !== "https://your-project.supabase.co";
const isGeminiConfigured = envConfig.GEMINI_API_KEY && envConfig.GEMINI_API_KEY !== "your_gemini_api_key_here";

console.log(`  Database url: ${isSupabaseConfigured ? "Configured" : "Placeholder"}`);
console.log(`  Gemini key: ${isGeminiConfigured ? "Configured" : "Placeholder"}`);

// Step 4: Database Auto-Installer if Connection String is available
console.log("\n[4/5] Checking Database Schema installation...");
if (isSupabaseConfigured) {
  if (envConfig.DATABASE_URL) {
    console.log("  🔌  Direct database connection string detected. Attempting automatic SQL table builds...");
    try {
      // Install pg dependency if missing in backend
      const backendPackage = JSON.parse(fs.readFileSync(path.join(BACKEND_DIR, "package.json"), "utf-8"));
      if (!backendPackage.dependencies.pg) {
        console.log("  📦  Installing pg connector in backend...");
        execSync("npm install pg --save", { cwd: BACKEND_DIR, stdio: "inherit" });
      }

      const { Client } = require(path.join(BACKEND_DIR, "node_modules", "pg"));
      const client = new Client({ connectionString: envConfig.DATABASE_URL });
      
      const sqlSchema = fs.readFileSync(path.join(BACKEND_DIR, "db", "schema.sql"), "utf-8");
      
      client.connect();
      client.query(sqlSchema, (err, res) => {
        if (err) {
          console.error("  ❌  Failed to run SQL schema:", err.message);
        } else {
          console.log("  ✔️  Database tables and indices created successfully!");
        }
        client.end();
      });
    } catch (err) {
      console.log("  ⚠️  Automatic schema setup failed. You can still paste schema.sql in Supabase SQL editor:", err.message);
    }
  } else {
    console.log("  ℹ️   No DATABASE_URL found in .env. To automate table builds, add:\n      DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres\n      Otherwise, paste backend/db/schema.sql in the Supabase web dashboard.");
  }
} else {
  console.log("  ⚠️  Supabase is not configured yet. Add your credentials inside backend/.env.");
}

// Step 5: Test Pings if keys are active
console.log("\n[5/5] Testing credentials connectivity...");
if (isGeminiConfigured) {
  console.log("  🧠  Pinging Gemini API...");
  try {
    const { GoogleGenerativeAI } = require(path.join(BACKEND_DIR, "node_modules", "@google/generative-ai"));
    const genAI = new GoogleGenerativeAI(envConfig.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: envConfig.GEMINI_MODEL || "gemini-2.5-flash" });
    
    model.generateContent("Respond with the single word: OK")
      .then((res) => {
        console.log("  ✔️  Gemini Connection verified. Result:", res.response.text().trim());
        finalize();
      })
      .catch((err) => {
        console.error("  ❌  Gemini ping failed:", err.message);
        finalize();
      });
  } catch (err) {
    console.error("  ❌  Could not initialize Gemini test:", err.message);
    finalize();
  }
} else {
  console.log("  🧠  Gemini not configured. Skipping connection test.");
  finalize();
}

function finalize() {
  console.log("\n=============================================");
  console.log("   SETUP DONE. NEXT STEPS:");
  console.log("   1. Open command prompts and start servers:");
  console.log("      Backend: cd backend; npm run dev");
  console.log("      Frontend: cd frontend; npm run dev");
  console.log("   2. Browse locally on: http://localhost:5173");
  console.log("=============================================\n");
}

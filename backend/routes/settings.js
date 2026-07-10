const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const ENV_PATH = path.join(__dirname, "..", ".env");
const ENV_EXAMPLE_PATH = path.join(__dirname, "..", ".env.example");

// Helper to parse .env file
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const envVars = {};
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.substring(0, idx).trim();
        const value = trimmed.substring(idx + 1).trim();
        envVars[key] = value;
      }
    }
  }
  return envVars;
}

router.get("/env", (req, res) => {
  try {
    // If .env doesn't exist, we fall back to .env.example
    const envVars = parseEnvFile(fs.existsSync(ENV_PATH) ? ENV_PATH : ENV_EXAMPLE_PATH);
    res.json(envVars);
  } catch (error) {
    console.error("Failed to read env:", error);
    res.status(500).json({ error: "Failed to read environment variables" });
  }
});

router.post("/env", (req, res) => {
  try {
    const updates = req.body;
    
    let content = "";
    if (fs.existsSync(ENV_PATH)) {
      content = fs.readFileSync(ENV_PATH, "utf-8");
    } else if (fs.existsSync(ENV_EXAMPLE_PATH)) {
      content = fs.readFileSync(ENV_EXAMPLE_PATH, "utf-8");
    }

    const lines = content.split("\n");
    const newLines = [];
    const updatedKeys = new Set();

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const idx = trimmed.indexOf("=");
        if (idx !== -1) {
          const key = trimmed.substring(0, idx).trim();
          if (updates[key] !== undefined) {
            newLines.push(`${key}=${updates[key]}`);
            updatedKeys.add(key);
            continue;
          }
        }
      }
      newLines.push(line);
    }

    // Append any new keys that weren't in the file
    for (const [key, value] of Object.entries(updates)) {
      if (!updatedKeys.has(key)) {
        newLines.push(`${key}=${value}`);
      }
    }

    fs.writeFileSync(ENV_PATH, newLines.join("\n"), "utf-8");
    
    res.json({ success: true, message: "Environment variables updated" });
    
    // Note: If using nodemon, the process will auto-restart when .env changes.
  } catch (error) {
    console.error("Failed to write env:", error);
    res.status(500).json({ error: "Failed to update environment variables" });
  }
});

module.exports = router;

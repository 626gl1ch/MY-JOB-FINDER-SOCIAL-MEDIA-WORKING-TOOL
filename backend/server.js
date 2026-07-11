require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");

const chatRoutes = require("./routes/chat");
const composeRoutes = require("./routes/compose");
const publishRoutes = require("./routes/publish");
const groupsRoutes = require("./routes/groups");
const filesRoutes = require("./routes/files");
const scheduleRoutes = require("./routes/schedule");
const { startScheduler } = require("./services/scheduler");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));
app.use(fileUpload());

app.get("/api/health", (req, res) => res.json({ ok: true, name: "Glitch Broadcast API" }));

app.use("/api/chat", chatRoutes);
app.use("/api/compose", composeRoutes);
app.use("/api/publish", publishRoutes);
app.use("/api/groups", groupsRoutes);
app.use("/api/files", filesRoutes);
app.use("/api/schedule", scheduleRoutes);


const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`Glitch Broadcast API running on http://localhost:${PORT}`);
  startScheduler();
});

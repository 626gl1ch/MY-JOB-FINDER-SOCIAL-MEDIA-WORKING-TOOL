const express = require("express");
const router = express.Router();
const gemini = require("../services/gemini");
const { getSupabase } = require("../services/supabase");

// GET last 50 messages
router.get("/", async (req, res) => {
  const supabase = getSupabase(req);
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(50);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST a new message, get the assistant's reply
router.post("/", async (req, res) => {
  const supabase = getSupabase(req);
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "message is required" });

  try {
    const { data: history } = await supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(20);

    const reply = await gemini.chat(req, history || [], message);

    await supabase.from("chat_messages").insert([
      { role: "user", content: message },
      { role: "assistant", content: reply },
    ]);

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

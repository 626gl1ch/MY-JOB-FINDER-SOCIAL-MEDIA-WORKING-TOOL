const express = require("express");
const router = express.Router();
const { getSupabase } = require("../services/supabase");

// Schedule a post for a future time
router.post("/:postId", async (req, res) => {
  const supabase = getSupabase(req);
  const { postId } = req.params;
  const { scheduledFor } = req.body;
  if (!scheduledFor) return res.status(400).json({ error: "scheduledFor is required" });

  const { data, error } = await supabase
    .from("posts")
    .update({ status: "scheduled", scheduled_for: scheduledFor })
    .eq("id", postId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Calendar view: everything scheduled between two dates
router.get("/calendar", async (req, res) => {
  const supabase = getSupabase(req);
  const { from, to } = req.query;
  let query = supabase
    .from("posts")
    .select("*, post_variants(*)")
    .eq("status", "scheduled")
    .order("scheduled_for", { ascending: true });

  if (from) query = query.gte("scheduled_for", from);
  if (to) query = query.lte("scheduled_for", to);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;

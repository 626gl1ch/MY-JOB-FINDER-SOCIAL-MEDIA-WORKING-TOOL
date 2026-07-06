const express = require("express");
const router = express.Router();
const supabase = require("../services/supabase");
const { assistedPostToGroup } = require("../services/puppeteerPoster");

// Add a variant to the assisted posting queue for a specific group
router.post("/queue", async (req, res) => {
  const { variantId, groupUrl } = req.body;
  if (!variantId || !groupUrl) {
    return res.status(400).json({ error: "variantId and groupUrl are required" });
  }

  const { data, error } = await supabase
    .from("assisted_posting_queue")
    .insert({ post_variant_id: variantId, group_url: groupUrl })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// View the current queue
router.get("/queue", async (req, res) => {
  const { data, error } = await supabase
    .from("assisted_posting_queue")
    .select("*, post_variants(*)")
    .order("created_at", { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Run the next queued item: opens a visible browser window,
// fills in the post, and waits for you to click Post yourself.
router.post("/queue/:id/run", async (req, res) => {
  const { id } = req.params;
  const { imagePath } = req.body;

  const { data: item, error } = await supabase
    .from("assisted_posting_queue")
    .select("*, post_variants(*)")
    .eq("id", id)
    .single();
  if (error || !item) return res.status(404).json({ error: "Queue item not found" });

  await supabase
    .from("assisted_posting_queue")
    .update({ status: "in_progress", updated_at: new Date().toISOString() })
    .eq("id", id);

  const variant = item.post_variants;
  const fullText = [variant.content, (variant.hashtags || []).join(" ")]
    .filter(Boolean)
    .join("\n\n");

  const result = await assistedPostToGroup({
    groupUrl: item.group_url,
    content: fullText,
    imagePath,
  });

  await supabase
    .from("assisted_posting_queue")
    .update({
      status: result.status,
      log: result.log,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  res.json(result);
});

// Mark an item as done once you've clicked Post in the browser yourself
router.post("/queue/:id/confirm", async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("assisted_posting_queue")
    .update({ status: "done", updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });

  await supabase
    .from("post_variants")
    .update({ publish_status: "posted", posted_at: new Date().toISOString() })
    .eq("id", data.post_variant_id);

  res.json(data);
});

module.exports = router;

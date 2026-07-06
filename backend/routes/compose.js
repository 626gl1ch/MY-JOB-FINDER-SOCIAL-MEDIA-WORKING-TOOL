const express = require("express");
const router = express.Router();
const gemini = require("../services/gemini");
const supabase = require("../services/supabase");

// Create a post idea + generate platform variants in one call
router.post("/generate", async (req, res) => {
  const { title, baseContent, platforms, brandVoiceNotes } = req.body;
  if (!baseContent || !platforms?.length) {
    return res.status(400).json({ error: "baseContent and platforms[] are required" });
  }

  try {
    const { data: post, error: postErr } = await supabase
      .from("posts")
      .insert({ title, base_content: baseContent })
      .select()
      .single();
    if (postErr) throw postErr;

    const { variants } = await gemini.generateVariants(baseContent, platforms, brandVoiceNotes);

    const rows = variants.map((v) => ({
      post_id: post.id,
      platform: v.platform,
      content: v.content,
      hashtags: v.hashtags || [],
    }));

    const { data: savedVariants, error: varErr } = await supabase
      .from("post_variants")
      .insert(rows)
      .select();
    if (varErr) throw varErr;

    res.json({ post, variants: savedVariants });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List all posts with their variants
router.get("/", async (req, res) => {
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*, post_variants(*)")
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(posts);
});

// Edit a single variant's content before publishing
router.patch("/variant/:id", async (req, res) => {
  const { id } = req.params;
  const { content, hashtags, target_group_name, target_group_url, location_tag } = req.body;

  const { data, error } = await supabase
    .from("post_variants")
    .update({ content, hashtags, target_group_name, target_group_url, location_tag })
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;

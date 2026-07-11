const express = require("express");
const router = express.Router();
const { getSupabase } = require("../services/supabase");
const meta = require("../services/meta");
const linkedin = require("../services/linkedin");

// Publish a single variant via its platform's official API
router.post("/:variantId", async (req, res) => {
  const supabase = getSupabase(req);
  const { variantId } = req.params;
  const { imageUrl } = req.body;

  const { data: variant, error } = await supabase
    .from("post_variants")
    .select("*")
    .eq("id", variantId)
    .single();
  if (error || !variant) return res.status(404).json({ error: "Variant not found" });

  try {
    let result;
    const fullText = [variant.content, (variant.hashtags || []).join(" ")]
      .filter(Boolean)
      .join("\n\n");

    switch (variant.platform) {
      case "facebook_page":
        result = await meta.postToFacebookPage(req, { message: fullText, imageUrl });
        break;
      case "instagram":
        result = await meta.postToInstagram(req, {
          caption: fullText,
          imageUrl,
          locationId: variant.location_tag,
        });
        break;
      case "linkedin":
        result = await linkedin.postToLinkedIn(req, { text: fullText });
        break;
      case "facebook_group":
        return res.status(400).json({
          error:
            "Facebook Groups can't be published via API. Use POST /api/groups/queue to send this to assisted posting instead.",
        });
      default:
        return res.status(400).json({ error: `Unsupported platform: ${variant.platform}` });
    }

    await supabase
      .from("post_variants")
      .update({
        publish_status: "posted",
        platform_post_id: result.platform_post_id,
        posted_at: new Date().toISOString(),
      })
      .eq("id", variantId);

    res.json({ success: true, ...result });
  } catch (err) {
    await supabase
      .from("post_variants")
      .update({ publish_status: "failed", error_message: err.message })
      .eq("id", variantId);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

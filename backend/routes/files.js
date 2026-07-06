const express = require("express");
const router = express.Router();
const supabase = require("../services/supabase");
const gemini = require("../services/gemini");

// List content vault items, optionally filtered by folder
router.get("/", async (req, res) => {
  const { folder } = req.query;
  let query = supabase.from("content_items").select("*").order("created_at", { ascending: false });
  if (folder) query = query.eq("folder", folder);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Upload a file to Supabase Storage and register it in content_items
router.post("/upload", async (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const file = req.files.file;
  const folder = req.body.folder || "general";
  const path = `${folder}/${Date.now()}-${file.name}`;

  try {
    const { error: uploadErr } = await supabase.storage
      .from("content-vault")
      .upload(path, file.data, { contentType: file.mimetype });
    if (uploadErr) throw uploadErr;

    const { data: urlData } = supabase.storage.from("content-vault").getPublicUrl(path);

    let altText = null;
    if (file.mimetype.startsWith("image/")) {
      try {
        altText = await gemini.generateAltText(file.data.toString("base64"), file.mimetype);
      } catch (_) {
        // alt text generation is best-effort, don't block the upload on it
      }
    }

    const { data: item, error: dbErr } = await supabase
      .from("content_items")
      .insert({
        name: file.name,
        folder,
        file_url: urlData.publicUrl,
        file_type: file.mimetype.startsWith("image/") ? "image" : "document",
        notes: altText,
      })
      .select()
      .single();
    if (dbErr) throw dbErr;

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  const { error } = await supabase.from("content_items").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;

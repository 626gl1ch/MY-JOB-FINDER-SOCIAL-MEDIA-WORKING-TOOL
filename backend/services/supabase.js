const { createClient } = require("@supabase/supabase-js");

const getSupabase = (req) => {
  const url = req.headers['x-supabase-url'] || process.env.SUPABASE_URL;
  const key = req.headers['x-supabase-key'] || process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    throw new Error("Missing Supabase credentials in request headers or environment variables.");
  }
  
  return createClient(url, key);
};

module.exports = { getSupabase };

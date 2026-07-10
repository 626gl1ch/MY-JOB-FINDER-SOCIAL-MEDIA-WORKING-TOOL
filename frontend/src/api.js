const getBaseUrl = () => {
  return localStorage.getItem("backendUrl") || import.meta.env.VITE_API_URL || "http://localhost:8787/api";
};

async function req(path, options = {}) {
  const BASE = getBaseUrl();
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Chat
  getChatHistory: () => req("/chat"),
  sendChat: (message) => req("/chat", { method: "POST", body: JSON.stringify({ message }) }),

  // Compose
  generateVariants: (payload) =>
    req("/compose/generate", { method: "POST", body: JSON.stringify(payload) }),
  listPosts: () => req("/compose"),
  updateVariant: (id, payload) =>
    req(`/compose/variant/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  // Publish
  publishVariant: (variantId, imageUrl) =>
    req(`/publish/${variantId}`, { method: "POST", body: JSON.stringify({ imageUrl }) }),

  // Groups (assisted posting)
  queueGroupPost: (variantId, groupUrl) =>
    req("/groups/queue", { method: "POST", body: JSON.stringify({ variantId, groupUrl }) }),
  getGroupQueue: () => req("/groups/queue"),
  runGroupPost: (id, imagePath) =>
    req(`/groups/queue/${id}/run`, { method: "POST", body: JSON.stringify({ imagePath }) }),
  confirmGroupPost: (id) => req(`/groups/queue/${id}/confirm`, { method: "POST" }),

  // Files
  listFiles: (folder) => req(`/files${folder ? `?folder=${folder}` : ""}`),
  deleteFile: (id) => req(`/files/${id}`, { method: "DELETE" }),
  uploadFile: async (file, folder = "general") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    const BASE = getBaseUrl();
    const res = await fetch(`${BASE}/files/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Upload failed: ${res.status}`);
    }
    return res.json();
  },

  // Schedule
  schedulePost: (postId, scheduledFor) =>
    req(`/schedule/${postId}`, { method: "POST", body: JSON.stringify({ scheduledFor }) }),
  getCalendar: (from, to) => req(`/schedule/calendar?from=${from || ""}&to=${to || ""}`),

  // Settings
  getSettingsEnv: () => req("/settings/env"),
  updateSettingsEnv: (payload) =>
    req("/settings/env", { method: "POST", body: JSON.stringify(payload) }),
};

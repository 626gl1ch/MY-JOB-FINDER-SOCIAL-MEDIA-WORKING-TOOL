// Usage and Subscription Utility for Glitch Broadcast

export function getUsageCount() {
  const count = localStorage.getItem("glitch_usage_count");
  return count ? parseInt(count, 10) : 0;
}

export function incrementUsageCount() {
  if (isSubscribed()) return;
  const count = getUsageCount();
  localStorage.setItem("glitch_usage_count", (count + 1).toString());
  // Dispatch event to notify components
  window.dispatchEvent(new Event("glitch-usage-change"));
}

export function isSubscribed() {
  // Check if user is either subscribed or admin
  return localStorage.getItem("glitch_subscribed") === "true" || isAdmin();
}

export function setSubscribed(val) {
  localStorage.setItem("glitch_subscribed", val ? "true" : "false");
  window.dispatchEvent(new Event("glitch-usage-change"));
}

export function isAdmin() {
  return localStorage.getItem("glitch_admin_active") === "true";
}

export function setAdmin(val) {
  localStorage.setItem("glitch_admin_active", val ? "true" : "false");
  if (val) {
    localStorage.setItem("glitch_subscribed", "true");
  }
  window.dispatchEvent(new Event("glitch-usage-change"));
}

export function checkUsageLimit() {
  if (isSubscribed()) return false;
  return getUsageCount() >= 3;
}

export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyAdminCredentials(email, password) {
  const trimmedEmail = email.trim().toLowerCase();
  const targetEmail = "daniellancce1@gmail.com";
  const targetPasswordHash = "1faabf12ca6cd4860455eeb22b4fd4ff69a999ee23c0006790269e0f201b88a5";

  if (trimmedEmail !== targetEmail) {
    return false;
  }

  const inputHash = await hashPassword(password);
  return inputHash === targetPasswordHash;
}

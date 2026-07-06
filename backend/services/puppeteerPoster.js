/**
 * ASSISTED POSTING (Facebook Groups fallback)
 * ---------------------------------------------------------------
 * Meta's Graph API does not allow third-party apps to post into
 * Facebook Groups on your behalf. This module is the fallback for
 * that gap — but it is deliberately NOT a full auto-poster.
 *
 * Design decision (read this before changing it):
 *   The browser opens VISIBLY, using your own logged-in Chrome
 *   profile. The script fills in the caption (and attaches an
 *   image, if given) inside the group's post composer, then it
 *   STOPS and waits for you to review and click "Post" yourself.
 *
 * Why stop short of auto-clicking Publish:
 *   - Facebook's Terms of Service prohibit automated / scripted
 *     actions on the platform. Autofilling a box you're about to
 *     review is a much lower-risk convenience than a script that
 *     silently publishes on your behalf while you're not looking.
 *   - It keeps a human in the loop for every group post, which
 *     also protects you from an AI-generated caption going out
 *     with a mistake in it.
 *   - Running headed (not headless) with your real profile also
 *     behaves far more like a normal user session than a bot farm.
 *
 * If a selector below stops matching, Facebook has changed its DOM.
 * Update the `SELECTORS` arrays — each one is tried in order until
 * one is found.
 */

const puppeteer = require("puppeteer");
const path = require("path");

let browserInstance = null;

const SELECTORS = {
  postBox: [
    'div[aria-label="Create a public post…"]',
    'div[aria-label="Write something…"]',
    'div[role="button"][aria-label*="Write something"]',
  ],
  textArea: [
    'div[aria-label="Create a public post…"][contenteditable="true"]',
    'div[contenteditable="true"][data-lexical-editor="true"]',
  ],
  photoButton: [
    'div[aria-label="Photo/video"]',
    'input[type="file"][accept*="image"]',
  ],
};

async function getBrowser() {
  if (browserInstance) return browserInstance;

  browserInstance = await puppeteer.launch({
    headless: process.env.PUPPETEER_HEADLESS === "true",
    userDataDir:
      process.env.PUPPETEER_USER_DATA_DIR || path.join(__dirname, "..", "browser-profile"),
    defaultViewport: null,
    args: ["--start-maximized"],
  });

  return browserInstance;
}

async function findFirst(page, selectors, timeout = 8000) {
  for (const sel of selectors) {
    try {
      const el = await page.waitForSelector(sel, { timeout: timeout / selectors.length });
      if (el) return el;
    } catch (_) {
      // try next selector
    }
  }
  return null;
}

// Native helper to handle delays since page.waitForTimeout is deprecated in modern Puppeteer
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Opens the group, fills the composer, attaches an image if provided,
 * and leaves it open for manual review + publish.
 *
 * Returns a status the UI can show: "awaiting_manual_click" on success,
 * or "failed" with a log message if something didn't match.
 */
async function assistedPostToGroup({ groupUrl, content, imagePath }) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  const log = [];

  try {
    log.push(`Navigating to ${groupUrl}`);
    await page.goto(groupUrl, { waitUntil: "networkidle2", timeout: 45000 });

    // Confirm we're logged in — if Facebook redirected to a login wall,
    // stop here and tell the user to log in inside the opened window.
    if (page.url().includes("/login")) {
      log.push(
        "Not logged in. Log into Facebook in the opened browser window, then retry this post."
      );
      return { status: "needs_login", log: log.join("\n"), page };
    }

    log.push("Opening post composer…");
    const trigger = await findFirst(page, SELECTORS.postBox);
    if (!trigger) {
      log.push("Could not find the post composer trigger. Facebook may have changed its layout.");
      return { status: "failed", log: log.join("\n") };
    }
    await trigger.click();
    await wait(1200);

    log.push("Typing caption…");
    const textArea = await findFirst(page, SELECTORS.textArea);
    if (!textArea) {
      log.push("Could not find the text editor after opening composer.");
      return { status: "failed", log: log.join("\n") };
    }
    await textArea.click();
    await page.keyboard.type(content, { delay: 12 });

    if (imagePath) {
      log.push("Attaching image…");
      const fileInput = await page.$('input[type="file"]');
      if (fileInput) {
        await fileInput.uploadFile(imagePath);
        await wait(2500);
      } else {
        log.push("Photo upload control not found — attach the image manually.");
      }
    }

    log.push(
      "Composer is filled in. Review the post in the open browser window, then click Post yourself."
    );
    return { status: "awaiting_manual_click", log: log.join("\n") };
  } catch (err) {
    log.push(`Error: ${err.message}`);
    return { status: "failed", log: log.join("\n") };
  }
  // Note: page is intentionally NOT closed here — the human needs it open to click Post.
}

async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

module.exports = { assistedPostToGroup, closeBrowser };

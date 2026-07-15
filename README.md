# Glitch Broadcast

An AI-powered social media command center for Glitch EnterPrice — draft once
with Gemini, adapt per platform, publish to Facebook Page / Instagram /
LinkedIn via their official APIs, and handle Facebook Groups through an
assisted-posting fallback (since Meta doesn't allow apps to auto-post into
Groups).

```
glitch-broadcast/
├── backend/     Node/Express API (Gemini, Supabase, Meta, LinkedIn, Puppeteer)
└── frontend/    React + Vite + Tailwind UI
```

## 1. What's real here vs. what you need to configure

Every file in this project is working code, not a mockup. What you need to
supply before it runs end-to-end:

| Piece | Required for | Where to get it |
|---|---|---|
| Gemini API key | AI chat, content generation, alt text | https://aistudio.google.com/apikey (free) |
| Supabase project | Database + file storage | https://supabase.com (free tier works) |
| Meta app + Page token | Facebook Page & Instagram posting | https://developers.facebook.com |
| LinkedIn app + token | LinkedIn posting | https://www.linkedin.com/developers/apps |
| Chrome (via Puppeteer) | Assisted Facebook Group posting | installs automatically with `npm install` |

You can run the app with just the Gemini key and Supabase configured — the
Chat, Composer, and Content Vault sections all work immediately. Add the
Meta/LinkedIn tokens later, one platform at a time, whenever you're ready to
go live on each.

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# fill in .env with your keys — see the table above
```

**Set up the database:** open your Supabase project's SQL editor and run
`backend/db/schema.sql`. Then create a public storage bucket named
`content-vault` (Storage → New bucket → make it public) for uploaded media.

**Run it:**

```bash
npm run dev
```

The API starts on `http://localhost:8787` and includes a background
scheduler that checks every minute for posts you've scheduled — it
auto-publishes to Facebook Page / Instagram / LinkedIn when their time
arrives. Facebook Group posts are never auto-published; they always land in
the assisted-posting queue for you to click yourself.

## 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`. If your backend runs somewhere other than
`localhost:8787`, create a `frontend/.env` with:

```
VITE_API_URL=http://your-backend-host:8787/api
```

## 4. How assisted posting for Facebook Groups actually works

This is the piece you specifically asked for. Here's the real flow:

1. In **Composer**, write your idea, select "Facebook Group" as a target,
   paste the group's URL, and generate variants.
2. Click **"Queue for assisted posting"** on that variant.
3. Go to the **Groups** tab. Click **"Open & fill composer"** on the queued
   item.
4. A real, visible Chrome window opens (using a saved browser profile so you
   only log into Facebook once, ever). It navigates to the group and types
   your caption into the post box — and attaches an image if you gave one.
5. **It stops there on purpose.** You review what's in the box, then click
   **Post** yourself, inside that browser window.
6. Back in the app, click **"I clicked Post — mark done"** to log it.

**Why it doesn't auto-click Post for you:** Facebook's Terms of Service
prohibit scripted/automated actions on the platform, and a bot that silently
publishes to a Group while you're not watching is the kind of pattern that
gets accounts flagged or banned. Autofilling a box you're about to read
before publishing it yourself is a materially different — and much safer —
kind of automation. If Facebook changes its page layout and the composer
selectors in `backend/services/puppeteerPoster.js` stop matching, that file
has comments explaining exactly which selectors to update.

## 5. Platform API realities worth knowing

- **Facebook Page / Instagram Business**: full official API support via
  Meta's Graph API — auto-publish and scheduling both work.
- **LinkedIn**: official API support for your own profile/company page, once
  your app is approved for the `w_member_social` scope.
- **Facebook Groups**: no official posting API for third-party apps — this
  is why the assisted-posting flow above exists.
- **Location tagging**: supported for Instagram via `location_id` on the
  media container; Facebook Page posts have more limited location support.

## 6. Gemini free tier notes

The backend defaults to `gemini-2.5-flash`, which stays on Google's free
tier at reasonable request volumes (check your live limits in AI Studio —
Google adjusts these periodically). If you outgrow it, Flash is inexpensive
on the paid tier too. Avoid `gemini-2.5-pro` unless you've enabled billing —
its free-tier daily quota is very small.

## 7. Suggested next steps

- Deploy the backend to your Oracle Cloud ARM VM (same box running your
  trading bots) so scheduled posts fire even when your laptop is off.
- Add a `.clinerules`-style prompt library in Composer for your recurring
  content types (SnipeJob build-in-public updates, trading insight posts).
- Wire up analytics pulls from the Graph API and LinkedIn API to replace the
  placeholder stat cards on the Dashboard with real engagement numbers.

## 8. Building the Android APK

This project uses Capacitor to package the React frontend into an Android application. 

To build the APK locally on Windows:
1. Ensure you have run `npm install` in the frontend directory.
2. Run the provided PowerShell script from the root of the project:
   ```powershell
   .\build_android.ps1
   ```
   *(Alternatively, use `.\build_with_java21.ps1` if you need to use the specific JDK 21 toolchain included in the project).*
3. The script will automatically install necessary SDKs, sync Capacitor, and compile the APK. 
4. The generated APK will be output to `frontend/android/app/build/outputs/apk/debug/app-debug.apk` (or similar depending on the build type).

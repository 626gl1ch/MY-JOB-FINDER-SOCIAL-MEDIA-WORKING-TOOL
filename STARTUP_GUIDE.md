# Master Setup & Operations Guide: Glitch Broadcast

This is the single, unified reference file containing the entire setup, configuration, OAuth token exchanges, startup commands, and user manual to make **Glitch Broadcast** fully operational on your local machine.

---

## 1. Overview & Architecture

Glitch Broadcast is a local-first, zero-cost social media automated command center. It operates as follows:
* **Frontend**: React/Vite/Tailwind runs on `http://localhost:5173`.
* **Backend API**: Node/Express runs on `http://localhost:8787` (includes a background cron scheduler checking schedules every minute).
* **Database & File Storage**: Hosted on **Supabase Free Tier** (PostgreSQL database & S3-compatible public bucket).
* **Generative Brain**: Powered by the **Google AI Studio Free Tier** (Gemini 2.5 Flash).
* **Automation Fallback**: Headed Chrome launched via **Puppeteer** to autofill Facebook Group forms and await final manual publishing (ToS safe).

---

## 2. Prerequisites & Automated Installation

### 2.1 Prerequisites
Ensure your local machine has [Node.js](https://nodejs.org) (v18 or higher) installed.

### 2.2 Run Setup Automation
Open your terminal in the project root directory and run the setup automator:
```bash
node setup.js
```
This script automatically performs the following tasks:
1. Copies `backend/.env.example` into a new `backend/.env` file.
2. Checks for `node_modules` folders and runs silent package installations (`npm install`) in both `frontend` and `backend` directories.
3. Once you input environment credentials in `backend/.env`, it will run connectivity diagnostics checking Gemini and Supabase API pings.

---

## 3. Database Configurations (Supabase)

### 3.1 Setup Tables (Option A: Automated)
1. Open `backend/.env` and locate the `DATABASE_URL` line.
2. Paste your Supabase direct connection string (e.g. `postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres`).
3. Re-run `node setup.js`. The script will automatically install PostgreSQL connections and build all schema tables and indices.

### 3.2 Setup Tables (Option B: Manual Copy-Paste)
1. Go to your Supabase web dashboard ➡️ Select your project.
2. Click **SQL Editor** ➡️ **New Query**.
3. Copy the full SQL schema block below, paste it into the editor, and click **Run**:

```sql
create extension if not exists "uuid-ossp";

create table if not exists content_items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  folder text default 'general',
  file_url text,
  file_type text,
  tags text[] default '{}',
  notes text,
  created_at timestamptz default now()
);

create table if not exists posts (
  id uuid primary key default uuid_generate_v4(),
  title text,
  base_content text not null,
  status text default 'draft',
  scheduled_for timestamptz,
  created_at timestamptz default now()
);

create table if not exists post_variants (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references posts(id) on delete cascade,
  platform text not null,
  content text not null,
  hashtags text[] default '{}',
  media_ids uuid[] default '{}',
  target_group_name text,
  target_group_url text,
  location_tag text,
  publish_status text default 'pending',
  platform_post_id text,
  error_message text,
  posted_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists chat_messages (
  id uuid primary key default uuid_generate_v4(),
  role text not null,
  content text not null,
  created_at timestamptz default now()
);

create table if not exists assisted_posting_queue (
  id uuid primary key default uuid_generate_v4(),
  post_variant_id uuid references post_variants(id) on delete cascade,
  group_url text not null,
  status text default 'queued',
  log text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_post_variants_post_id on post_variants(post_id);
create index if not exists idx_assisted_queue_status on assisted_posting_queue(status);
```

### 3.3 Setup Storage Bucket (Required for Image attachments)
1. Go to Supabase Dashboard ➡️ **Storage** ➡️ click **New Bucket**.
2. Name the bucket `content-vault` (must be lowercase).
3. Toggle the bucket setting to **Public** (allowing Meta/LinkedIn to read uploaded image assets).
4. **Set Bucket Policies**:
   - Go to Storage ➡️ Policies ➡️ select `content-vault` bucket.
   - Click **New Policy** ➡️ Select **Insert, Update, Delete, Select** ➡️ set Target Role to **Public / Anon** (or choose template policy **Allow all operations for everyone**). Save policy.

---

## 4. Manual OAuth Token Generations (Meta & LinkedIn)

To allow the local backend to publish posts without daily re-authentications, you must generate **long-lived tokens**.

### 4.1 Meta Access Tokens (Facebook Pages & Instagram Business)
1. Go to **developers.facebook.com** and create an app (Choose type: **Business**).
2. Go to **Tools ➡️ Graph API Explorer**. Select your app.
3. Under **Permissions**, add: `pages_manage_posts`, `pages_read_engagement`, `instagram_basic`, `instagram_content_publish`.
4. Click **Generate Access Token**. Copy this short-lived token.
5. **Convert to 60-Day User Token**:
   Run this GET request in your web browser:
   ```
   https://graph.facebook.com/v20.0/oauth/access_token?
       grant_type=fb_exchange_token&
       client_id={your-meta-app-id}&
       client_secret={your-meta-app-secret}&
       fb_exchange_token={your-short-lived-token}
   ```
   Copy the returned `access_token` string.
6. **Convert to Permanent Page Access Token**:
   Run this GET request:
   ```
   https://graph.facebook.com/v20.0/me/accounts?access_token={your-60-day-user-token}
   ```
   Locate your target Facebook Page ID and copy the corresponding `access_token`. This token never expires. Save it inside `backend/.env` under `META_PAGE_ACCESS_TOKEN`.
7. **Instagram Account ID**:
   Run this GET request to find your connected Instagram Business ID:
   ```
   https://graph.facebook.com/v20.0/{your-facebook-page-id}?fields=instagram_business_account&access_token={your-page-access-token}
   ```
   Copy the `instagram_business_account.id`. Save it under `META_IG_BUSINESS_ACCOUNT_ID`.

### 4.2 LinkedIn Share Access Tokens
1. Create a developer app at **linkedin.com/developers/apps**. Link it to an active LinkedIn page.
2. In the **Products** tab, request access to **Share on LinkedIn** (enables `w_member_social`).
3. In your app settings, add redirect URL: `http://localhost:8787/api/auth/linkedin/callback`.
4. **Get Authorization Code**:
   Go to this URL in your web browser, approve the pop-up, and copy the `code` parameter returned in the URL bar:
   ```
   https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id={your-client-id}&redirect_uri=http://localhost:8787/api/auth/linkedin/callback&state=glitchState&scope=w_member_social
   ```
5. **Exchange Code for 60-Day Token**:
   Execute this POST request using Postman or cURL:
   ```bash
   curl -X POST https://www.linkedin.com/oauth/v2/accessToken \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "grant_type=authorization_code" \
     -d "code={copied-code}" \
     -d "redirect_uri=http://localhost:8787/api/auth/linkedin/callback" \
     -d "client_id={your-client-id}" \
     -d "client_secret={your-client-secret}"
   ```
   Save the returned `access_token` in `backend/.env` under `LINKEDIN_ACCESS_TOKEN`.

---

## 5. Startup Commands & Processes

### 5.1 Option A: Launching in Development Mode (Separate Terminals)
Open two command prompts to keep active logs running:

* **Terminal 1 (Backend API)**:
  ```bash
  cd backend
  npm run dev
  ```
  *Launches Node API on `http://localhost:8787`.*

* **Terminal 2 (Frontend UI)**:
  ```bash
  cd frontend
  npm run dev
  ```
  *Launches Vite on `http://localhost:5173`.*

Open your browser to: **[http://localhost:5173](http://localhost:5173)**

---

### 5.2 Option B: Launching in Background Daemon Mode (PM2)
To run the server invisibly without terminal windows:

1. Install PM2:
   ```bash
   npm install pm2 -g
   ```
2. Launch backend API:
   ```bash
   cd backend
   pm2 start server.js --name "glitch-backend"
   ```
3. Save daemon task:
   ```bash
   pm2 save
   ```
4. Access frontend development logs using `pm2 logs glitch-backend`.

---

## 6. User Operations Manual

1. **AI Content Adaptation**:
   - Go to **Composer**.
   - Input your raw code updates or backtest metrics.
   - Choose a **Brand Voice Preset** (e.g. *Nigerian Tech Slang* or *Algo Trader*).
   - Tick the target channels (FB Page, Instagram, LinkedIn, FB Group).
   - Click **Generate Platform Adaptations**.
   - Review drafts in the tabbed panel, edit text inline, test A/B versions, and click **Publish** or **Schedule**.
2. **Alt-Text Generator**:
   - Go to **Content Vault**.
   - Upload your backtest chart or UI screenshot.
   - Click **Generate Alt Text**. Gemini will analyze the image and save the accessibility description to the asset.
3. **Assisted Group Publishing**:
   - If a post variant is queued for a Facebook Group, navigate to the **Groups** tab.
   - Click **Open & fill composer**.
   - A visible Chrome window will open. *Note: log in once; your session is cached in `backend/browser-profile`.*
   - Puppeteer will open the group and autofill text/images. Check the app's terminal widget to watch step-by-step logs.
   - **Review the post and click Post manually** inside Chrome.
   - Click **Mark Completed** in the app to update the status.

---

## 7. Diagnostics & Troubleshooting

* **NPM Socket Resets (`ECONNRESET` / Network timeouts)**:
  - Clean local caches and run installations manually:
    ```bash
    cd backend
    npm cache clean --force
    npm install
    ```
* **Vite says "API Latency: Offline"**:
  - The frontend is running in **Demo Mode**. Ensure the backend server on port 8787 is started.
* **Chrome Profile locks**:
  - If Puppeteer crashes claiming the profile is in use, make sure you don't have another automated Chrome window open. Close any orphan Chrome tasks.
* **Facebook Selector Changes**:
  - If the script fails to locate input selector fields, open `backend/services/puppeteerPoster.js` and update `SELECTORS.postBox` or `SELECTORS.textArea` arrays with the new CSS selector from Facebook.

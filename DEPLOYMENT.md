# Bconomy Deployment Guide: Vercel & Supabase

This guide walks you through deploying **Bconomy** publicly to **Vercel** with a **Supabase PostgreSQL** database for accounts, sequential Player IDs (starting from 1), and persistent cloud saves.

---

## 1. Setup Supabase Database

1. Open your [Supabase Dashboard](https://supabase.com/dashboard/project/mlaivuzdwevmzuhxjraw).
2. Click on the **SQL Editor** tab on the left sidebar.
3. Click **New Query**.
4. Open [supabase_schema.sql](supabase_schema.sql) in this repository, copy its entire contents, paste it into the SQL editor, and click **Run**.

This script will:
* Create the `player_state` table with sequential `player_id` starting from 1 (`player_id bigint generated always as identity (start with 1)`).
* Set up Row Level Security (RLS) policies.
* Create the trigger that automatically provisions a new `player_state` record whenever a user signs up.

---

## 2. Deploy to Vercel

### Option A: Via GitHub (Recommended)
1. Push your latest code to your GitHub repository (`https://github.com/prezvious/bconomy.git`):
   ```bash
   git add .
   git commit -m "Add Supabase Auth, Player IDs, and Vercel configuration"
   git push origin main
   ```
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Import your `bconomy` repository.
4. In the **Environment Variables** section, add the following 3 variables:
   * `SUPABASE_URL` = `https://mlaivuzdwevmzuhxjraw.supabase.co`
   * `SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sYWl2dXpkd2V2bXp1aHhqcmF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0MTQ5NDUsImV4cCI6MjEwMjk5MDk0NX0.2FvGex8DNjpzUY7Yeh4DFd7RCBeV3PFlUQ0I8r71nfc`
   * `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sYWl2dXpkd2V2bXp1aHhqcmF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzQxNDk0NSwiZXhwIjoyMTAyOTkwOTQ1fQ.9RZQyeIbOVoj0gTCn8o7OF0UV3iEZtCEn8YUdCg1uA4`
5. Click **Deploy**.

### Option B: Via Vercel CLI
```bash
npm i -g vercel
vercel
```

---

## 3. How Player Accounts & Authentication Work

* **Sign Up / Enlist**: Users register with a **Username** (minimum 3 characters), optional **Email**, and **Password**.
* **Password Strength Meter**: Displays real-time evaluation with 4 color-coded progress bars (*Very weak* $\rightarrow$ *Weak* $\rightarrow$ *Good* $\rightarrow$ *Strong*), Caps Lock detection, and Show/Hide toggle.
* **Sequential Player ID**: Every player is assigned a permanent sequential Player ID starting from 1 (e.g. `Player #1`, `Player #2`, etc.).
* **Sign In**: Players can log in using either their **Username** or **Email** + Password.
* **No Password Reset**: As requested, password reset is disabled.
* **Automatic Cloud Sync**: Progress automatically syncs to Supabase on mutations and can be manually triggered in Settings.

# Vercel Environment Variables

## Required Environment Variables

Add these to your Vercel project (Settings → Environment Variables):

### 1. Google Maps API Key (Required)
```
VITE_FRONTEND_FORGE_API_KEY=your_google_maps_api_key_here
```
**⚠️ Get your actual key from:** [Google Cloud Console](https://console.cloud.google.com/)
**Purpose:** Loads Google Maps on the frontend  
**Where it's used:** `client/src/components/Map.tsx`  
**Note:** Must start with `VITE_` to be exposed to the frontend

### 2. GitHub Token (Required for PR Automation)
```
GITHUB_TOKEN=your_github_personal_access_token_here
```
**⚠️ Get your actual token from:** GitHub Settings → Developer settings → Personal access tokens
**Purpose:** Creates pull requests when users submit updates  
**Where it's used:** `api/gurdwara-updates.ts`  
**Note:** Must have `repo` scope permissions

### 3. GitHub Repository (Optional - has default)
```
GITHUB_REPO=tejvirmann/midwestmisl
```
**Purpose:** Specifies which repository to create PRs in  
**Where it's used:** `api/gurdwara-updates.ts`  
**Default:** `tejvirmann/midwestmisl` (already set in code)  
**Note:** Only add this if you want to override the default

## Optional Environment Variables

These are not required but can be customized:

### VITE_GOOGLE_MAPS_API_KEY
Alternative to `VITE_FRONTEND_FORGE_API_KEY` if you prefer a different variable name.

### VITE_APP_TITLE
```
VITE_APP_TITLE=Midwest Misl
```
**Default:** "App"  
**Purpose:** App title (currently not heavily used)

### VITE_OAUTH_PORTAL_URL & VITE_APP_ID
For OAuth functionality (if you plan to add authentication later).

## How to Add in Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - **Key:** The variable name (e.g., `VITE_FRONTEND_FORGE_API_KEY`)
   - **Value:** The actual value
   - **Environment:** Select all (Production, Preview, Development)
4. Click **Save**
5. **Redeploy** your project for changes to take effect

## Quick Copy-Paste List

For Production, Preview, and Development environments:

```
VITE_FRONTEND_FORGE_API_KEY=your_google_maps_api_key_here
GITHUB_TOKEN=your_github_token_here
GITHUB_REPO=tejvirmann/midwestmisl
```

**⚠️ SECURITY WARNING:** 
- Never commit actual values to Git
- Only store real values in `.env.local` (gitignored) or Vercel environment variables
- If you've already committed secrets, rotate them immediately!

## Important Notes

1. **VITE_ prefix:** All frontend variables must start with `VITE_` to be accessible in the browser
2. **Security:** Never commit these values to Git (they're in `.env.local` which is gitignored)
3. **Redeploy:** After adding environment variables, you must redeploy for them to take effect
4. **GitHub Token:** Make sure your token has `repo` scope to create branches and PRs

## Verification

After deployment, verify:
- ✅ Map loads (check `VITE_FRONTEND_FORGE_API_KEY`)
- ✅ Update form creates PRs (check `GITHUB_TOKEN` and `GITHUB_REPO`)


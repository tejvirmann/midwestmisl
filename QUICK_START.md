# Quick Start Guide

## ✅ Configuration Complete

Your project is now configured with:
- **GitHub Repository:** `tejvirmann/midwestmisl`
- **GitHub Token:** Configured in `.env.local`
- **Google Maps API Key:** Configured

## 🚀 Local Development

### Start the development servers:

```bash
# Run both frontend and API server together
npm run dev:all
```

This will:
- Start Vite dev server on `http://localhost:5173`
- Start Express API server on `http://localhost:3000`
- API endpoint available at: `http://localhost:5173/api/gurdwara-updates`

### Or use Vercel CLI (production-like):

```bash
# Install Vercel CLI (one time)
npm install -g vercel

# Run with Vercel
npm run vercel:dev
```

## 📦 Deploy to Vercel

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import repository: `tejvirmann/midwestmisl`
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (root)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/public`

### Step 3: Add Environment Variables

In Vercel dashboard → Settings → Environment Variables, add:

```
VITE_FRONTEND_FORGE_API_KEY=AIzaSyCH4Ib-ZN2WznaWZf453IZ2BQWEEpJcePE
GITHUB_TOKEN=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
GITHUB_REPO=tejvirmann/midwestmisl
```

**Important:** Add these for **Production**, **Preview**, and optionally **Development**.

### Step 4: Deploy

Click "Deploy" and wait for the build to complete!

## 🧪 Test the API

Once deployed, test the update form:
1. Go to your deployed site
2. Click "Update Map" button
3. Fill out the form and submit
4. Check your GitHub repo for the new PR!

## 📝 Notes

- Your GitHub token is stored in `.env.local` (gitignored - safe!)
- The API will create PRs in `tejvirmann/midwestmisl` repository
- Make sure `gurdwara_data.json` exists in your repo root

## 🔒 Security Reminder

- ✅ `.env.local` is in `.gitignore` - your token won't be committed
- ⚠️ When deploying to Vercel, add the token as an environment variable (not in code)
- ⚠️ Never commit tokens or secrets to GitHub

## 🆘 Troubleshooting

### API not working locally?
- Make sure both servers are running: `npm run dev:all`
- Check that `.env.local` has the GitHub token
- Verify the token has `repo` permissions

### API not working on Vercel?
- Check environment variables are set correctly
- Verify the token has `repo` scope
- Check Vercel function logs in the dashboard

### PR not being created?
- Verify `GITHUB_TOKEN` is set in Vercel
- Check that `GITHUB_REPO` is correct: `tejvirmann/midwestmisl`
- Ensure the token has permission to create PRs


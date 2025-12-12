# Vercel Deployment Guide

This guide will help you deploy your Sikh Map application to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. GitHub account (for repository access)
3. GitHub Personal Access Token (for PR automation)

## Step 1: Install Vercel CLI (Optional, for local testing)

```bash
npm install -g vercel
```

## Step 2: Prepare Your Repository

1. Make sure your code is pushed to GitHub
2. Ensure you have a `.gitignore` that excludes:
   - `node_modules/`
   - `.env.local`
   - `dist/`

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure the project:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (root)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/public`
   - **Install Command:** `npm install`

4. Add Environment Variables:
   - `VITE_FRONTEND_FORGE_API_KEY` - Your Google Maps API key
   - `GITHUB_TOKEN` - Your GitHub Personal Access Token
   - `GITHUB_REPO` - Your repository (e.g., `tejvirmann/midwestmisl`)

5. Click "Deploy"

### Option B: Deploy via CLI

```bash
# Login to Vercel
vercel login

# Deploy
vercel

# For production
vercel --prod
```

## Step 4: Configure Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following:

```
VITE_FRONTEND_FORGE_API_KEY=your_google_maps_api_key
GITHUB_TOKEN=your_github_token
GITHUB_REPO=your-username/your-repo
```

3. Make sure to add them for:
   - Production
   - Preview
   - Development (optional)

4. Redeploy after adding environment variables

## Step 5: Test the Deployment

1. Visit your deployed URL (provided by Vercel)
2. Test the map loading
3. Test the update form submission
4. Check that PRs are being created on GitHub

## Local Development with API

For local development, you have three options:

### Option 1: Use Vercel CLI (Recommended for Production-like Testing)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Run local development server
npm run vercel:dev
# or
vercel dev
```

This will:
- Start your Vite dev server
- Run API routes as serverless functions (same as production)
- Use your local `.env.local` for environment variables
- Most accurately matches production environment

### Option 2: Run Express Server + Vite Together

```bash
# Run both servers together
npm run dev:all
```

This runs:
- Vite dev server on port 5173
- Express server on port 3000
- Vite proxy forwards `/api/*` to Express server

### Option 3: Run Servers Separately

```bash
# Terminal 1: Vite dev server
npm run dev

# Terminal 2: Express API server
npm run dev:api
```

Make sure your `.env.local` has:
```bash
GITHUB_TOKEN=your_token
GITHUB_REPO=your-username/your-repo
```

## Troubleshooting

### API Endpoint Not Working

1. **Check environment variables:**
   - Ensure `GITHUB_TOKEN` is set in Vercel
   - Verify `GITHUB_REPO` format is correct (`owner/repo`)

2. **Check API route:**
   - Verify the file is at `api/gurdwara-updates.ts`
   - Check Vercel function logs in the dashboard

3. **Check CORS:**
   - The `vercel.json` includes CORS headers
   - If issues persist, check browser console for errors

### Build Fails

1. **Check build logs:**
   - Go to Vercel dashboard → Deployments → Click on failed deployment
   - Review build logs for errors

2. **Common issues:**
   - Missing dependencies (check `package.json`)
   - TypeScript errors (run `npm run build` locally first)
   - Environment variables not set

### Map Not Loading

1. **Check API key:**
   - Verify `VITE_FRONTEND_FORGE_API_KEY` is set in Vercel
   - Ensure it's added for Production environment
   - Redeploy after adding

2. **Check browser console:**
   - Look for API key errors
   - Verify the key has proper permissions

## Project Structure for Vercel

```
sikhmap/
├── api/                    # Serverless functions
│   └── gurdwara-updates.ts
├── client/                 # Frontend React app
│   ├── src/
│   └── public/
├── dist/                   # Build output (gitignored)
├── vercel.json            # Vercel configuration
└── package.json
```

## Continuous Deployment

Vercel automatically deploys when you:
- Push to `main` branch (production)
- Push to other branches (preview deployments)
- Open a pull request (preview deployment)

## Custom Domain

1. Go to Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. SSL certificates are automatically provisioned

## Monitoring

- **Function Logs:** Vercel dashboard → Functions tab
- **Analytics:** Vercel dashboard → Analytics tab
- **Real-time Logs:** Use `vercel logs` CLI command

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Discord](https://vercel.com/discord)
- Check function logs in Vercel dashboard for API errors


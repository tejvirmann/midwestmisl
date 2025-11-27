# Fixing UI and Map Issues

## Why the UI Might Be Messed Up

1. **Tailwind CSS Configuration** - The config file was in the wrong location relative to Vite's root directory
2. **CSS Not Loading** - If Tailwind isn't processing correctly, styles won't apply

## Fix Applied

- Moved `tailwind.config.ts` to the `client/` directory where Vite's root is set
- Fixed content paths to be relative to the config file location

## What You Need for the Map to Show Up

### Required: Google Maps API Key

The map component requires a Google Maps API key to function. Without it, you'll see a placeholder message.

### Step-by-Step Setup

1. **Create `.env.local` file in the project root:**
   ```bash
   VITE_FRONTEND_FORGE_API_KEY=your_api_key_here
   VITE_FRONTEND_FORGE_API_URL=https://forge.butterfly-effect.dev
   ```

2. **Get a Google Maps API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable "Maps JavaScript API"
   - Create credentials (API Key)
   - Replace `your_api_key_here` with your actual key

3. **Restart the dev server:**
   ```bash
   npm start
   ```

4. **Visit the app:**
   - Open http://localhost:5173 in your browser
   - The map should now load with markers for Sikh cities and Gurdwaras

## Testing the UI

After restarting the server:
1. Check that styles are loading (components should look styled, not plain HTML)
2. The header should say "North American Sikh Concentration Map"
3. You should see a search bar and tabs for Cities/Gurdwaras
4. City cards should be styled with borders and spacing

## If UI Still Looks Broken

1. **Hard refresh the browser** (Ctrl+Shift+R or Cmd+Shift+R)
2. **Check browser console** for errors (F12)
3. **Verify CSS is loading** - In browser DevTools, check Network tab for CSS files
4. **Check terminal** for build errors

## Map Without API Key

If you don't have an API key yet:
- The app will still work and show the UI
- The map area will show a message: "Map cannot be loaded - Missing Google Maps API key"
- All other features (search, city list, etc.) will work normally


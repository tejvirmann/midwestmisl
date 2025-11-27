# Google Maps Setup Instructions

## Why the Map Isn't Loading

The map requires a Google Maps API key to function. Without it, you'll see a placeholder message in the map area.

## What You Need

1. **Google Maps API Key** - You need a valid API key from Google Cloud Platform
2. **API Key with Maps JavaScript API enabled**

## How to Get Your API Key

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one

### Step 2: Enable Maps JavaScript API
1. Navigate to "APIs & Services" > "Library"
2. Search for "Maps JavaScript API"
3. Click "Enable"

### Step 3: Create an API Key
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy your API key

### Step 4: (Recommended) Restrict Your API Key
1. Click on your API key to edit it
2. Under "Application restrictions", choose "HTTP referrers"
3. Add your development domain (e.g., `http://localhost:5173/*`)
4. Under "API restrictions", select "Restrict key" and choose "Maps JavaScript API"

## Setup in Your Project

Create a `.env.local` file in the root of your project with:

```bash
VITE_FRONTEND_FORGE_API_KEY=your_api_key_here
VITE_FRONTEND_FORGE_API_URL=https://forge.butterfly-effect.dev
```

**Important Notes:**
- Replace `your_api_key_here` with your actual API key
- The `.env.local` file is already in `.gitignore` - never commit your API key
- After adding the file, restart your dev server (`npm start`)

## Alternative: Use Direct Google Maps API

If you prefer not to use the proxy service, you can modify `client/src/components/Map.tsx`:

```typescript
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const MAPS_URL = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&v=weekly&libraries=marker,places,geocoding,geometry`;
```

And update your `.env.local`:
```bash
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

## Testing

After setting up your API key:
1. Restart the dev server: `npm start`
2. Visit http://localhost:5173
3. The map should now load with markers for Sikh cities and Gurdwaras

## Troubleshooting

- **Map still not loading?** Check the browser console for errors
- **API key errors?** Make sure the key is enabled and not restricted incorrectly
- **Billing issues?** Google Maps API requires billing to be enabled (though they provide free credits)


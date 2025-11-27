# Running the Sikh Concentration Map Locally

This guide explains how to download and run the North American Sikh Concentration Map on your local machine.

## Prerequisites

Before you start, make sure you have the following installed:

- **Node.js** (version 18 or higher) - [Download](https://nodejs.org/)
- **pnpm** (package manager) - Install with: `npm install -g pnpm`
- **Git** (optional, for cloning) - [Download](https://git-scm.com/)

## Option 1: Download from Management UI (Recommended)

1. Go to the Management UI (click the settings icon in the top-right)
2. Navigate to **Code** panel
3. Click **Download all files** to get a ZIP archive
4. Extract the ZIP file to your desired location

## Option 2: Clone or Copy the Project

If you have access to the project repository, you can clone it:

```bash
git clone <repository-url>
cd sikh_areas_map
```

Or manually copy the project folder to your local machine.

## Installation Steps

### 1. Navigate to the Project Directory

```bash
cd sikh_areas_map
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all required packages including React, Tailwind CSS, and Google Maps integration.

### 3. Set Up Environment Variables

The project uses Google Maps through a proxy service. You need to configure the API keys:

Create a `.env.local` file in the root directory with the following content:

```
VITE_FRONTEND_FORGE_API_KEY=your_api_key_here
VITE_FRONTEND_FORGE_API_URL=https://forge.butterfly-effect.dev
VITE_APP_TITLE=North American Sikh Concentration Map
```

**Note:** If you're using the Manus-hosted version, these keys are automatically injected. For local development with your own Google Maps API:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Maps JavaScript API
4. Create an API key
5. Replace `your_api_key_here` with your actual key

### 4. Run the Development Server

```bash
pnpm dev
```

The server will start and display output like:

```
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.x.x:5173/
```

Open `http://localhost:5173/` in your browser to view the map.

## Project Structure

```
sikh_areas_map/
├── client/
│   ├── public/
│   │   └── gurdwara_data.json      # Map data (cities & gurdwaras)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx             # Main map page
│   │   │   └── Home.test.tsx        # Data validation tests
│   │   ├── components/
│   │   │   └── Map.tsx              # Google Maps wrapper
│   │   ├── App.tsx                  # App routing
│   │   └── index.css                # Global styles
│   └── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## Running Tests

To verify the data structure is valid:

```bash
pnpm vitest run client/src/pages/Home.test.tsx
```

This runs 8 tests that validate:
- Data structure integrity
- Required fields in cities and gurdwaras
- Valid coordinate ranges
- Unique city rankings
- North America location validation

## Building for Production

To create an optimized production build:

```bash
pnpm build
```

The build output will be in the `dist/` directory. You can then:

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir dist
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

### Deploy to GitHub Pages
1. Build the project: `pnpm build`
2. Push the `dist/` folder to your GitHub Pages branch
3. Configure your repository settings to serve from the `dist/` folder

### Self-Host (Any Server)
1. Build: `pnpm build`
2. Copy the `dist/` folder contents to your web server
3. Configure your server to serve `index.html` for all routes (SPA routing)

## Nginx Configuration Example

If hosting on Nginx, add this to your server block:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/sikh-map/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Apache Configuration Example

If hosting on Apache, create a `.htaccess` file in the `dist/` folder:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## Updating the Map Data

To add or modify Sikh cities and Gurdwara locations:

1. Edit `client/public/gurdwara_data.json`
2. Ensure the JSON structure matches the existing format
3. Run tests to validate: `pnpm vitest run`
4. Rebuild and redeploy

## Troubleshooting

### "Cannot find module" errors
```bash
pnpm install
pnpm clean  # Clear cache if needed
```

### Google Maps not loading
- Verify your API key is correct in `.env.local`
- Check that Maps JavaScript API is enabled in Google Cloud Console
- Ensure your API key has no IP restrictions (or add your server's IP)

### Port 5173 already in use
```bash
pnpm dev -- --port 3000  # Use a different port
```

### Build fails
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

## Support & Documentation

- **Vite Documentation**: https://vitejs.dev/
- **React Documentation**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **Google Maps API**: https://developers.google.com/maps/documentation/javascript

## License

This project is provided as-is for personal and commercial use.

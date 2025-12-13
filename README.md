# Midwest Misl - Sikh Community Map

An interactive map showcasing Sikh population centers and Gurdwara locations across North America.

## 🌍 Features

- **Interactive Map**: Explore Sikh population centers and Gurdwara locations
- **Search Functionality**: Search by cities or Gurdwaras
- **Community Updates**: Submit updates to add or correct Gurdwara information
- **Automatic PR Creation**: Updates automatically create GitHub pull requests
- **Light/Dark Mode**: Toggle between themes
- **Responsive Design**: Works on desktop and mobile devices

## 📊 Data Collection

### How to Get All Gurdwaras in the World

The Gurdwara data in this project was collected using the following process:

1. **Create a List via Google Maps**
   - Use Google Maps to search for Gurdwaras worldwide
   - Save locations to a custom map or list
   - Collect addresses for each Gurdwara

2. **Download via Google Takeout**
   - Visit [Google Takeout](https://takeout.google.com/?pli=1)
   - Select "My Maps" or "Saved Places" from your Google account
   - Download the data in your preferred format (JSON, KML, etc.)

3. **Geocode Addresses**
   - Use the [Geoapify Geocoding Online Tool](https://www.geoapify.com/tools/geocoding-online/)
   - Upload your address list (Excel, CSV, or text file)
   - Map columns to address components
   - Download the geocoded results with latitude and longitude coordinates

This process ensures accurate location data for mapping Gurdwaras on the interactive map.

## 🚀 Quick Start

See [QUICK_START.md](./QUICK_START.md) for detailed setup instructions.

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Google Maps API Key
- GitHub Personal Access Token (for PR automation)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp client/.env.example client/.env.local
# Edit client/.env.local with your API keys

# Start development server
npm run dev:all
```

## 📦 Deployment

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for complete deployment instructions.

### Deploy to Vercel

1. Push your code to GitHub
2. Import repository in [Vercel](https://vercel.com/new)
3. Add environment variables (see [VERCEL_ENV_VARS.md](./VERCEL_ENV_VARS.md))
4. Deploy!

## 🔧 Configuration

### Environment Variables

Required environment variables:
- `VITE_FRONTEND_FORGE_API_KEY` - Google Maps API key
- `GITHUB_TOKEN` - GitHub Personal Access Token (for PR automation)
- `GITHUB_REPO` - GitHub repository (optional, defaults to `tejvirmann/midwestmisl`)

See [VERCEL_ENV_VARS.md](./VERCEL_ENV_VARS.md) for detailed information.

## 📝 Contributing

Users can contribute by submitting updates through the "Update Map" button. Submissions automatically create pull requests on GitHub.

## 🔒 Security

**Never commit API keys or tokens!** See [SECURITY.md](./SECURITY.md) for security guidelines.

## 📚 Documentation

- [QUICK_START.md](./QUICK_START.md) - Quick setup guide
- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Deployment instructions
- [VERCEL_ENV_VARS.md](./VERCEL_ENV_VARS.md) - Environment variables guide
- [GITHUB_SETUP.md](./GITHUB_SETUP.md) - GitHub PR automation setup
- [API_EXPECTED_OUTPUT.md](./API_EXPECTED_OUTPUT.md) - API documentation
- [SECURITY.md](./SECURITY.md) - Security best practices

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Maps**: Google Maps JavaScript API
- **UI Components**: shadcn/ui
- **Backend**: Vercel Serverless Functions
- **Deployment**: Vercel

## 📄 License

[Add your license here]

## 🙏 Acknowledgments

- Data sources: Google Maps, OpenStreetMap, OpenAddresses, Geonames
- Geocoding service: [Geoapify](https://www.geoapify.com/)
- Map data: Google Maps

---

Built with ❤️ for the Sikh community


import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MapView } from "@/components/Map";
import { Search } from "lucide-react";
import { UpdateMapButton } from "@/components/UpdateMapButton";
import { createCanvasHeatmap, type CanvasHeatmap } from "@/lib/canvasHeatmap";

interface GoogleMapsGurdwara {
  name: string;
  address: string;
  city: string;
  state: string;
  state_code?: string;
  country: string;
  country_code?: string;
  latitude: number;
  longitude: number;
  place_url: string;
  formatted_address: string;
}

const CONTINENT_BY_COUNTRY_CODE: Record<string, string> = {
  US: "North America",
  CA: "North America",
  MX: "North America",
  IN: "Asia",
  PK: "Asia",
  GB: "Europe",
  AU: "Oceania",
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const safeUrl = (url: string) => (/^https?:\/\//i.test(url) ? escapeHtml(url) : "");

const computeGurdwaraCounts = (gurdwaras: GoogleMapsGurdwara[]) => {
  const hemispheres = { north: 0, south: 0, east: 0, west: 0 };
  const continents: Record<string, number> = {};
  const countries: Record<string, number> = {};
  const states: Record<string, number> = {};

  gurdwaras.forEach((gurdwara) => {
    if (gurdwara.latitude >= 0) hemispheres.north += 1;
    else hemispheres.south += 1;
    if (gurdwara.longitude >= 0) hemispheres.east += 1;
    else hemispheres.west += 1;

    const countryCode = gurdwara.country_code?.toUpperCase();
    const continent = (countryCode && CONTINENT_BY_COUNTRY_CODE[countryCode]) || "Other";
    continents[continent] = (continents[continent] || 0) + 1;

    const countryLabel = gurdwara.country || countryCode || "Unknown";
    countries[countryLabel] = (countries[countryLabel] || 0) + 1;

    const stateLabel = gurdwara.state || gurdwara.state_code || "Unknown";
    states[stateLabel] = (states[stateLabel] || 0) + 1;
  });

  const sortCounts = (counts: Record<string, number>) =>
    Object.entries(counts).sort((a, b) => b[1] - a[1]);

  return {
    total: gurdwaras.length,
    hemispheres,
    continents: sortCounts(continents),
    countries: sortCounts(countries),
    states: sortCounts(states),
  };
};


export default function Map() {
  const [searchTerm, setSearchTerm] = useState("");
  const [googleMapsGurdwaras, setGoogleMapsGurdwaras] = useState<GoogleMapsGurdwara[]>([]);
  const [filteredGoogleMapsGurdwaras, setFilteredGoogleMapsGurdwaras] = useState<GoogleMapsGurdwara[]>([]);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const heatmapRef = useRef<CanvasHeatmap | null>(null);
  const [markers, setMarkers] = useState<{
    googleMapsMarkers: google.maps.Marker[];
  }>({
    googleMapsMarkers: [],
  });
  const [selectedLayers, setSelectedLayers] = useState<{
    heatmap: boolean;
    googleMapsGurdwaras: boolean;
  }>({
    heatmap: true,
    googleMapsGurdwaras: true,
  });

  const gurdwaraCounts = useMemo(
    () => computeGurdwaraCounts(googleMapsGurdwaras),
    [googleMapsGurdwaras]
  );

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load Google Maps Gurdwaras
        let googleMapsList: GoogleMapsGurdwara[] = [];
        try {
          const googleMapsResponse = await fetch("/data/google_maps_gurdwaras.json");
          if (googleMapsResponse.ok) {
            const googleMapsData = await googleMapsResponse.json();
            googleMapsList = googleMapsData.gurdwaras || [];
          }
        } catch (error) {
          console.warn("Could not load Google Maps Gurdwaras data:", error);
        }

        setGoogleMapsGurdwaras(googleMapsList);
        setFilteredGoogleMapsGurdwaras(googleMapsList);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, []);

  // Handle search for Google Maps gurdwaras
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredGoogleMapsGurdwaras(googleMapsGurdwaras);
    } else {
      const filtered = googleMapsGurdwaras.filter(
        (gurdwara) =>
          gurdwara.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          gurdwara.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          gurdwara.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
          gurdwara.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
          gurdwara.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredGoogleMapsGurdwaras(filtered);
    }
  }, [searchTerm, googleMapsGurdwaras]);

  // Add markers to map
  useEffect(() => {
    if (!mapInstance) return;

    // Clear existing markers
    markers.googleMapsMarkers.forEach((marker) => marker.setMap(null));

    const newGoogleMapsMarkers: google.maps.Marker[] = [];

    // Determine what to show based on selected layers
    const showGoogleMaps = selectedLayers.googleMapsGurdwaras;

    // Add Google Maps gurdwara markers (blue)
    if (showGoogleMaps) {
      filteredGoogleMapsGurdwaras.forEach((gurdwara) => {
      const marker = new google.maps.Marker({
        position: { lat: gurdwara.latitude, lng: gurdwara.longitude },
        map: mapInstance,
        title: gurdwara.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 6,
              fillColor: "#4F46E5", // Blue color
          fillOpacity: 0.8,
          strokeColor: "#FFFFFF",
          strokeWeight: 1.5,
        },
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
              <div class="p-3 bg-background text-foreground rounded max-w-sm">
                <h3 class="font-bold text-lg mb-2">${escapeHtml(gurdwara.name)}</h3>
                ${gurdwara.address ? `<p class="text-sm font-medium mt-1 mb-2">📍 ${escapeHtml(gurdwara.address)}</p>` : ""}
                <p class="text-sm text-muted-foreground mb-3">${escapeHtml(`${gurdwara.city}, ${gurdwara.state}, ${gurdwara.country}`)}</p>
                ${safeUrl(gurdwara.place_url) ? `
                  <a href="${safeUrl(gurdwara.place_url)}" target="_blank" rel="noopener noreferrer" 
                     class="inline-block mt-2 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm rounded-md transition-colors">
                    View on Google Maps →
                  </a>
                ` : ""}
          </div>
        `,
      });

      marker.addListener("click", () => {
        // Close all other info windows
            newGoogleMapsMarkers.forEach((m) => {
          const iw = m.get("infoWindow");
          if (iw) iw.close();
        });
        infoWindow.open(mapInstance, marker);
        marker.set("infoWindow", infoWindow);
      });

      marker.set("infoWindow", infoWindow);
          newGoogleMapsMarkers.push(marker);
        });
    }

    setMarkers({ 
      googleMapsMarkers: newGoogleMapsMarkers,
    });
  }, [
    mapInstance,
    filteredGoogleMapsGurdwaras,
    selectedLayers,
  ]);

  // Heatmap layer
  useEffect(() => {
    if (!mapInstance || !window.google?.maps) return;

    if (!heatmapRef.current) {
      heatmapRef.current = createCanvasHeatmap({ radius: 25, opacity: 0.6 });
    }

    heatmapRef.current.setData(
      googleMapsGurdwaras.map((g) => ({ lat: g.latitude, lng: g.longitude }))
    );
    heatmapRef.current.setMap(selectedLayers.heatmap ? mapInstance : null);
  }, [mapInstance, googleMapsGurdwaras, selectedLayers.heatmap]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-500 mb-1 sm:mb-2">
                North American Sikh Concentration Map
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Explore the largest Sikh population centers and Gurdwara locations across North America
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 bg-card border border-border rounded-lg px-3 sm:px-4 py-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="layer-heatmap"
                    checked={selectedLayers.heatmap}
                    onCheckedChange={(checked) =>
                      setSelectedLayers((prev) => ({ ...prev, heatmap: checked === true }))
                    }
                  />
                  <Label htmlFor="layer-heatmap" className="text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap">
                    Heatmap
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="layer-googlemaps"
                    checked={selectedLayers.googleMapsGurdwaras}
                    onCheckedChange={(checked) =>
                      setSelectedLayers((prev) => ({ ...prev, googleMapsGurdwaras: checked === true }))
                    }
                  />
                  <Label htmlFor="layer-googlemaps" className="text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap">
                    Maps
                  </Label>
                </div>
              </div>
              <div className="flex-shrink-0">
                <UpdateMapButton />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-3 sm:space-y-4 order-2 lg:order-1">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search gurdwaras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Gurdwaras list */}
            <div className="max-h-[300px] sm:max-h-96 overflow-y-auto space-y-2">
              {filteredGoogleMapsGurdwaras.map((gurdwara, idx) => (
                    <Card
                  key={idx} 
                  className="hover:border-indigo-500/50 transition-all cursor-pointer"
                  onClick={() => {
                    if (mapInstance) {
                      mapInstance.setCenter({ lat: gurdwara.latitude, lng: gurdwara.longitude });
                      mapInstance.setZoom(15);
                    }
                  }}
                >
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-2">
                      <div className="w-3 h-3 rounded-full bg-indigo-500 mt-1 shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm line-clamp-2">
                              {gurdwara.name}
                            </h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {gurdwara.address}
                        </p>
                            <p className="text-xs text-muted-foreground">
                              {gurdwara.city}, {gurdwara.state}
                            </p>
                        {gurdwara.place_url && (
                          <a
                            href={gurdwara.place_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-600 hover:text-indigo-700 mt-2 inline-block"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View on Google Maps →
                          </a>
                        )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

            {/* Gurdwara Analytics */}
            <Card>
              <CardContent className="space-y-4 text-xs sm:text-sm pt-4">
                <div className="flex items-center justify-between">
                  <span>Total Gurdwaras</span>
                  <span className="font-semibold">{gurdwaraCounts.total}</span>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium">Countries</div>
                  <div className="space-y-1">
                    {(() => {
                      const usEntry = gurdwaraCounts.countries.find(([name]) => name === "United States" || name === "US");
                      const caEntry = gurdwaraCounts.countries.find(([name]) => name === "Canada" || name === "CA");
                      const usCount = usEntry?.[1] ?? 0;
                      const caCount = caEntry?.[1] ?? 0;
                      const otherCount = gurdwaraCounts.total - usCount - caCount;

                      return (
                        <>
                          <div className="flex items-center justify-between text-xs">
                            <span className="truncate">United States</span>
                            <span className="font-medium">{usCount}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="truncate">Canada</span>
                            <span className="font-medium">{caCount}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="truncate">Other</span>
                            <span className="font-medium">{Math.max(otherCount, 0)}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium">Top States / Provinces</div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {gurdwaraCounts.states.slice(0, 15).map(([name, count]) => (
                      <div key={name} className="flex items-center justify-between text-xs">
                        <span className="truncate">{name}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Legend */}
            <Card>
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-xs sm:text-sm">Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-2 w-10 sm:w-12 rounded-full bg-gradient-to-r from-transparent via-indigo-400 to-indigo-700 border border-border"></div>
                  <span className="text-xs sm:text-sm">Gurdwara Heatmap</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-indigo-500 border-2 border-white shrink-0"></div>
                  <span className="text-xs sm:text-sm">Gurdwaras (Maps)</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <Card className="h-[400px] sm:h-[500px] md:h-[600px] lg:h-[800px] overflow-hidden">
              <MapView
                className="w-full h-full"
                onMapReady={(map: google.maps.Map) => {
                  setMapInstance(map);
                  // Center map on North America
                  map.setCenter({ lat: 45, lng: -100 });
                  map.setZoom(4);
                }}
              />
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}


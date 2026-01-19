import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MapView } from "@/components/Map";
import { Search, MapPin } from "lucide-react";
import { UpdateMapButton } from "@/components/UpdateMapButton";

interface SikhCity {
  rank: number;
  city: string;
  country: string;
  province?: string;
  state?: string;
  population_percentage: number;
  notes: string;
  latitude: number;
  longitude: number;
}

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

const CLUSTER_ZOOM_MAX = 6;

const CONTINENT_BY_COUNTRY_CODE: Record<string, string> = {
  US: "North America",
  CA: "North America",
  MX: "North America",
  IN: "Asia",
  PK: "Asia",
  GB: "Europe",
  AU: "Oceania",
};

const getClusterCellSize = (zoom: number) => {
  if (zoom <= 3) return 8;
  if (zoom === 4) return 4;
  if (zoom === 5) return 2;
  return 1;
};

type ClusterPoint = {
  latitude: number;
  longitude: number;
};

type Cluster = {
  lat: number;
  lng: number;
  count: number;
};

const buildClusters = (points: ClusterPoint[], zoom: number): Cluster[] => {
  const cellSize = getClusterCellSize(zoom);
  const clusters = new globalThis.Map<string, { latSum: number; lngSum: number; count: number }>();

  points.forEach((point) => {
    const cellLat = Math.floor(point.latitude / cellSize);
    const cellLng = Math.floor(point.longitude / cellSize);
    const key = `${cellLat}:${cellLng}`;
    const existing = clusters.get(key);
    if (existing) {
      existing.latSum += point.latitude;
      existing.lngSum += point.longitude;
      existing.count += 1;
    } else {
      clusters.set(key, { latSum: point.latitude, lngSum: point.longitude, count: 1 });
    }
  });

  return Array.from(clusters.values()).map((cluster) => ({
    lat: cluster.latSum / cluster.count,
    lng: cluster.lngSum / cluster.count,
    count: cluster.count,
  }));
};

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
  const [mapData, setMapData] = useState<{ cities: SikhCity[] }>({
    cities: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"cities" | "googlemaps">("cities");
  const [selectedCity, setSelectedCity] = useState<SikhCity | null>(null);
  const [filteredCities, setFilteredCities] = useState<SikhCity[]>([]);
  const [googleMapsGurdwaras, setGoogleMapsGurdwaras] = useState<GoogleMapsGurdwara[]>([]);
  const [filteredGoogleMapsGurdwaras, setFilteredGoogleMapsGurdwaras] = useState<GoogleMapsGurdwara[]>([]);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [mapZoom, setMapZoom] = useState(4);
  const [markers, setMarkers] = useState<{
    cityMarkers: google.maps.Marker[];
    googleMapsMarkers: google.maps.Marker[];
    googleMapsClusterMarkers: google.maps.Marker[];
  }>({
    cityMarkers: [],
    googleMapsMarkers: [],
    googleMapsClusterMarkers: [],
  });
  const [selectedLayers, setSelectedLayers] = useState<{
    cities: boolean;
    googleMapsGurdwaras: boolean;
  }>({
    cities: true,
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
        // Load existing city data
        const cityResponse = await fetch("/gurdwara_data.json");
        const cityData = await cityResponse.json();

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

        setMapData({
          cities: cityData.topSikhCities,
        });
        setFilteredCities(cityData.topSikhCities);
        setGoogleMapsGurdwaras(googleMapsList);
        setFilteredGoogleMapsGurdwaras(googleMapsList);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, []);

  // Track map zoom level for clustering
  useEffect(() => {
    if (!mapInstance) return;
    setMapZoom(mapInstance.getZoom() ?? 4);
    const listener = mapInstance.addListener("zoom_changed", () => {
      setMapZoom(mapInstance.getZoom() ?? 4);
    });
    return () => {
      listener.remove();
    };
  }, [mapInstance]);

  // Handle search for cities
  useEffect(() => {
    if (activeTab === "cities") {
      if (!searchTerm.trim()) {
        setFilteredCities(mapData.cities);
      } else {
    const filtered = mapData.cities.filter(
      (city) =>
        city.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            city.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (city.state && city.state.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (city.province && city.province.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredCities(filtered);
      }
    }
  }, [searchTerm, mapData.cities, activeTab]);

  // Handle search for Google Maps gurdwaras
  useEffect(() => {
    if (activeTab === "googlemaps") {
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
    }
  }, [searchTerm, googleMapsGurdwaras, activeTab]);

  // Add markers to map
  useEffect(() => {
    if (!mapInstance) return;

    // Clear existing markers
    markers.cityMarkers.forEach((marker) => marker.setMap(null));
    markers.googleMapsMarkers.forEach((marker) => marker.setMap(null));
    markers.googleMapsClusterMarkers.forEach((marker) => marker.setMap(null));

    const newCityMarkers: google.maps.Marker[] = [];
    const newGoogleMapsMarkers: google.maps.Marker[] = [];
    const newGoogleMapsClusterMarkers: google.maps.Marker[] = [];

    // Determine what to show based on selected layers
    const showCities = selectedLayers.cities;
    const showGoogleMaps = selectedLayers.googleMapsGurdwaras;
    const shouldCluster = false; // grouping disabled for now

    // Add city markers
    if (showCities) {
    filteredCities.forEach((city) => {
      const marker = new google.maps.Marker({
        position: { lat: city.latitude, lng: city.longitude },
        map: mapInstance,
        title: `${city.city} - ${city.population_percentage}% Sikh`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8 + city.population_percentage / 2,
          fillColor: "#FF6B35",
          fillOpacity: 0.7,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
        },
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-3 bg-background text-foreground rounded">
            <h3 class="font-bold text-lg">${city.city}</h3>
            <p class="text-sm text-muted-foreground">${city.country}${city.state || city.province ? `, ${city.state || city.province}` : ""}</p>
            <p class="font-semibold text-orange-500 mt-2">${city.population_percentage}% Sikh Population</p>
            <p class="text-xs text-muted-foreground mt-2">${city.notes}</p>
          </div>
        `,
      });

      marker.addListener("click", () => {
        // Close all other info windows
        newCityMarkers.forEach((m) => {
          const iw = m.get("infoWindow");
          if (iw) iw.close();
        });
        infoWindow.open(mapInstance, marker);
        marker.set("infoWindow", infoWindow);
        setSelectedCity(city);
      });

      marker.set("infoWindow", infoWindow);
      newCityMarkers.push(marker);
    });
    }

    // Add Google Maps gurdwara markers (green)
    if (showGoogleMaps) {
      if (shouldCluster) {
        // grouping disabled for now
      } else {
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
                <h3 class="font-bold text-lg mb-2">${gurdwara.name}</h3>
                ${gurdwara.address ? `<p class="text-sm font-medium mt-1 mb-2">📍 ${gurdwara.address}</p>` : ""}
                <p class="text-sm text-muted-foreground mb-3">${gurdwara.city}, ${gurdwara.state}, ${gurdwara.country}</p>
                ${gurdwara.place_url ? `
                  <a href="${gurdwara.place_url}" target="_blank" rel="noopener noreferrer" 
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
    }

    setMarkers({ 
      cityMarkers: newCityMarkers, 
      googleMapsMarkers: newGoogleMapsMarkers,
      googleMapsClusterMarkers: newGoogleMapsClusterMarkers,
    });
  }, [
    mapInstance,
    filteredCities,
    filteredGoogleMapsGurdwaras,
    selectedLayers,
    mapZoom,
  ]);

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
                    id="layer-cities"
                    checked={selectedLayers.cities}
                    onCheckedChange={(checked) =>
                      setSelectedLayers((prev) => ({ ...prev, cities: checked === true }))
                    }
                  />
                  <Label htmlFor="layer-cities" className="text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap">
                    Cities
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
                placeholder={
                  activeTab === "cities" 
                    ? "Search cities..." 
                    : "Search Google Maps gurdwaras..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Tabs for Cities, Gurdwaras, and Google Maps */}
            <Tabs value={activeTab} onValueChange={(value) => {
              setActiveTab(value as "cities" | "googlemaps");
              setSearchTerm(""); // Clear search when switching tabs
            }} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-auto">
                <TabsTrigger value="cities" className="text-xs sm:text-sm py-2 px-2 sm:px-4">Cities</TabsTrigger>
                <TabsTrigger value="googlemaps" className="text-xs sm:text-sm py-2 px-2 sm:px-4">Google Maps</TabsTrigger>
              </TabsList>

              <TabsContent value="cities" className="space-y-2 mt-4">
                <div className="max-h-[300px] sm:max-h-96 overflow-y-auto space-y-2">
                  {filteredCities.map((city) => (
                    <Card
                      key={`${city.city}-${city.country}`}
                      className={`cursor-pointer transition-all ${selectedCity?.city === city.city
                        ? "border-orange-500 bg-orange-500/10"
                        : "hover:border-orange-500/50"
                        }`}
                      onClick={() => setSelectedCity(city)}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm">{city.city}</h3>
                            <p className="text-xs text-muted-foreground">
                              {city.country}
                              {city.state || city.province ? `, ${city.state || city.province}` : ""}
                            </p>
                          </div>
                          <Badge className="bg-orange-500 text-white shrink-0">
                            {city.population_percentage}%
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {city.notes}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="googlemaps" className="space-y-2 mt-4">
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
              </TabsContent>
            </Tabs>

            {/* Gurdwara Analytics */}
            <Card>
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-xs sm:text-sm">Map Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs sm:text-sm">
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
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-orange-500 border-2 border-white shrink-0"></div>
                  <span className="text-xs sm:text-sm">Sikh Population Centers</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-indigo-500 border-2 border-white shrink-0"></div>
                  <span className="text-xs sm:text-sm">Gurdwaras (Maps)</span>
                </div>
                <p className="text-xs text-muted-foreground pt-1 sm:pt-2">
                  Circle size indicates population concentration percentage
                </p>
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
                  setMapZoom(4);
                }}
              />
            </Card>
          </div>
        </div>

        {/* Info Section */}
        {selectedCity && (
          <Card className="mt-6 border-orange-500/50 bg-orange-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-500" />
                {selectedCity.city}, {selectedCity.country}
              </CardTitle>
              <CardDescription>{selectedCity.notes}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Rank</p>
                  <p className="text-2xl font-bold text-orange-500">#{selectedCity.rank}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Sikh Population</p>
                  <p className="text-2xl font-bold text-orange-500">{selectedCity.population_percentage}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-semibold">
                    {selectedCity.state || selectedCity.province}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Coordinates</p>
                  <p className="text-sm font-semibold">
                    {selectedCity.latitude.toFixed(2)}, {selectedCity.longitude.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}


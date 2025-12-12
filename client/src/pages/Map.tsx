import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapView } from "@/components/Map";
import { Search, MapPin, Building2 } from "lucide-react";
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

interface Gurdwara {
  name: string;
  address?: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  type: string;
}

export default function Map() {
  const [mapData, setMapData] = useState<{ cities: SikhCity[]; gurdwaras: Gurdwara[] }>({
    cities: [],
    gurdwaras: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"cities" | "gurdwaras">("cities");
  const [selectedCity, setSelectedCity] = useState<SikhCity | null>(null);
  const [filteredCities, setFilteredCities] = useState<SikhCity[]>([]);
  const [filteredGurdwaras, setFilteredGurdwaras] = useState<Gurdwara[]>([]);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<{
    cityMarkers: google.maps.Marker[];
    gurdwaraMarkers: google.maps.Marker[];
  }>({ cityMarkers: [], gurdwaraMarkers: [] });

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load existing city data
        const cityResponse = await fetch("/gurdwara_data.json");
        const cityData = await cityResponse.json();

        // Load comprehensive geocoded Gurdwara data
        const gurdwaraResponse = await fetch("/gurdwaras_geocoded.json");
        const gurdwaraData = await gurdwaraResponse.json();

        // Filter to only include Gurdwaras with coordinates
        const gurdwarasWithCoords = gurdwaraData.gurdwaras.filter(
          (g: Gurdwara) => g.latitude && g.longitude
        );

        setMapData({
          cities: cityData.topSikhCities,
          gurdwaras: gurdwarasWithCoords,
        });
        setFilteredCities(cityData.topSikhCities);
        setFilteredGurdwaras(gurdwarasWithCoords);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, []);

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

  // Handle search for gurdwaras
  useEffect(() => {
    if (activeTab === "gurdwaras") {
      if (!searchTerm.trim()) {
        setFilteredGurdwaras(mapData.gurdwaras);
      } else {
        const filtered = mapData.gurdwaras.filter(
          (gurdwara) =>
            gurdwara.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            gurdwara.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            gurdwara.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
            gurdwara.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (gurdwara.address && gurdwara.address.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredGurdwaras(filtered);
      }
    }
  }, [searchTerm, mapData.gurdwaras, activeTab]);

  // Add markers to map
  useEffect(() => {
    if (!mapInstance) return;

    // Clear existing markers
    markers.cityMarkers.forEach((marker) => marker.setMap(null));
    markers.gurdwaraMarkers.forEach((marker) => marker.setMap(null));

    const newCityMarkers: google.maps.Marker[] = [];
    const newGurdwaraMarkers: google.maps.Marker[] = [];

    // Add city markers
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

    // Add gurdwara markers
    filteredGurdwaras.forEach((gurdwara) => {
      const marker = new google.maps.Marker({
        position: { lat: gurdwara.latitude, lng: gurdwara.longitude },
        map: mapInstance,
        title: gurdwara.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: "#4F46E5",
          fillOpacity: 0.8,
          strokeColor: "#FFFFFF",
          strokeWeight: 1.5,
        },
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-3 bg-background text-foreground rounded">
            <h3 class="font-bold">${gurdwara.name}</h3>
            ${gurdwara.address ? `<p class="text-sm font-medium mt-1">📍 ${gurdwara.address}</p>` : ""}
            <p class="text-sm text-muted-foreground">${gurdwara.city}, ${gurdwara.state}</p>
            <p class="text-xs text-muted-foreground mt-2">${gurdwara.type}</p>
          </div>
        `,
      });

      marker.addListener("click", () => {
        // Close all other info windows
        newGurdwaraMarkers.forEach((m) => {
          const iw = m.get("infoWindow");
          if (iw) iw.close();
        });
        infoWindow.open(mapInstance, marker);
        marker.set("infoWindow", infoWindow);
      });

      marker.set("infoWindow", infoWindow);
      newGurdwaraMarkers.push(marker);
    });

    setMarkers({ cityMarkers: newCityMarkers, gurdwaraMarkers: newGurdwaraMarkers });
  }, [mapInstance, filteredCities, filteredGurdwaras]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-orange-500 mb-2">
                North American Sikh Concentration Map
              </h1>
              <p className="text-muted-foreground">
                Explore the largest Sikh population centers and Gurdwara locations across North America
              </p>
            </div>
            <UpdateMapButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={activeTab === "cities" ? "Search cities..." : "Search gurdwaras..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Tabs for Cities and Gurdwaras */}
            <Tabs value={activeTab} onValueChange={(value) => {
              setActiveTab(value as "cities" | "gurdwaras");
              setSearchTerm(""); // Clear search when switching tabs
            }} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="cities">Cities</TabsTrigger>
                <TabsTrigger value="gurdwaras">Gurdwaras</TabsTrigger>
              </TabsList>

              <TabsContent value="cities" className="space-y-2 mt-4">
                <div className="max-h-96 overflow-y-auto space-y-2">
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

              <TabsContent value="gurdwaras" className="space-y-2 mt-4">
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredGurdwaras.map((gurdwara, idx) => (
                    <Card key={idx} className="hover:border-indigo-500/50 transition-all">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-2">
                          <Building2 className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm line-clamp-2">
                              {gurdwara.name}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {gurdwara.city}, {gurdwara.state}
                            </p>
                            <Badge variant="outline" className="mt-2 text-xs">
                              {gurdwara.type}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Legend */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white"></div>
                  <span>Sikh Population Centers</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-indigo-500 border-2 border-white"></div>
                  <span>Gurdwara Locations</span>
                </div>
                <p className="text-xs text-muted-foreground pt-2">
                  Circle size indicates population concentration percentage
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] lg:h-[800px] overflow-hidden">
              <MapView
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


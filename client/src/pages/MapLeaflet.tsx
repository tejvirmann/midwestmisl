import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MapPin, Building2 } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";

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

export default function MapLeaflet() {
    const [mapData, setMapData] = useState<{ cities: SikhCity[]; gurdwaras: Gurdwara[] }>({
        cities: [],
        gurdwaras: [],
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCity, setSelectedCity] = useState<SikhCity | null>(null);
    const [filteredCities, setFilteredCities] = useState<SikhCity[]>([]);
    const [filteredGurdwaras, setFilteredGurdwaras] = useState<Gurdwara[]>([]);
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const cityLayerRef = useRef<L.LayerGroup | null>(null);
    const gurdwaraLayerRef = useRef<L.MarkerClusterGroup | null>(null);

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

    // Initialize map
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        // Create map
        const map = L.map(mapContainerRef.current).setView([45, -100], 4);

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
        }).addTo(map);

        mapRef.current = map;
        cityLayerRef.current = L.layerGroup().addTo(map);
        gurdwaraLayerRef.current = L.markerClusterGroup({
            chunkedLoading: true,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
        }).addTo(map);

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // Handle search
    useEffect(() => {
        const filtered = mapData.cities.filter(
            (city) =>
                city.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                city.country.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCities(filtered);
    }, [searchTerm, mapData.cities]);

    // Update markers
    useEffect(() => {
        if (!mapRef.current || !cityLayerRef.current || !gurdwaraLayerRef.current) return;

        // Clear existing markers
        cityLayerRef.current.clearLayers();
        gurdwaraLayerRef.current.clearLayers();

        // Add city markers
        filteredCities.forEach((city) => {
            const size = 8 + city.population_percentage / 2;
            const marker = L.circleMarker([city.latitude, city.longitude], {
                radius: size,
                fillColor: "#FF6B35",
                fillOpacity: 0.7,
                color: "#FFFFFF",
                weight: 2,
            });

            marker.bindPopup(`
        <div class="p-3">
          <h3 class="font-bold text-lg">${city.city}</h3>
          <p class="text-sm text-gray-600">${city.country}${city.state || city.province ? `, ${city.state || city.province}` : ""}</p>
          <p class="font-semibold text-orange-500 mt-2">${city.population_percentage}% Sikh Population</p>
          <p class="text-xs text-gray-600 mt-2">${city.notes}</p>
        </div>
      `);

            marker.on("click", () => setSelectedCity(city));
            cityLayerRef.current?.addLayer(marker);
        });

        // Add gurdwara markers
        filteredGurdwaras.forEach((gurdwara) => {
            const icon = L.divIcon({
                className: "custom-marker",
                html: '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">🕌</div>',
                iconSize: [30, 30],
                iconAnchor: [15, 15],
            });

            const marker = L.marker([gurdwara.latitude, gurdwara.longitude], { icon });

            marker.bindPopup(`
        <div class="p-3">
          <h3 class="font-bold">${gurdwara.name}</h3>
          ${gurdwara.address ? `<p class="text-sm font-medium mt-1">📍 ${gurdwara.address}</p>` : ""}
          <p class="text-sm text-gray-600">${gurdwara.city}, ${gurdwara.state}</p>
          <p class="text-xs text-gray-600 mt-2">${gurdwara.type}</p>
        </div>
      `);

            gurdwaraLayerRef.current?.addLayer(marker);
        });
    }, [filteredCities, filteredGurdwaras]);

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
                        <button
                            onClick={() => window.open("/update_gurdwara_form.html", "_blank")}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transition-all hover:-translate-y-0.5"
                        >
                            📍 Update Map
                        </button>
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
                                placeholder="Search cities..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Tabs for Cities and Gurdwaras */}
                        <Tabs defaultValue="cities" className="w-full">
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
                                    {filteredGurdwaras.slice(0, 50).map((gurdwara, idx) => (
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
                                    {filteredGurdwaras.length > 50 && (
                                        <p className="text-xs text-center text-muted-foreground py-2">
                                            Showing 50 of {filteredGurdwaras.length} Gurdwaras
                                        </p>
                                    )}
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
                                    <span>Gurdwara Locations ({filteredGurdwaras.length})</span>
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
                            <div ref={mapContainerRef} className="w-full h-full" />
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

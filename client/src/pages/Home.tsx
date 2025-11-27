import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Heart, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Welcome to <span className="text-orange-500">Midwest Misl</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              A vibrant Sikh community for people in the Midwest. Connect, learn, and grow together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/map">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                  Explore Sikh Map
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <MapPin className="h-10 w-10 text-orange-500 mb-2" />
              <CardTitle>Community Map</CardTitle>
              <CardDescription>
                Discover Sikh population centers and Gurdwara locations across North America
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/map">
                <Button variant="outline" className="w-full">
                  View Map
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-orange-500 mb-2" />
              <CardTitle>Community</CardTitle>
              <CardDescription>
                Connect with fellow Sikhs in the Midwest region and build lasting relationships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Join our growing community of Sikhs across the Midwest United States.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Heart className="h-10 w-10 text-orange-500 mb-2" />
              <CardTitle>Values</CardTitle>
              <CardDescription>
                Upholding Sikh principles of equality, service, and community support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We are committed to fostering a welcoming and inclusive environment for all.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-card border-t border-border">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">About Midwest Misl</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-muted-foreground mb-4">
                Midwest Misl is a community organization dedicated to bringing together Sikhs living
                in the Midwest region of the United States. Our mission is to create a strong,
                supportive network that celebrates our shared heritage while embracing the diversity
                of our community.
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                Through events, gatherings, and digital resources like our interactive Sikh map, we
                aim to strengthen connections between Sikh families and individuals across the
                region. Whether you're looking to find nearby Gurdwaras, connect with local Sikh
                communities, or learn more about Sikh population centers, Midwest Misl is here to
                help.
              </p>
              <p className="text-lg text-muted-foreground">
                Join us in building a vibrant, connected Sikh community in the heart of America.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

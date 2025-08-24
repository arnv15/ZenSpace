import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, MapPin, Users, Star, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";

const Home = () => {
  const { user } = useAuth();
  const features = [
    {
      icon: BookOpen,
      title: "Study Spots",
      description: "Discover the perfect places to focus and learn",
      color: "secondary",
      path: "/study-spots"
    },
    {
      icon: MapPin,
      title: "Recreation Spots",
      description: "Find exciting activities and connect with others",
      color: "recreation",
      path: "/recreation-spots"
    },
    {
      icon: Users,
      title: "Study Sessions",
      description: "Connect with peers who share your academic interests",
      color: "default",
      path: "/study-spots"
    }
  ];

  const stats = [
    { label: "Active Students", value: "2,500+", icon: Users },
    { label: "Study Spots", value: "150+", icon: BookOpen },
    { label: "Activities", value: "50+", icon: MapPin },
    { label: "Average Rating", value: "4.8", icon: Star }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 gradient-hero opacity-10 rounded-3xl mx-4"></div>
        <div className="relative container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            Your Campus
            <span className="gradient-hero bg-clip-text text-transparent block">
              Study & Social Hub
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
            Discover amazing study spots, connect with like-minded peers, and join exciting activities. 
            Your perfect campus experience starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Button variant="hero" size="lg" asChild>
              <Link to="/study-spots">
                <BookOpen className="mr-2 h-5 w-5" />
                Find Study Spots
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/recreation-spots">
                <MapPin className="mr-2 h-5 w-5" />
                Explore Activities
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="inline-flex items-center justify-center w-12 h-12 gradient-primary rounded-full mb-3">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From quiet study nooks to energetic sports courts, find your perfect spot and connect with your community.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={feature.title} className="gradient-card card-hover-effect animate-fade-in border-0 shadow-[var(--shadow-card)]" style={{ animationDelay: `${index * 0.2}s` }}>
                <CardHeader className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto ${
                    feature.color === 'secondary' ? 'bg-secondary' :
                    feature.color === 'recreation' ? 'bg-recreation' : 'bg-primary'
                  }`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button 
                    variant={feature.color as any} 
                    asChild 
                    className="w-full"
                  >
                    <Link to={feature.path}>
                      Explore Now
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-accent/30">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of students who have already found their perfect study and social spots.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/study-spots">
                Start Exploring
              </Link>
            </Button>
            {!user && (
              <Button size="lg" variant="secondary" asChild>
                <Link to="/auth">
                  Get Started
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
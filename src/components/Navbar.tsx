import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, MapPin, Users, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="gradient-hero rounded-lg p-2">
              <Users className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              StudySpot
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Button
              variant={isActive("/") ? "default" : "ghost"}
              size="sm"
              asChild
            >
              <Link to="/" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home
              </Link>
            </Button>
            
            <Button
              variant={isActive("/study-spots") ? "secondary" : "ghost"}
              size="sm"
              asChild
            >
              <Link to="/study-spots" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Study Spots
              </Link>
            </Button>
            
            <Button
              variant={isActive("/recreation-spots") ? "recreation" : "ghost"}
              size="sm"
              asChild
            >
              <Link to="/recreation-spots" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Recreation
              </Link>
            </Button>
          </div>

          {/* Mobile Menu (simplified for now) */}
          <div className="md:hidden flex items-center space-x-1">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/study-spots">
                <BookOpen className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/recreation-spots">
                <MapPin className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
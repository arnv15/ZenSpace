import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Star, Wifi, Users } from "lucide-react";

interface SpotCardProps {
  spot: {
    id: string;
    name: string;
    description: string;
    location: string;
    rating: number;
    tags: string[];
    type: "study" | "recreation";
    capacity?: number;
    hasWifi?: boolean;
    activity?: string;
  };
  onJoin?: (spotId: string) => void;
}

const SpotCard = ({ spot, onJoin }: SpotCardProps) => {
  const isStudySpot = spot.type === "study";

  return (
    <Card className="gradient-card card-hover-effect animate-fade-in shadow-[var(--shadow-card)]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold line-clamp-2">
            {spot.name}
          </CardTitle>
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{spot.rating}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>{spot.location}</span>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {spot.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {spot.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Additional Info */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {spot.hasWifi && (
            <div className="flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              <span>Wi-Fi</span>
            </div>
          )}
          {spot.capacity && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{spot.capacity} people</span>
            </div>
          )}
          {spot.activity && (
            <Badge variant="outline" className="text-xs">
              {spot.activity}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          variant={isStudySpot ? "secondary" : "recreation"}
          size="sm"
          className="w-full"
          onClick={() => onJoin?.(spot.id)}
        >
          {isStudySpot ? "Join Study Session" : "Join Activity"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SpotCard;
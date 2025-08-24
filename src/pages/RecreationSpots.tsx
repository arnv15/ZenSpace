import { useState } from "react";
import FilterBar from "@/components/FilterBar";
import SpotCard from "@/components/SpotCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus } from "lucide-react";

const RecreationSpots = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string>("");

  // Mock data - would come from API
  const recreationSpots = [
    {
      id: "1",
      name: "Main Campus Basketball Court",
      description: "Full-size outdoor basketball court with good lighting for evening games.",
      location: "Athletic Complex",
      rating: 4.7,
      tags: ["Outdoor", "Evening Lighting", "Full Court"],
      type: "recreation" as const,
      activity: "Basketball",
      capacity: 10
    },
    {
      id: "2",
      name: "Campus Recreation Center Pool",
      description: "Olympic-size swimming pool with lanes for lap swimming and recreational use.",
      location: "Recreation Center",
      rating: 4.8,
      tags: ["Indoor", "Olympic Size", "Lap Swimming", "Recreational"],
      type: "recreation" as const,
      activity: "Swimming",
      capacity: 50
    },
    {
      id: "3",
      name: "Soccer Field Complex",
      description: "Large grass field perfect for soccer matches and practice sessions.",
      location: "North Campus Fields",
      rating: 4.6,
      tags: ["Outdoor", "Grass Field", "Large Space"],
      type: "recreation" as const,
      activity: "Soccer",
      capacity: 22
    },
    {
      id: "4",
      name: "Tennis Courts",
      description: "Four well-maintained tennis courts available for singles and doubles play.",
      location: "Athletic Complex",
      rating: 4.5,
      tags: ["Outdoor", "Multiple Courts", "Well-maintained"],
      type: "recreation" as const,
      activity: "Tennis",
      capacity: 8
    },
    {
      id: "5",
      name: "Fitness Center",
      description: "Modern gym with cardio equipment, weights, and group exercise classes.",
      location: "Recreation Center",
      rating: 4.9,
      tags: ["Indoor", "Modern Equipment", "Group Classes", "Cardio"],
      type: "recreation" as const,
      activity: "Fitness",
      capacity: 75
    },
    {
      id: "6",
      name: "Climbing Wall",
      description: "Indoor rock climbing wall with various difficulty levels and safety equipment.",
      location: "Recreation Center, 2nd Floor",
      rating: 4.4,
      tags: ["Indoor", "Various Levels", "Safety Equipment"],
      type: "recreation" as const,
      activity: "Climbing",
      capacity: 15
    },
    {
      id: "7",
      name: "Beach Volleyball Courts",
      description: "Sand volleyball courts for beach volleyball and recreational play.",
      location: "South Campus Recreation Area",
      rating: 4.3,
      tags: ["Outdoor", "Sand Courts", "Beach Style"],
      type: "recreation" as const,
      activity: "Volleyball",
      capacity: 12
    },
    {
      id: "8",
      name: "Campus Running Track",
      description: "400-meter track surrounding the main football field, perfect for running and jogging.",
      location: "Stadium Complex",
      rating: 4.7,
      tags: ["Outdoor", "400m Track", "Stadium", "Running"],
      type: "recreation" as const,
      activity: "Running",
      capacity: 30
    }
  ];

  const activities = Array.from(new Set(recreationSpots.map(spot => spot.activity!)));
  const availableTags = Array.from(new Set(recreationSpots.flatMap(spot => spot.tags)));

  const filteredSpots = recreationSpots.filter(spot => {
    const matchesSearch = spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         spot.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         spot.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.every(tag => spot.tags.includes(tag));
    
    const matchesActivity = !selectedActivity || spot.activity === selectedActivity;
    
    return matchesSearch && matchesTags && matchesActivity;
  });

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleJoinActivity = (spotId: string) => {
    // Would handle joining activity
    console.log("Joining activity at spot:", spotId);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-recreation rounded-full mb-4">
            <MapPin className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Recreation Spots</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover exciting activities and connect with fellow students. From sports to fitness, find your passion.
          </p>
        </div>

        {/* Activity Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge
              variant={!selectedActivity ? "default" : "outline"}
              className="cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setSelectedActivity("")}
            >
              All Activities
            </Badge>
            {activities.map((activity) => (
              <Badge
                key={activity}
                variant={selectedActivity === activity ? "recreation" : "outline"}
                className="cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSelectedActivity(selectedActivity === activity ? "" : activity)}
              >
                {activity}
              </Badge>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
            availableTags={availableTags}
            type="recreation"
          />
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Available Recreation Spots</h2>
            <p className="text-muted-foreground">
              {filteredSpots.length} spots found
              {selectedActivity && ` for ${selectedActivity}`}
              {selectedTags.length > 0 && ` with filters: ${selectedTags.join(", ")}`}
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add New Spot
          </Button>
        </div>

        {/* Recreation Spots Grid */}
        {filteredSpots.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpots.map((spot, index) => (
              <div key={spot.id} style={{ animationDelay: `${index * 0.1}s` }}>
                <SpotCard spot={spot} onJoin={handleJoinActivity} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No recreation spots found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search, activity, or filter criteria
            </p>
            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setSelectedTags([]);
              setSelectedActivity("");
            }}>
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecreationSpots;
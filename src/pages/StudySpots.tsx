import { useState } from "react";
import FilterBar from "@/components/FilterBar";
import SpotCard from "@/components/SpotCard";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from "lucide-react";

const StudySpots = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Mock data - would come from API
  const studySpots = [
    {
      id: "1",
      name: "Central Library - 3rd Floor",
      description: "Quiet study area with individual desks and excellent lighting. Perfect for focused work and exam preparation.",
      location: "Main Campus, Building A",
      rating: 4.8,
      tags: ["Quiet", "Individual", "Wi-Fi", "Power Outlets"],
      type: "study" as const,
      hasWifi: true,
      capacity: 50
    },
    {
      id: "2",
      name: "Student Union Study Lounge",
      description: "Collaborative space with whiteboards and group tables. Great for project work and study groups.",
      location: "Student Union, 2nd Floor",
      rating: 4.5,
      tags: ["Group Friendly", "Whiteboards", "Collaborative", "Coffee Nearby"],
      type: "study" as const,
      hasWifi: true,
      capacity: 30
    },
    {
      id: "3",
      name: "Science Building Computer Lab",
      description: "24/7 access computer lab with high-speed internet and printing facilities.",
      location: "Science Complex, Ground Floor",
      rating: 4.7,
      tags: ["24/7", "Computers", "Printing", "High-Speed Internet"],
      type: "study" as const,
      hasWifi: true,
      capacity: 40
    },
    {
      id: "4",
      name: "Garden Café Study Corner",
      description: "Cozy corner with comfortable seating and natural light. Light background music and coffee available.",
      location: "Campus Center",
      rating: 4.3,
      tags: ["Cozy", "Coffee", "Natural Light", "Background Music"],
      type: "study" as const,
      hasWifi: true,
      capacity: 15
    },
    {
      id: "5",
      name: "Law Library Silent Zone",
      description: "Ultra-quiet zone with strict no-talking policy. Ideal for intensive study sessions.",
      location: "Law Building, 1st Floor",
      rating: 4.9,
      tags: ["Silent", "No Talking", "Intensive Study", "Individual"],
      type: "study" as const,
      hasWifi: true,
      capacity: 25
    },
    {
      id: "6",
      name: "Engineering Workshop Space",
      description: "Open workspace with tools and equipment for hands-on learning and project development.",
      location: "Engineering Building, Basement",
      rating: 4.6,
      tags: ["Hands-on", "Tools", "Projects", "Workshop"],
      type: "study" as const,
      hasWifi: true,
      capacity: 20
    }
  ];

  const availableTags = Array.from(new Set(studySpots.flatMap(spot => spot.tags)));

  const filteredSpots = studySpots.filter(spot => {
    const matchesSearch = spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         spot.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         spot.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.every(tag => spot.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleJoinSession = (spotId: string) => {
    // Would handle joining study session
    console.log("Joining study session at spot:", spotId);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary rounded-full mb-4">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Study Spots</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find the perfect environment for your learning style. From silent libraries to collaborative spaces.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
            availableTags={availableTags}
            type="study"
          />
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Available Study Spots</h2>
            <p className="text-muted-foreground">
              {filteredSpots.length} spots found
              {selectedTags.length > 0 && ` with filters: ${selectedTags.join(", ")}`}
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add New Spot
          </Button>
        </div>

        {/* Study Spots Grid */}
        {filteredSpots.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpots.map((spot, index) => (
              <div key={spot.id} style={{ animationDelay: `${index * 0.1}s` }}>
                <SpotCard spot={spot} onJoin={handleJoinSession} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No study spots found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setSelectedTags([]);
            }}>
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudySpots;
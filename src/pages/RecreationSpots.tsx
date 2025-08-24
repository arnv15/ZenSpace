import { useState, useEffect } from "react";
import SpotCard from "@/components/SpotCard";
import FilterBar from "@/components/FilterBar";
import Navbar from "@/components/Navbar";
import CreateSpotDialog from "@/components/CreateSpotDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Spot {
  id: string;
  name: string;
  description: string;
  location: string;
  category: string;
  max_members: number;
  created_at: string;
  spot_members: { count: number }[];
}

export default function RecreationSpots() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [filteredSpots, setFilteredSpots] = useState<Spot[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchSpots();
  }, []);

  const fetchSpots = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('spots')
        .select(`
          id,
          name,
          description,
          location,
          category,
          max_members,
          created_at,
          spot_members (count)
        `)
        .eq('type', 'recreation')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSpots(data || []);
      setFilteredSpots(data || []);
    } catch (error) {
      console.error('Error fetching spots:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", "Soccer", "Basketball", "Swimming", "Tennis", "Volleyball", "Running", "Cycling", "Gaming", "General"];

  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredSpots(spots);
    } else {
      setFilteredSpots(spots.filter(spot => spot.category === selectedCategory));
    }
  }, [selectedCategory, spots]);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">Recreation Spots</h1>
          {user && <CreateSpotDialog type="recreation" onSpotCreated={fetchSpots} />}
        </div>

        <FilterBar
          searchTerm=""
          onSearchChange={() => {}}
          selectedTags={selectedCategory === "All" ? [] : [selectedCategory]}
          onTagToggle={setSelectedCategory}
          availableTags={categories.slice(1)}
          type="recreation"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              Loading spots...
            </div>
          ) : filteredSpots.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No recreation spots found. {user ? "Create the first one!" : ""}
            </div>
          ) : (
            filteredSpots.map((spot) => (
              <SpotCard 
                key={spot.id}
                id={spot.id}
                title={spot.name}
                description={spot.description || "No description provided"}
                location={spot.location || "Location TBD"}
                category={spot.category || "General"}
                members={spot.spot_members?.[0]?.count || 0}
                maxMembers={spot.max_members}
                timeAgo={formatTimeAgo(spot.created_at)}
                type="recreation"
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
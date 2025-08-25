import { useState, useEffect, useCallback } from "react";
import SpotCard from "@/components/SpotCard";
import FilterBar from "@/components/FilterBar";
import Navbar from "@/components/Navbar";
import CreateSpotDialog from "@/components/CreateSpotDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Spot = {
  id: string;
  name: string;
  description: string;
  location: string;
  category: string;
  amenities?: string[];
  max_members: number;
  created_at: string;
  created_by: string;
  spot_members: { count: number }[];
};

export default function StudySpots() {
  const [filteredSpots, setFilteredSpots] = useState<Spot[]>([]);
  const [yourSpots, setYourSpots] = useState<Spot[]>([]);
  const [editingSpot, setEditingSpot] = useState<Spot | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // State for search bar
  const [searchTerm, setSearchTerm] = useState("");
  // Function to send search query to AI backend and update results
  const handleAISearch = async (query: string) => {
    setLoading(true);
    try {
      // Send request to AI endpoint
      const response = await fetch("/api/ai/search_spots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, type: "study" })
      });
      // Parse AI response
      const result = await response.json();
      // Update displayed results with AI-filtered spots
      setFilteredSpots(result.spots || []);
    } catch (error) {
      console.error("AI search error:", error);
    } finally {
      setLoading(false);
    }
  };
  // Handler for search bar submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Call AI search function
    handleAISearch(searchTerm);
  };

  useEffect(() => {
    fetchSpots();
    // Subscribe to real-time updates
    const channel = supabase
      .channel("realtime:spots")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "spots" },
        () => {
          fetchSpots();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSpots = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("spots")
        .select(
          `
          id,
          name,
          description,
          location,
          category,
          amenities,
          max_members,
          created_at,
          created_by,
          spot_members (count)
        `
        )
        .eq("type", "study")
        .order("created_at", { ascending: false });

      // If amenities column does not exist, data will be an error array
      if (
        error ||
        !Array.isArray(data) ||
        (data.length && (data as any)[0]?.error)
      ) {
        setSpots([]);
        setFilteredSpots([]);
        setYourSpots([]);
        return;
      }
      // Only set state if data is a valid Spot[]
      const isValidSpotArray = (arr: any[]): arr is Spot[] =>
        arr.every(
          (item) =>
            item &&
            typeof item.id === "string" &&
            typeof item.name === "string" &&
            typeof item.description === "string" &&
            typeof item.location === "string" &&
            typeof item.category === "string" &&
            typeof item.max_members === "number" &&
            typeof item.created_at === "string" &&
            typeof item.created_by === "string" &&
            Array.isArray(item.spot_members)
        );

      if (Array.isArray(data) && isValidSpotArray(data)) {
        const validSpots: Spot[] = data;
        setSpots(validSpots);
        setFilteredSpots(validSpots);
        setYourSpots(
          user ? validSpots.filter((s) => s.created_by === user.id) : []
        );
      } else {
        setSpots([]);
        setFilteredSpots([]);
        setYourSpots([]);
      }
    } catch (error) {
      setSpots([]);
      setFilteredSpots([]);
      setYourSpots([]);
      console.error("Error fetching spots:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const categories = [
    "All",
    "Math",
    "Science",
    "Literature",
    "History",
    "Computer Science",
    "Languages",
    "Arts",
    "General",
  ];

  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredSpots(spots);
    } else {
      setFilteredSpots(
        spots.filter((spot) => spot.category === selectedCategory)
      );
    }
    if (user) {
      setYourSpots(spots.filter((s: Spot) => s.created_by === user.id));
    }
  }, [selectedCategory, spots, user]);
  // Edit Spot Handlers
  const handleEditClick = (spot: Spot) => {
    setEditingSpot(spot);
    setEditForm({ ...spot });
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    if (!editingSpot) return;
    const { error } = await supabase
      .from("spots")
      .update({
        name: editForm.name,
        description: editForm.description,
        location: editForm.location,
        category: editForm.category,
        max_members: Number(editForm.max_members),
      })
      .eq("id", editingSpot.id);
    if (!error) {
      setEditingSpot(null);
      fetchSpots();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("spots").delete().eq("id", id);
    fetchSpots();
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  // ...existing code...
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">Study Spots</h1>
          {user && <CreateSpotDialog type="study" onSpotCreated={fetchSpots} />}
        </div>

        {/* Search bar integrated with AI */}
        <form onSubmit={handleSearchSubmit} className="mb-4">
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedTags={selectedCategory === "All" ? [] : [selectedCategory]}
            onTagToggle={setSelectedCategory}
            availableTags={categories.slice(1)}
            type="study"
          />
        </form>

        {/* Owned Rooms Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {user &&
            filteredSpots
              .filter((spot) => spot.created_by === user.id)
              .map((spot) => (
                <div
                  key={spot.id}
                  className="relative flex flex-col border rounded-lg p-6 bg-card shadow-md min-h-[220px]"
                >
                  <div className="font-bold text-xl text-center mb-1">
                    {spot.name}
                  </div>
                  <div className="text-center text-muted-foreground mb-2">
                    {spot.description}
                  </div>
                  <div className="flex flex-col items-center text-xs mb-2">
                    <span>Location: {spot.location}</span>
                    <span>Category: {spot.category}</span>
                    <span>Max Members: {spot.max_members}</span>
                  </div>
                  {/* Edit/Delete Buttons at bottom center */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-4 flex gap-3">
                    <button
                      className="px-4 py-1 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
                      onClick={() => handleEditClick(spot)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="px-4 py-1 bg-red-600 text-white rounded shadow hover:bg-red-700 transition"
                      onClick={() => handleDelete(spot.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
        </div>

        {/* All Spots Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {loading ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              Loading spots...
            </div>
          ) : filteredSpots.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No study spots found. {user ? "Create the first one!" : ""}
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
                type="study"
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
function setSpots(arg0: undefined[]) {
  throw new Error("Function not implemented.");
}


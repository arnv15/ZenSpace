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
  const [spots, setSpots] = useState<Spot[]>([]);
  const [filteredSpots, setFilteredSpots] = useState<Spot[]>([]);
  const [yourSpots, setYourSpots] = useState<Spot[]>([]);
  const [editingSpot, setEditingSpot] = useState<Spot | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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

        <div className="space-y-2">
          {editingSpot ? (
            <>
              {/* Edit Form */}
              <input
                className="w-full border rounded p-1"
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
              />
              <textarea
                className="w-full border rounded p-1"
                name="description"
                value={editForm.description}
                onChange={handleEditChange}
              />
              <input
                className="w-full border rounded p-1"
                name="location"
                value={editForm.location}
                onChange={handleEditChange}
              />
              <input
                className="w-full border rounded p-1"
                name="category"
                value={editForm.category}
                onChange={handleEditChange}
              />
              <input
                className="w-full border rounded p-1"
                name="max_members"
                type="number"
                value={editForm.max_members}
                onChange={handleEditChange}
              />

              <div className="flex gap-2 mt-2">
                <button
                  className="px-3 py-1 bg-green-500 text-white rounded"
                  onClick={handleEditSave}
                  type="button"
                >
                  Save
                </button>
                <button
                  className="px-3 py-1 bg-gray-300 rounded"
                  onClick={() => setEditingSpot(null)}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Spot Display */}
              {filteredSpots.map((spot) => (
                <div key={spot.id} className="space-y-2 border p-2 rounded">
                  <div className="font-bold text-lg">{spot.name}</div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {spot.description}
                  </div>
                  <div className="text-xs mb-1">Location: {spot.location}</div>
                  <div className="text-xs mb-1">Category: {spot.category}</div>
                  <div className="text-xs mb-1">
                    Max Members: {spot.max_members}
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button
                      className="px-3 py-1 bg-blue-500 text-white rounded"
                      onClick={() => handleEditClick(spot)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded"
                      onClick={() => handleDelete(spot.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <FilterBar
          searchTerm=""
          onSearchChange={() => {}}
          selectedTags={selectedCategory === "All" ? [] : [selectedCategory]}
          onTagToggle={setSelectedCategory}
          availableTags={categories.slice(1)}
          type="study"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

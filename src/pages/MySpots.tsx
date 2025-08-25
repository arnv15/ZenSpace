import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import SpotChat from "@/components/SpotChat";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

// Spot type matches StudySpots/RecreationSpots
interface Spot {
  id: string;
  name: string;
  description: string;
  location: string;
  category: string;
  max_members: number;
  created_at: string;
  created_by: string;
  spot_members: { user_id: string }[];
  type: string;
}

export default function MySpots() {
  const { user } = useAuth();

  // Realtime updates for spots and spot_members
  useEffect(() => {
    if (!user) return;
    // Subscribe to spot deletions and updates
    const spotChannel = supabase
      .channel('realtime-spots')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'spots' }, (payload) => {
        // Refetch owned and joined spots on any change
        refetchSpots();
      })
      .subscribe();
    // Subscribe to spot_members changes (for leave/join)
    const memberChannel = supabase
      .channel('realtime-spot-members')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'spot_members' }, (payload) => {
        refetchSpots();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(spotChannel);
      supabase.removeChannel(memberChannel);
    };
  }, [user]);

  // Refetch spots helper
  const refetchSpots = async () => {
    setLoading(true);
    const fetchOwned = supabase
      .from("spots")
      .select(
        `id, name, description, location, category, max_members, created_at, created_by, spot_members (user_id), type`
      )
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });
    const fetchJoined = supabase
      .from("spot_members")
      .select(
        `spot_id, spots (id, name, description, location, category, max_members, created_at, created_by, spot_members (user_id), type)`
      )
      .eq("user_id", user.id);
    Promise.all([fetchOwned, fetchJoined]).then(([ownedRes, joinedRes]) => {
      setOwnedSpots(Array.isArray(ownedRes.data) ? ownedRes.data : []);
      const joined = (Array.isArray(joinedRes.data) ? joinedRes.data : [])
        .map((row: any) => row.spots)
        .filter((spot: Spot | null) => spot && spot.created_by !== user.id);
      setJoinedSpots(joined);
      setLoading(false);
    });
  };
  const [ownedSpots, setOwnedSpots] = useState<Spot[]>([]);
  const [joinedSpots, setJoinedSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [editingSpotId, setEditingSpotId] = useState<string | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detailsSpot, setDetailsSpot] = useState<Spot | null>(null);
  const [detailsMembers, setDetailsMembers] = useState<any[]>([]);
  const [chatOpenId, setChatOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    // Fetch spots owned by user
    const fetchOwned = supabase
      .from("spots")
      .select(
        `id, name, description, location, category, max_members, created_at, created_by, spot_members (user_id), type`
      )
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });
    // Fetch spots joined by user (not owned)
    const fetchJoined = supabase
      .from("spot_members")
      .select(
        `spot_id, spots (id, name, description, location, category, max_members, created_at, created_by, spot_members (user_id), type)`
      )
      .eq("user_id", user.id);
    Promise.all([fetchOwned, fetchJoined]).then(([ownedRes, joinedRes]) => {
      setOwnedSpots(Array.isArray(ownedRes.data) ? ownedRes.data : []);
      // joinedRes.data is array of { spot_id, spots: Spot }
      const joined = (Array.isArray(joinedRes.data) ? joinedRes.data : [])
        .map((row: any) => row.spots)
        .filter(
          (spot: Spot | null) => spot && spot.created_by !== user.id // not owned by user
        );
      setJoinedSpots(joined);
      setLoading(false);
    });
  }, [user, editDialogOpen, detailsDialogOpen, chatOpenId]);

  // Edit Spot Handlers
  const handleEditClick = (spot: Spot) => {
    setEditingSpotId(spot.id);
    setEditForm({ ...spot });
    setEditDialogOpen(true);
  };
  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  const handleEditSave = async () => {
    if (!editingSpotId) return;
    const { error } = await supabase
      .from("spots")
      .update({
        name: editForm.name,
        description: editForm.description,
        location: editForm.location,
        category: editForm.category,
        max_members: Number(editForm.max_members),
      })
      .eq("id", editingSpotId);
    if (!error) {
      setEditDialogOpen(false);
      setEditingSpotId(null);
    }
  };
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("spots").delete().eq("id", id);
    if (!error) {
      setOwnedSpots((prev) => prev.filter((spot) => spot.id !== id));
      setEditDialogOpen(false);
      setEditingSpotId(null);
    }
  };

  // Details Dialog for joined spots
  const handleViewDetails = async (spot: Spot) => {
    setDetailsSpot(spot);
    setDetailsDialogOpen(true);
    // Fetch member names
    const { data } = await supabase
      .from("spot_members")
      .select("user_id, profiles (display_name, username)")
      .eq("spot_id", spot.id);
    setDetailsMembers(Array.isArray(data) ? data : []);
  };
  const handleLeaveSpot = async (spot: Spot) => {
    if (!user) return;
    const { error } = await supabase
      .from("spot_members")
      .delete()
      .eq("spot_id", spot.id)
      .eq("user_id", user.id);
    if (!error) {
      setJoinedSpots((prev) => prev.filter((s) => s.id !== spot.id));
      setDetailsDialogOpen(false);
    }
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">My Spots</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Owned Spots */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Spots You Own</h2>
            {loading ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : ownedSpots.length === 0 ? (
              <div className="text-muted-foreground">
                You don't own any spots yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {ownedSpots.map((spot) => (
                  <div
                    key={spot.id}
                    className="relative flex flex-col border rounded-lg p-6 bg-card shadow-md min-h-[320px]"
                  >
                    <div className="font-bold text-2xl text-left mb-2">
                      {spot.name}
                    </div>
                    <div className="text-left text-muted-foreground mb-4 text-base">
                      {spot.description}
                    </div>
                    <div className="flex flex-col text-left text-lg mb-4 gap-1">
                      <span>
                        <b>Location:</b> {spot.location}
                      </span>
                      <span>
                        <b>Category:</b> {spot.category}
                      </span>
                      <span>
                        <b>Max Members:</b> {spot.max_members}
                      </span>
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-4 flex gap-3">
                      <Button size="sm" onClick={() => setChatOpenId(spot.id)}>
                        SpotChat
                      </Button>
                      <Button size="sm" onClick={() => handleEditClick(spot)}>
                        Edit Details
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(spot.id)}
                      >
                        Delete Spot
                      </Button>
                    </div>
                    {/* SpotChat modal for owned spots */}
                    {chatOpenId === spot.id && (
                      <SpotChat
                        spotId={spot.id}
                        spotName={spot.name}
                        open={true}
                        onOpenChange={(open) => {
                          if (!open) setChatOpenId(null);
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Joined Spots */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Spots You Joined</h2>
            {loading ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : joinedSpots.length === 0 ? (
              <div className="text-muted-foreground">
                You haven't joined any spots yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {joinedSpots.map((spot) => (
                  <div
                    key={spot.id}
                    className="relative flex flex-col border rounded-lg p-6 bg-card shadow-md min-h-[320px]"
                  >
                    <div className="font-bold text-2xl text-left mb-2">
                      {spot.name}
                    </div>
                    <div className="text-left text-muted-foreground mb-4 text-base">
                      {spot.description}
                    </div>
                    <div className="flex flex-col text-left text-lg mb-4 gap-1">
                      <span>
                        <b>Location:</b> {spot.location}
                      </span>
                      <span>
                        <b>Category:</b> {spot.category}
                      </span>
                      <span>
                        <b>Max Members:</b> {spot.max_members}
                      </span>
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-4 flex gap-3">
                      <Button size="sm" onClick={() => setChatOpenId(spot.id)}>
                        SpotChat
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(spot)}
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleLeaveSpot(spot)}
                      >
                        Leave Spot
                      </Button>
                    </div>
                    {/* SpotChat modal */}
                    {chatOpenId === spot.id && (
                      <SpotChat
                        spotId={spot.id}
                        spotName={spot.name}
                        open={true}
                        onOpenChange={(open) => {
                          if (!open) setChatOpenId(null);
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Spot Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Spot Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              name="name"
              value={editForm.name || ""}
              onChange={handleEditChange}
            />
            <Label htmlFor="edit-category">Category</Label>
            <Input
              id="edit-category"
              name="category"
              value={editForm.category || ""}
              onChange={handleEditChange}
            />
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              name="description"
              value={editForm.description || ""}
              onChange={handleEditChange}
            />
            <Label htmlFor="edit-location">Location</Label>
            <Input
              id="edit-location"
              name="location"
              value={editForm.location || ""}
              onChange={handleEditChange}
            />
            <Label htmlFor="edit-max-members">Max Members</Label>
            <Input
              id="edit-max-members"
              name="max_members"
              type="number"
              value={editForm.max_members || 1}
              onChange={handleEditChange}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog for joined spots */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Spot Details</DialogTitle>
            <DialogDescription>
              All information about this spot and its members.
            </DialogDescription>
          </DialogHeader>
          {detailsSpot && (
            <div className="space-y-2">
              <div>
                <b>Name:</b> {detailsSpot.name}
              </div>
              <div>
                <b>Description:</b> {detailsSpot.description}
              </div>
              <div>
                <b>Location:</b> {detailsSpot.location}
              </div>
              <div>
                <b>Category:</b> {detailsSpot.category}
              </div>
              <div>
                <b>Max Members:</b> {detailsSpot.max_members}
              </div>
              <Separator />
              <div>
                <b>Members:</b>
              </div>
              <ul className="list-disc ml-6">
                {detailsMembers.map((m, i) => (
                  <li key={i}>
                    {m.profiles?.display_name ||
                      m.profiles?.username ||
                      m.user_id}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

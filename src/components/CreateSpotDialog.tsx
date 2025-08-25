import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface CreateSpotDialogProps {
  type: "study" | "recreation";
  onSpotCreated?: () => void;
}

const studyCategories = [
  "Math",
  "Science",
  "Literature",
  "History",
  "Computer Science",
  "Languages",
  "Arts",
  "General",
];
const recreationCategories = [
  "Soccer",
  "Basketball",
  "Swimming",
  "Tennis",
  "Volleyball",
  "Running",
  "Cycling",
  "Gaming",
  "General",
];
const amenitiesList = [
  "WiFi",
  "Whiteboard",
  "Power Outlets",
  "Snacks",
  "Drinks",
  "Quiet Area",
  "Group Tables",
  "Projector",
  "Parking",
  "Restrooms",
];

export default function CreateSpotDialog({
  type,
  onSpotCreated,
}: CreateSpotDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [maxMembers, setMaxMembers] = useState("10");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const categories = type === "study" ? studyCategories : recreationCategories;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to create a spot");
      return;
    }

    setLoading(true);
    try {
      // Always include creator in max_members
      const maxMembersInt = Math.max(1, parseInt(maxMembers));
      const { data, error } = await supabase
        .from("spots")
        .insert({
          name,
          description,
          location: isOnline ? "Online" : location,
          is_online: isOnline,
          type,
          category,
          amenities,
          max_members: maxMembersInt,
          created_by: user.id,
        })
        .select();

      if (error) throw error;
      const spotId = data?.[0]?.id;
      if (spotId) {
        // Add creator as a member
        await supabase.from("spot_members").insert({
          spot_id: spotId,
          user_id: user.id,
        });
      }

      toast.success(
        `${
          type === "study" ? "Study" : "Recreation"
        } spot created successfully!`
      );
      setOpen(false);
      setName("");
      setDescription("");
      setLocation("");
      setCategory("");
      setIsOnline(false);
      setMaxMembers("10");
      setAmenities([]);
      onSpotCreated?.();
    } catch (error) {
      console.error("Error creating spot:", error);
      toast.error("Failed to create spot");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create {type === "study" ? "Study" : "Recreation"} Spot
        </Button>
      </DialogTrigger>
      <DialogContent
        className="w-full max-w-2xl overflow-y-auto"
        style={{ scrollBehavior: "smooth", maxHeight: "90vh" }}
      >
        <DialogHeader>
          <DialogTitle>
            Create {type === "study" ? "Study" : "Recreation"} Spot
          </DialogTitle>
          <DialogDescription>
            Create a new spot where students can connect and{" "}
            {type === "study"
              ? "study together"
              : "enjoy recreational activities"}
            .
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Spot Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Enter ${type} spot name`}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your spot and what you'll be doing"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Amenities</Label>
            <div className="grid grid-cols-2 gap-2">
              {amenitiesList.map((am) => (
                <label key={am} className="flex items-center gap-2">
                  <Checkbox
                    checked={amenities.includes(am)}
                    onCheckedChange={(checked) => {
                      setAmenities((prev) =>
                        checked ? [...prev, am] : prev.filter((a) => a !== am)
                      );
                    }}
                  />
                  <span>{am}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="online"
              checked={isOnline}
              onCheckedChange={setIsOnline}
            />
            <Label htmlFor="online">Online {type} session</Label>
          </div>

          {!isOnline && (
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter the location"
                required={!isOnline}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="maxMembers">Max Members</Label>
            <Input
              id="maxMembers"
              type="number"
              value={maxMembers}
              onChange={(e) => setMaxMembers(e.target.value)}
              placeholder="Maximum number of members"
              min="2"
              max="50"
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Spot"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

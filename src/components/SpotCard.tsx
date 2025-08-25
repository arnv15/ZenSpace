import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Clock, MessageCircle } from "lucide-react";
import { useState } from "react";
import SpotChat from "./SpotChat";

interface SpotCardProps {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  members: number;
  maxMembers: number;
  timeAgo: string;
  type: "study" | "recreation";
}

export default function SpotCard({
  id,
  title,
  description,
  location,
  category,
  members,
  maxMembers,
  timeAgo,
  type,
}: SpotCardProps) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{title}</CardTitle>
            <Badge variant={type === "study" ? "secondary" : "default"}>
              {category}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          <p className="text-sm text-muted-foreground mb-3">{description}</p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              {location}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-1" />
              {members}/{maxMembers} members
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              {timeAgo}
            </div>
          </div>

          <div className="flex gap-2 mt-auto">
            <Button size="sm" onClick={() => setChatOpen(true)}>
              <MessageCircle className="h-4 w-4 mr-1" />
              Join Group
            </Button>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>

      <SpotChat
        spotId={id}
        spotName={title}
        open={chatOpen}
        onOpenChange={setChatOpen}
      />
    </>
  );
}

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { useState } from "react";

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  availableTags: string[];
  type: "study" | "recreation";
}

const FilterBar = ({
  searchTerm,
  onSearchChange,
  selectedTags,
  onTagToggle,
  availableTags,
  type
}: FilterBarProps) => {
  const [showAllTags, setShowAllTags] = useState(false);
  const displayTags = showAllTags ? availableTags : availableTags.slice(0, 6);

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border animate-fade-in">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={`Search ${type} spots...`}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Tags */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter by tags:</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {displayTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <Badge
                key={tag}
                variant={isSelected ? "default" : "outline"}
                className="cursor-pointer hover:scale-105 transition-transform"
                onClick={() => onTagToggle(tag)}
              >
                {tag}
                {isSelected && <X className="h-3 w-3 ml-1" />}
              </Badge>
            );
          })}
          
          {availableTags.length > 6 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllTags(!showAllTags)}
              className="h-6 px-2 text-xs"
            >
              {showAllTags ? "Show Less" : `+${availableTags.length - 6} more`}
            </Button>
          )}
        </div>

        {/* Clear Filters */}
        {selectedTags.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => selectedTags.forEach(tag => onTagToggle(tag))}
            className="text-xs"
          >
            Clear Filters ({selectedTags.length})
          </Button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
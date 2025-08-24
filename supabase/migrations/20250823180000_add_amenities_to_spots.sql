-- Add amenities column to spots table
ALTER TABLE spots ADD COLUMN amenities text[] DEFAULT ARRAY[]::text[];

// Utility to get spot IDs the user owns or has joined
import { supabase } from '@/integrations/supabase/client';

export async function getUserSpotIds(userId: string): Promise<Set<string>> {
  const owned = await supabase
    .from('spots')
    .select('id')
    .eq('created_by', userId);
  const joined = await supabase
    .from('spot_members')
    .select('spot_id')
    .eq('user_id', userId);
  const ownedIds = Array.isArray(owned.data) ? owned.data.map((s: any) => s.id) : [];
  const joinedIds = Array.isArray(joined.data) ? joined.data.map((s: any) => s.spot_id) : [];
  return new Set([...ownedIds, ...joinedIds]);
}

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Send, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    display_name: string;
    username: string;
  };
}

interface SpotMember {
  id: string;
  joined_at: string;
  profiles: {
    display_name: string;
    username: string;
  };
}

interface SpotChatProps {
  spotId: string;
  spotName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SpotChat({ spotId, spotName, open, onOpenChange }: SpotChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [members, setMembers] = useState<SpotMember[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && spotId) {
      fetchMembers();
      checkMembership();
      if (isMember) {
        fetchMessages();
        subscribeToMessages();
      }
    }
  }, [open, spotId, isMember]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from('spot_members')
      .select(`
        id,
        joined_at,
        user_id
      `)
      .eq('spot_id', spotId);

    if (error) {
      console.error('Error fetching members:', error);
    } else {
      // Fetch profiles separately for each member
      const membersWithProfiles = await Promise.all(
        (data || []).map(async (member) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, username')
            .eq('user_id', member.user_id)
            .single();
          
          return {
            ...member,
            profiles: profile || { display_name: 'Unknown User', username: 'unknown' }
          };
        })
      );
      setMembers(membersWithProfiles);
    }
  };

  const checkMembership = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('spot_members')
      .select('id')
      .eq('spot_id', spotId)
      .eq('user_id', user.id)
      .single();

    setIsMember(!!data && !error);
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        user_id
      `)
      .eq('spot_id', spotId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      // Fetch profiles separately for each message
      const messagesWithProfiles = await Promise.all(
        (data || []).map(async (message) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, username')
            .eq('user_id', message.user_id)
            .single();
          
          return {
            ...message,
            profiles: profile || { display_name: 'Unknown User', username: 'unknown' }
          };
        })
      );
      setMessages(messagesWithProfiles);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('spot-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `spot_id=eq.${spotId}`
        },
        async (payload) => {
          // Fetch the complete message with profile data
          const { data: message } = await supabase
            .from('messages')
            .select(`
              id,
              content,
              created_at,
              user_id
            `)
            .eq('id', payload.new.id)
            .single();

          if (message) {
            // Fetch profile separately
            const { data: profile } = await supabase
              .from('profiles')
              .select('display_name, username')
              .eq('user_id', message.user_id)
              .single();

            const messageWithProfile = {
              ...message,
              profiles: profile || { display_name: 'Unknown User', username: 'unknown' }
            };

            setMessages(prev => [...prev, messageWithProfile]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const joinSpot = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('spot_members')
        .insert({
          spot_id: spotId,
          user_id: user.id
        });

      if (error) throw error;

      setIsMember(true);
      fetchMembers();
      toast.success('Joined spot successfully!');
    } catch (error) {
      console.error('Error joining spot:', error);
      toast.error('Failed to join spot');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim() || !isMember) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          spot_id: spotId,
          user_id: user.id,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{spotName}</span>
            <Badge variant="secondary" className="gap-1">
              <Users className="h-3 w-3" />
              {members.length}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {!isMember ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">Join this spot to participate in the chat</p>
              <Button onClick={joinSpot} disabled={loading}>
                {loading ? 'Joining...' : 'Join Spot'}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {message.profiles?.display_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {message.profiles?.display_name || 'Unknown User'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{message.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <form onSubmit={sendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
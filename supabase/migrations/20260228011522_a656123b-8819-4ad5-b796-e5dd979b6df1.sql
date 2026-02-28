
-- Create game_rooms table
CREATE TABLE public.game_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  moves JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_player TEXT NOT NULL DEFAULT 'X',
  winner TEXT,
  player_x_id TEXT NOT NULL,
  player_o_id TEXT,
  status TEXT NOT NULL DEFAULT 'waiting',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;

-- Anyone can read game rooms
CREATE POLICY "Anyone can read game rooms"
  ON public.game_rooms FOR SELECT
  USING (true);

-- Anyone can create a game room
CREATE POLICY "Anyone can create game rooms"
  ON public.game_rooms FOR INSERT
  WITH CHECK (true);

-- Anyone can update game rooms (players identified by localStorage UUID, not auth)
CREATE POLICY "Anyone can update game rooms"
  ON public.game_rooms FOR UPDATE
  USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_rooms;

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getPlayerId } from "@/lib/playerId";
import { playSound } from "@/lib/sounds";
import confetti from "canvas-confetti";
import { toast } from "@/hooks/use-toast";

function fireConfetti() {
  const end = Date.now() + 800;
  const colors = ["#e8913a", "#3b9fd8", "#ffd700"];
  (function frame() {
    confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
    confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

type Player = "X" | "O";

export interface Move {
  index: number;
  player: Player;
  order: number;
}

export interface GameRoom {
  id: string;
  moves: Move[];
  current_player: Player;
  winner: string | null;
  player_x_id: string;
  player_o_id: string | null;
  status: string;
}

export function useGameRoom(roomId: string | undefined) {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const playerId = getPlayerId();
  const prevMovesLenRef = useRef(0);
  const prevWinnerRef = useRef<string | null>(null);
  const prevStatusRef = useRef<string | null>(null);

  const myRole: Player | null = room
    ? room.player_x_id === playerId
      ? "X"
      : room.player_o_id === playerId
      ? "O"
      : null
    : null;

  const isMyTurn = room?.status === "playing" && myRole === room.current_player && !room.winner;

  // Fetch room
  useEffect(() => {
    if (!roomId) return;
    setLoading(true);
    supabase
      .from("game_rooms")
      .select("*")
      .eq("id", roomId)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) {
          setError("Room not found");
          setLoading(false);
          return;
        }
        const gameRoom: GameRoom = {
          ...data,
          moves: (data.moves as unknown as Move[]) || [],
          current_player: data.current_player as Player,
        };
        setRoom(gameRoom);
        prevMovesLenRef.current = gameRoom.moves.length;
        prevWinnerRef.current = gameRoom.winner;
        prevStatusRef.current = gameRoom.status;
        setLoading(false);
      });
  }, [roomId]);

  // Realtime subscription & Polling fallback
  useEffect(() => {
    if (!roomId) return;
    
    // Fallback polling for proxies that don't support WebSockets
    const fetchRoom = async () => {
      const { data, error: err } = await supabase
        .from("game_rooms")
        .select("*")
        .eq("id", roomId)
        .single();
        
      if (!err && data) {
        const gameRoom: GameRoom = {
          ...data,
          moves: (data.moves as unknown as Move[]) || [],
          current_player: data.current_player as Player,
        };
        
        setRoom((prev) => {
          if (!prev) return gameRoom;
          // Only update and play sounds if there are actual changes
          if (
            prev.moves.length !== gameRoom.moves.length || 
            prev.status !== gameRoom.status || 
            prev.current_player !== gameRoom.current_player
          ) {
            if (gameRoom.moves.length > prevMovesLenRef.current) playSound("place");
            if (gameRoom.winner && !prevWinnerRef.current) {
              playSound("win");
              fireConfetti();
            }
            if (gameRoom.status === "playing" && prevStatusRef.current === "waiting") {
              playSound("join");
            }

            prevMovesLenRef.current = gameRoom.moves.length;
            prevWinnerRef.current = gameRoom.winner;
            prevStatusRef.current = gameRoom.status;
            return gameRoom;
          }
          return prev;
        });
      }
    };

    const intervalId = setInterval(fetchRoom, 1500);

    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "game_rooms", filter: `id=eq.${roomId}` },
        (payload) => {
          const data = payload.new as GameRoom;
          const newRoom: GameRoom = {
            ...data,
            moves: (data.moves as unknown as Move[]) || [],
            current_player: data.current_player,
          };

          // Sound effects based on changes
          if (newRoom.moves.length > prevMovesLenRef.current) {
            playSound("place");
          }
          if (newRoom.winner && !prevWinnerRef.current) {
            playSound("win");
            fireConfetti();
          }
          if (newRoom.status === "playing" && prevStatusRef.current === "waiting") {
            playSound("join");
          }

          prevMovesLenRef.current = newRoom.moves.length;
          prevWinnerRef.current = newRoom.winner;
          prevStatusRef.current = newRoom.status;
          setRoom(newRoom);
        }
      )
      .subscribe((status, err) => {
        console.log('Realtime hook status:', status, err);
      });

    return () => {
      clearInterval(intervalId);
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // Join room
  const joinRoom = useCallback(async () => {
    if (!roomId || !room) return;
    if (room.player_x_id === playerId) return; // already host
    if (room.player_o_id && room.player_o_id !== playerId) {
      setError("Room is full");
      return;
    }
    if (room.player_o_id === playerId) return; // already joined

    try {
      const { error: err } = await supabase
        .from("game_rooms")
        .update({ player_o_id: playerId, status: "playing" })
        .eq("id", roomId);

      if (err) {
        console.error(err);
        setError("Failed to join");
        toast({ variant: "destructive", title: "Error", description: "Failed to join game." });
      } else {
        // Optimistic local update
        const updatedRoom = { ...room, player_o_id: playerId, status: "playing" };
        setRoom(updatedRoom);
        prevStatusRef.current = updatedRoom.status;
        playSound("join");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to join");
      toast({ variant: "destructive", title: "Error", description: "Network error while joining." });
    }
  }, [roomId, room, playerId]);

  // Make move
  const makeMove = useCallback(
    async (index: number) => {
      if (!room || !myRole || !isMyTurn) return;

      const moves = [...room.moves];
      const playerMoves = moves.filter((m) => m.player === myRole);

      let newMoves = [...moves];
      if (playerMoves.length >= 3) {
        const oldest = playerMoves[0];
        newMoves = newMoves.filter((m) => m !== oldest);
        playSound("remove");
      }

      const maxOrder = newMoves.reduce((max, m) => Math.max(max, m.order), -1);
      newMoves.push({ index, player: myRole, order: maxOrder + 1 });

      // Check winner
      const board: (Player | null)[] = Array(9).fill(null);
      newMoves.forEach((m) => (board[m.index] = m.player));
      const LINES = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6],
      ];
      let winner: string | null = null;
      for (const [a, b, c] of LINES) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
          winner = board[a];
          break;
        }
      }

      const nextPlayer = myRole === "X" ? "O" : "X";

      try {
        const { error: err } = await supabase
          .from("game_rooms")
          .update({
            moves: newMoves as unknown as string, // Cast to any matching Json type equivalent
            current_player: winner ? room.current_player : nextPlayer,
            winner,
          })
          .eq("id", roomId);

        if (err) {
          playSound("error");
          toast({ variant: "destructive", title: "Error", description: "Failed to record move." });
        } else {
          // Optimistic local update
          const updatedRoom: GameRoom = {
            ...room,
            moves: newMoves,
            current_player: winner ? room.current_player : nextPlayer,
            winner
          };
          setRoom(updatedRoom);
          prevMovesLenRef.current = updatedRoom.moves.length;
          prevWinnerRef.current = updatedRoom.winner;
          
          playSound("place");
          if (winner) fireConfetti();
        }
      } catch (err) {
        playSound("error");
        toast({ variant: "destructive", title: "Error", description: "Network error while making a move." });
      }
    },
    [room, myRole, isMyTurn, roomId]
  );

  // Reset game
  const resetGame = useCallback(async () => {
    if (!roomId || !room) return;

    try {
      const { error: err } = await supabase
        .from("game_rooms")
        .update({
          moves: [],
          current_player: "X",
          winner: null,
          status: "playing"
        })
        .eq("id", roomId);

      if (err) {
        playSound("error");
        toast({ variant: "destructive", title: "Error", description: "Failed to restart game." });
      } else {
        // Optimistic local update
        const updatedRoom: GameRoom = {
          ...room,
          moves: [],
          current_player: "X",
          winner: null,
          status: "playing"
        };
        setRoom(updatedRoom);
        prevMovesLenRef.current = 0;
        prevWinnerRef.current = null;
        playSound("join");
      }
    } catch (err) {
      playSound("error");
      toast({ variant: "destructive", title: "Error", description: "Network error while restarting game." });
    }
  }, [roomId, room]);

  return { room, loading, error, myRole, isMyTurn, playerId, joinRoom, makeMove, resetGame };
}

export async function createRoom(retries = 1): Promise<string | null> {
  const playerId = getPlayerId();
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const { data, error } = await supabase
        .from("game_rooms")
        .insert({ player_x_id: playerId })
        .select("id")
        .single();

      if (error) {
        if (attempt === retries) {
          console.error("Supabase error creating room:", error);
          toast({ variant: "destructive", title: "Error", description: "Failed to create game. Please try again." });
          return null;
        }
        await new Promise((res) => setTimeout(res, 500)); // wait 500ms before retry
        continue;
      }
      return data.id;
    } catch (err) {
      if (attempt === retries) {
        console.error("Network error creating room:", err);
        toast({ variant: "destructive", title: "Connection Error", description: "Failed to connect to the server." });
        return null;
      }
      await new Promise((res) => setTimeout(res, 500));
    }
  }
  return null;
}

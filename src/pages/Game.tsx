import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGameRoom, createRoom } from "@/hooks/useGameRoom";
import TicTacToe from "@/components/TicTacToe";
import GameLobby from "@/components/GameLobby";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function Game() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { room, loading, error, myRole, isMyTurn, joinRoom, makeMove, resetGame } = useGameRoom(roomId);

  // Auto-join if not a participant
  useEffect(() => {
    if (room && !room.winner && room.status === "waiting" && room.player_x_id !== room.player_o_id) {
      joinRoom();
    }
  }, [room, joinRoom]);

  const [restarting, setRestarting] = useState(false);

  const handlePlayAgain = async () => {
    setRestarting(true);
    try {
      await resetGame();
    } finally {
      setRestarting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="text-muted-foreground font-mono"
        >
          Loading...
        </motion.div>
      </main>
    );
  }

  if (error || !room) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 px-4">
        <p className="text-destructive font-medium">{error || "Room not found"}</p>
        <Button variant="secondary" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
        </Button>
      </main>
    );
  }

  const isWaiting = room.status === "waiting";
  const isSpectator = !myRole && room.status === "playing";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8 gap-4">
      <div className="flex items-center gap-3 mb-2">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Infinite Tic-Tac-Toe
        </h1>
      </div>

      {myRole && (
        <p className="text-xs text-muted-foreground">
          You are <span className={myRole === "X" ? "text-x font-bold" : "text-o font-bold"}>{myRole}</span>
        </p>
      )}

      {isSpectator && (
        <p className="text-xs text-muted-foreground">👀 Spectating</p>
      )}

      {isWaiting ? (
        <GameLobby roomId={room.id} />
      ) : (
        <>
          <TicTacToe
            moves={room.moves}
            currentPlayer={room.current_player as "X" | "O"}
            winner={room.winner}
            myRole={myRole}
            isMyTurn={isMyTurn}
            onMove={makeMove}
          />
          {room.winner && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Game over!</span>
              <Button onClick={handlePlayAgain} disabled={restarting} className="px-6">
                {restarting ? "Restarting..." : "Play again in same room"}
              </Button>
            </motion.div>
          )}
        </>
      )}

      {/* Connection indicator */}
      <div className="fixed bottom-4 right-4 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-[10px] text-muted-foreground">Live</span>
      </div>
    </main>
  );
}

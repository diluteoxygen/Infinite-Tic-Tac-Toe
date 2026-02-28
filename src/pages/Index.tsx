import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom } from "@/hooks/useGameRoom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();
  const [joinId, setJoinId] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const id = await createRoom();
      if (id) navigate(`/game/${id}`);
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = () => {
    const id = joinId.trim();
    if (!id) return;
    // Support full URL or just the ID
    const match = id.match(/\/game\/([a-f0-9-]+)/i);
    const roomId = match ? match[1] : id;
    navigate(`/game/${roomId}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12 gap-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2">
          Infinite Tic-Tac-Toe
        </h1>
        <p className="text-sm text-muted-foreground">
          the game that never fills up — play online with friends
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col items-center gap-6 w-full max-w-sm"
      >
        <Button
          onClick={handleCreate}
          disabled={creating}
          size="lg"
          className="w-full text-base font-semibold h-12"
        >
          {creating ? "Creating..." : "Create Game"}
        </Button>

        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="flex gap-2 w-full">
          <Input
            placeholder="Paste game link or ID"
            value={joinId}
            onChange={(e) => setJoinId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            className="flex-1 font-mono text-xs"
          />
          <Button variant="secondary" onClick={handleJoin} disabled={!joinId.trim()}>
            Join
          </Button>
        </div>
      </motion.div>

      <p className="text-xs text-muted-foreground max-w-[280px] text-center leading-relaxed">
        Each player keeps only 3 marks on the board. Your oldest mark vanishes when you place a 4th.
      </p>
    </main>
  );
};

export default Index;

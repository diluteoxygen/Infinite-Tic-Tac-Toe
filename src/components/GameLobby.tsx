import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GameLobbyProps {
  roomId: string;
}

export default function GameLobby({ roomId }: GameLobbyProps) {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/game/${roomId}`;

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-6 text-center px-4"
    >
      <div className="flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-muted-foreground text-sm">Waiting for opponent</span>
      </div>

      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="text-3xl font-mono text-muted-foreground"
      >
        . . .
      </motion.div>

      <p className="text-sm text-muted-foreground max-w-xs">
        Share this link with a friend to start playing:
      </p>

      <div className="flex items-center gap-2 w-full max-w-sm">
        <div className="flex-1 bg-muted rounded-lg px-3 py-2 text-xs font-mono text-foreground truncate">
          {link}
        </div>
        <Button size="sm" variant="secondary" onClick={copyLink} className="shrink-0">
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </motion.div>
  );
}

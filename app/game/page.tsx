"use client";

import dynamic from "next/dynamic";
import "../../app/globals.css";

const GameApp = dynamic(() => import("../../crypto-miner-verse/src/App"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center space-y-3">
        <div className="text-2xl font-retro text-arcade-cyan">Loading Scam Shooter…</div>
        <div className="text-sm font-mono text-gray-400">Booting the arcade cabinet</div>
      </div>
    </div>
  ),
});

export default function GamePage() {
  return <GameApp />;
}

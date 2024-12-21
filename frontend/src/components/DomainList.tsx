import { DomainEntry } from "@/types/game";
import { GameState } from "@/types/game";

interface DomainListProps {
  gameState: GameState;
}

export default function DomainList({ gameState }: DomainListProps) {
  const { entered_domains, players } = gameState;

  const getPlayerColor = (playerId: string): string => {
    const player = players.find((p) => p.nickname === playerId.split("_")[1]);
    return player?.color || "#000000";
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-[calc(100vh-24rem)] overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Entered Domains</h2>
      <div className="space-y-2">
        {entered_domains.map((entry, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-md border border-gray-100"
            style={{ backgroundColor: `${getPlayerColor(entry.player_id)}10` }}
          >
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-500">
                #{entry.rank}
              </span>
              <span className="font-medium">{entry.domain}</span>
            </div>
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getPlayerColor(entry.player_id) }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

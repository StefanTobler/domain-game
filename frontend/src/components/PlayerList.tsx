import { Player } from "@/types/game";

interface PlayerListProps {
  players: Player[];
}

export default function PlayerList({ players }: PlayerListProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold mb-4">Players</h2>
      <div className="space-y-2">
        {players.map((player, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 rounded-md"
            style={{ backgroundColor: `${player.color}20` }}
          >
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: player.color }}
              />
              <span className="font-medium">{player.nickname}</span>
            </div>
            <span className="font-bold">{player.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

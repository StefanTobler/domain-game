import { useState, useEffect } from "react";
import { GameState, WebSocketMessage } from "@/types/game";
import { gameWebSocket } from "@/utils/websocket";
import PlayerList from "./PlayerList";
import DomainList from "./DomainList";
import { BRAND_NAME } from "@/const/branding";

interface GameRoomProps {
  roomCode: string;
  nickname: string;
  onExit: () => void;
}

export default function GameRoom({
  roomCode,
  nickname,
  onExit,
}: GameRoomProps) {
  const [gameState, setGameState] = useState<GameState>({
    is_active: false,
    time_remaining: 60,
    players: [],
    entered_domains: [],
    latest_domain: null,
  });
  const [error, setError] = useState<string>("");
  const [domain, setDomain] = useState("");
  const [winner, setWinner] = useState<{
    nickname: string;
    score: number;
  } | null>(null);

  useEffect(() => {
    const connect = async () => {
      try {
        await gameWebSocket.connect(roomCode, nickname);
        const removeHandler = gameWebSocket.addMessageHandler(
          (message: WebSocketMessage) => {
            if (message.type === "game_update") {
              setGameState(message.game_state);
              setError("");
            } else if (message.type === "error") {
              setError(message.message);
            } else if (message.type === "game_over") {
              setWinner({
                nickname: message.winner.nickname,
                score: message.winner.score,
              });
            }
          }
        );

        return () => {
          removeHandler();
          gameWebSocket.disconnect();
        };
      } catch (err) {
        setError("Failed to connect to game server");
      }
    };

    connect();
  }, [roomCode, nickname]);

  const handleStartGame = () => {
    gameWebSocket.startGame();
  };

  const handleSubmitDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (domain.trim()) {
      gameWebSocket.submitDomain(domain.trim());
      setDomain("");
    }
  };

  const handleNewGame = () => {
    setWinner(null);
    gameWebSocket.startGame();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">{BRAND_NAME}</h1>
            <p className="text-gray-600">Room: {roomCode}</p>
          </div>
          <button
            onClick={onExit}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md"
          >
            Exit Room
          </button>
        </div>

        {winner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg text-center">
              <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
              <p className="mb-4">
                Winner: {winner.nickname} with {winner.score} points!
              </p>
              <button
                onClick={handleNewGame}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                New Game
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <PlayerList players={gameState.players} />
            {!gameState.is_active && gameState.players.length > 1 && (
              <button
                onClick={handleStartGame}
                className="w-full mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Start Game
              </button>
            )}
          </div>

          <div className="md:col-span-3">
            {gameState.latest_domain && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-800">
                  Latest domain:{" "}
                  <strong>{gameState.latest_domain.domain}</strong> (Rank:{" "}
                  {gameState.latest_domain.rank})
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {gameState.is_active && (
              <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Enter Domain</h2>
                  <div className="text-lg font-bold">
                    Time: {gameState.time_remaining}s
                  </div>
                </div>
                <form onSubmit={handleSubmitDomain} className="flex gap-2">
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="Enter a domain name..."
                    className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                  >
                    Submit
                  </button>
                </form>
              </div>
            )}

            <DomainList gameState={gameState} />
          </div>
        </div>
      </div>
    </div>
  );
}

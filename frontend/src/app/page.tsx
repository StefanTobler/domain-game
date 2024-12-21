"use client";

import { useState } from "react";
import GameRoom from "@/components/GameRoom";
import { BRAND_NAME } from "@/const/branding";
import { API_URL } from "@/const/api";

export default function Home() {
  const [nickname, setNickname] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [activeRoom, setActiveRoom] = useState<{
    code: string;
    nickname: string;
  } | null>(null);
  const [error, setError] = useState("");

  const handleCreateRoom = async () => {
    if (!nickname) {
      setError("Please enter a nickname");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/generate-room`);
      const data = await response.json();
      setActiveRoom({ code: data.room_code, nickname });
    } catch (err) {
      setError("Failed to create room");
    }
  };

  const handleJoinRoom = () => {
    if (!nickname) {
      setError("Please enter a nickname");
      return;
    }
    if (!roomCode) {
      setError("Please enter a room code");
      return;
    }

    setActiveRoom({ code: roomCode, nickname });
  };

  if (activeRoom) {
    return (
      <GameRoom
        roomCode={activeRoom.code}
        nickname={activeRoom.nickname}
        onExit={() => setActiveRoom(null)}
      />
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-8">{BRAND_NAME}</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label
              htmlFor="nickname"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your nickname"
            />
            <button
              onClick={handleJoinRoom}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Join Lobby
            </button>
          </div>

          {nickname && ( // Show room options only if nickname is entered
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="roomCode"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Room Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="roomCode"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter room code"
                  />
                  <button
                    onClick={handleJoinRoom}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                  >
                    Join
                  </button>
                </div>
              </div>

              <button
                onClick={handleCreateRoom}
                className="w-full bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
              >
                Create New Room
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

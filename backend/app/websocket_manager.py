from fastapi import WebSocket
from typing import Dict, Set
import json
from datetime import datetime, timedelta
import random
import string
from .models import Room, GameState, Player

class WebSocketManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}  # websocket_id -> connection
        self.rooms: Dict[str, Room] = {}  # room_code -> Room
        self.COLORS = [
            "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
            "#FFEEAD", "#D4A5A5", "#9B59B6", "#3498DB",
            "#E67E22", "#2ECC71"
        ]

    def generate_room_code(self) -> str:
        while True:
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            if code not in self.rooms:
                return code

    async def connect(self, websocket: WebSocket, room_code: str, username: str) -> str:
        await websocket.accept()
        websocket_id = f"{room_code}_{username}_{datetime.now().timestamp()}"
        self.active_connections[websocket_id] = websocket
        
        if room_code not in self.rooms:
            self.rooms[room_code] = Room(
                code=room_code,
                game_state=GameState(room_code=room_code)
            )

        # Assign a color to the player
        used_colors = {player.color for player in self.rooms[room_code].game_state.players.values()}
        available_colors = [c for c in self.COLORS if c not in used_colors]
        player_color = random.choice(available_colors if available_colors else self.COLORS)

        # Add player to the room
        self.rooms[room_code].game_state.players[websocket_id] = Player(
            username=username,
            color=player_color,
            websocket_id=websocket_id
        )
        
        self.rooms[room_code].last_activity = datetime.now()
        return websocket_id

    def disconnect(self, websocket_id: str):
        if websocket_id in self.active_connections:
            del self.active_connections[websocket_id]
            
        # Remove player from their room
        for room in self.rooms.values():
            if websocket_id in room.game_state.players:
                del room.game_state.players[websocket_id]

    def clean_inactive_rooms(self):
        current_time = datetime.now()
        inactive_rooms = [
            code for code, room in self.rooms.items()
            if current_time - room.last_activity > timedelta(minutes=10)
        ]
        for code in inactive_rooms:
            del self.rooms[code]

    async def broadcast_to_room(self, room_code: str, message: dict):
        if room_code in self.rooms:
            for player in self.rooms[room_code].game_state.players.values():
                if player.websocket_id in self.active_connections:
                    await self.active_connections[player.websocket_id].send_json(message)

    def get_room(self, room_code: str) -> Room:
        return self.rooms.get(room_code)

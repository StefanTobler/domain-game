from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import json
from typing import Optional

from .websocket_manager import WebSocketManager
from .game_logic import GameLogic
from .models import DomainEntry

app = FastAPI()

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize managers
websocket_manager = WebSocketManager()
game_logic = GameLogic()

# Load domain rankings on startup
@app.on_event("startup")
async def startup_event():
    game_logic.load_domain_rankings("top_10000_domains.txt")

@app.get("/generate-room")
async def generate_room():
    """Generate a new room code."""
    return {"room_code": websocket_manager.generate_room_code()}

@app.websocket("/ws/{room_code}/{username}")
async def websocket_endpoint(websocket: WebSocket, room_code: str, username: str):
    websocket_id = await websocket_manager.connect(websocket, room_code, username)
    
    try:
        # Send initial game state
        room = websocket_manager.get_room(room_code)
        if room:
            await websocket_manager.broadcast_to_room(
                room_code,
                game_logic.format_game_update(room.game_state)
            )

        while True:
            data = await websocket.receive_json()
            room = websocket_manager.get_room(room_code)
            
            if not room:
                await websocket.send_json({"type": "error", "message": "Room not found"})
                continue

            if data["type"] == "start_game":
                if not room.game_state.is_active:
                    room.game_state.is_active = True
                    room.game_state.start_time = datetime.now()
                    await websocket_manager.broadcast_to_room(
                        room_code,
                        game_logic.format_game_update(room.game_state)
                    )

            elif data["type"] == "submit_domain":
                if not room.game_state.is_active:
                    await websocket.send_json({"type": "error", "message": "Game not started"})
                    continue

                if game_logic.is_game_over(room.game_state):
                    await websocket.send_json({"type": "error", "message": "Game is over"})
                    continue

                domain = data["domain"].strip().lower()
                is_valid, rank = game_logic.validate_domain(domain)

                if not is_valid:
                    await websocket.send_json({"type": "error", "message": "Invalid domain"})
                    continue

                # Check if domain was already used
                if any(d["domain"] == domain for d in room.game_state.entered_domains):
                    await websocket.send_json({"type": "error", "message": "Domain already used"})
                    continue

                # Add domain and update score
                score = game_logic.calculate_score(rank)
                room.game_state.players[websocket_id].score += score
                
                domain_entry = DomainEntry(
                    domain=domain,
                    rank=rank,
                    player_id=websocket_id
                )
                
                room.game_state.entered_domains.append(domain_entry.dict())
                await websocket_manager.broadcast_to_room(
                    room_code,
                    game_logic.format_game_update(room.game_state, domain_entry)
                )

            # Check if game is over
            if game_logic.is_game_over(room.game_state):
                winner = game_logic.get_winner(room.game_state)
                if winner:
                    await websocket_manager.broadcast_to_room(
                        room_code,
                        {
                            "type": "game_over",
                            "winner": {
                                "username": winner.username,
                                "score": winner.score,
                                "color": winner.color
                            }
                        }
                    )
                room.game_state.is_active = False
                room.game_state.end_time = datetime.now()

    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket_id)
        room = websocket_manager.get_room(room_code)
        if room:
            await websocket_manager.broadcast_to_room(
                room_code,
                game_logic.format_game_update(room.game_state)
            )

    except Exception as e:
        print(f"Error: {str(e)}")
        websocket_manager.disconnect(websocket_id)

from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime

class Player(BaseModel):
    username: str
    color: str
    score: int = 0
    websocket_id: str

class GameState(BaseModel):
    is_active: bool = False
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    players: Dict[str, Player] = {}  # websocket_id -> Player
    entered_domains: List[Dict[str, str]] = []  # List of {domain, rank, player_id}
    room_code: str

class Room(BaseModel):
    code: str
    game_state: GameState
    last_activity: datetime = datetime.now()

class DomainEntry(BaseModel):
    domain: str
    rank: int
    player_id: str

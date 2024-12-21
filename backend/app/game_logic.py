import math
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from .models import GameState, Player, DomainEntry

class GameLogic:
    def __init__(self):
        self.domain_rankings: Dict[str, int] = {}  # domain -> rank
        self.GAME_DURATION = timedelta(seconds=60)

    def load_domain_rankings(self, filepath: str):
        """Load domain rankings from file."""
        try:
            with open(filepath, 'r') as f:
                for rank, domain in enumerate(f.readlines(), 1):
                    self.domain_rankings[domain.strip().lower()] = rank
        except FileNotFoundError:
            print(f"Warning: Domain rankings file not found at {filepath}")
            self.domain_rankings = {}

    def calculate_score(self, rank: int) -> int:
        """Calculate score for a domain based on its rank using logarithmic scoring."""
        if rank <= 0:
            return 0
        # Score formula: 1000 * (1 - log10(rank)/log10(10000))
        # This gives higher scores for lower ranks (better domains)
        max_rank = 10000
        score = 1000 * (1 - math.log10(rank) / math.log10(max_rank))
        return max(int(score), 1)  # Ensure minimum score of 1

    def validate_domain(self, domain: str) -> Tuple[bool, Optional[int]]:
        """Validate a domain and return its rank if valid."""
        domain = domain.lower().strip()
        rank = self.domain_rankings.get(domain)
        return (rank is not None, rank)

    def is_game_over(self, game_state: GameState) -> bool:
        """Check if the game is over based on time."""
        if not game_state.is_active or not game_state.start_time:
            return False
        return datetime.now() - game_state.start_time >= self.GAME_DURATION

    def get_winner(self, game_state: GameState) -> Optional[Player]:
        """Get the player with the highest score."""
        if not game_state.players:
            return None
        return max(game_state.players.values(), key=lambda p: p.score)

    def format_game_update(self, game_state: GameState, latest_domain: Optional[DomainEntry] = None) -> dict:
        """Format game state update for broadcasting."""
        return {
            "type": "game_update",
            "game_state": {
                "is_active": game_state.is_active,
                "time_remaining": (
                    max(0, (self.GAME_DURATION - (datetime.now() - game_state.start_time)).seconds)
                    if game_state.is_active and game_state.start_time
                    else self.GAME_DURATION.seconds
                ),
                "players": [
                    {
                        "username": player.username,
                        "color": player.color,
                        "score": player.score
                    }
                    for player in game_state.players.values()
                ],
                "entered_domains": game_state.entered_domains,
                "latest_domain": latest_domain.dict() if latest_domain else None
            }
        }

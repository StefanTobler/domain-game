# Domain Game Backend

A FastAPI-based backend for the multiplayer domain name guessing game.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Place your `top_10000_domains.txt` file in the root directory. Each line should contain one domain name.

## Running the Server

Start the server with:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The server will be available at `http://localhost:8000`.

## API Endpoints

- `GET /generate-room`: Generate a new room code
- `WebSocket /ws/{room_code}/{username}`: WebSocket endpoint for game communication

## WebSocket Messages

### Client to Server:
1. Start Game:
```json
{
    "type": "start_game"
}
```

2. Submit Domain:
```json
{
    "type": "submit_domain",
    "domain": "example.com"
}
```

### Server to Client:
1. Game Update:
```json
{
    "type": "game_update",
    "game_state": {
        "is_active": true,
        "time_remaining": 60,
        "players": [...],
        "entered_domains": [...],
        "latest_domain": {...}
    }
}
```

2. Game Over:
```json
{
    "type": "game_over",
    "winner": {
        "username": "player1",
        "score": 1000,
        "color": "#FF6B6B"
    }
}
```

3. Error:
```json
{
    "type": "error",
    "message": "Error message"
}
```

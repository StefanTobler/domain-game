export interface Player {
  nickname: string;
  color: string;
  score: number;
}

export interface DomainEntry {
  domain: string;
  rank: number;
  player_id: string;
}

export interface GameState {
  is_active: boolean;
  time_remaining: number;
  players: Player[];
  entered_domains: DomainEntry[];
  latest_domain: DomainEntry | null;
}

export interface GameUpdate {
  type: "game_update";
  game_state: GameState;
}

export interface GameOver {
  type: "game_over";
  winner: Player;
}

export interface ErrorMessage {
  type: "error";
  message: string;
}

export type WebSocketMessage = GameUpdate | GameOver | ErrorMessage;

export interface StartGameMessage {
  type: "start_game";
}

export interface SubmitDomainMessage {
  type: "submit_domain";
  domain: string;
}

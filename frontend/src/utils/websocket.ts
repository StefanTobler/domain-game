import { WS_URL } from "@/const/api";
import {
  WebSocketMessage,
  StartGameMessage,
  SubmitDomainMessage,
} from "@/types/game";

export class GameWebSocket {
  private ws: WebSocket | null = null;
  private messageHandlers: ((message: WebSocketMessage) => void)[] = [];

  constructor(private baseUrl: string = WS_URL) {}

  connect(roomCode: string, nickname: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`${this.baseUrl}/ws/${roomCode}/${nickname}`);

        this.ws.onmessage = (event) => {
          const message = JSON.parse(event.data) as WebSocketMessage;
          this.messageHandlers.forEach((handler) => handler(message));
        };

        this.ws.onopen = () => {
          resolve();
        };

        this.ws.onerror = (error) => {
          reject(error);
        };

        this.ws.onclose = () => {
          this.ws = null;
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  addMessageHandler(handler: (message: WebSocketMessage) => void) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    };
  }

  startGame() {
    const message: StartGameMessage = { type: "start_game" };
    this.sendMessage(message);
  }

  submitDomain(domain: string) {
    const message: SubmitDomainMessage = { type: "submit_domain", domain };
    this.sendMessage(message);
  }

  private sendMessage(message: StartGameMessage | SubmitDomainMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
}

// Create a singleton instance
export const gameWebSocket = new GameWebSocket();

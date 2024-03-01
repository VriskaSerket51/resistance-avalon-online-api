import { Room, Client } from "@colyseus/core";
import { GameRoomState } from "./schema/GameRoomState";
import { Player } from "./schema/Player";

type GameRoomOption = {
  title: string;
  password: string;
};

type ClientOption = {
  nickname: string;
};

export class GameRoom extends Room<GameRoomState> {
  maxClients = 10;

  onCreate(options: GameRoomOption) {
    this.setMetadata({
      title: options.title,
      players: this.clients.length,
      maxPlayers: this.maxClients,
    });
    this.setState(new GameRoomState());
  }

  onJoin(client: Client, options: ClientOption) {
    const player = new Player();
    player.name = options.nickname;

    this.state.players.set(client.sessionId, player);
    console.log(client.sessionId, "joined!");
  }

  onLeave(client: Client, consented: boolean) {
    this.state.players.delete(client.sessionId);

    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

  handleMessages() {
    this.onMessage("game.start", (client, message) => {
      //
      // handle "type" message
      //
    });
  }
}

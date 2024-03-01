import { Schema, MapSchema, type } from "@colyseus/schema";
import { Player } from "./Player";

export class GameRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();

  @type("number") questSuccessed: number = 0;
  @type("number") questFailed: number = 0;

  @type("number") noQuestCount: number = 0;
}

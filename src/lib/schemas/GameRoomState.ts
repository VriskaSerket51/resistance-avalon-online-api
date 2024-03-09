import { ArraySchema, Schema, MapSchema, type } from "@colyseus/schema";
import { Player } from "./Player";
import { GameState, Team } from "../types";
import { PlayerSummary } from "./PlayerSummary";

export class GameRoomState extends Schema {
  @type("string") title: string;
  @type("string") password: string;

  @type({ map: Player }) players = new MapSchema<Player>();
  @type(["string"]) roles = new ArraySchema<string>();
  @type("number") round: number = 0;

  @type(Player) leader: Player;
  @type("string") gameState: GameState = GameState.Wait;

  @type("number") questSucceed: number = 0;
  @type("number") questFailed: number = 0;
  @type("number") noQuestCount: number = 0;

  @type("string") winTeam: Team;
  @type("string") teamRevealed: string;
  @type([PlayerSummary]) result = new ArraySchema<PlayerSummary>();

  masterId: string = "";
  leaderIndex: number = -1;
  questApproveMap: { [key: string]: boolean } = {};
  questSucceedMap: { [key: string]: boolean } = {};
  questMembers: string[];
}

import { Schema, Context, type } from "@colyseus/schema";

type Role =
  | "good"
  | "bad"
  | "merlin"
  | "percival"
  | "assassin"
  | "morgana"
  | "oberon"
  | "mordred";

export class Player extends Schema {
  @type("string") name: string;

  role: Role;
}

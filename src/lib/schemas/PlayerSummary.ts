import { Schema, type } from "@colyseus/schema";

export class PlayerSummary extends Schema {
  constructor({
    id,
    name,
    team,
    role,
  }: {
    id: string;
    name: string;
    team: string;
    role: string;
  }) {
    super();
    this.id = id;
    this.name = name;
    this.team = team;
    this.role = role;
  }

  @type("string") id: string;
  @type("string") name: string;
  @type("string") team: string;
  @type("string") role: string;
}

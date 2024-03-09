import { Schema, type } from "@colyseus/schema";
import { Role } from "../types";

export class Player extends Schema {
  constructor({ id, name }: { id: string; name: string }) {
    super();
    this.id = id;
    this.name = name;
  }

  @type("string") id: string;
  @type("boolean") isMaster: boolean = false;
  @type("boolean") isConnected: boolean = true;
  @type("boolean") isKicked: boolean = false;
  @type("string") name: string;
  @type("number") index: number;
  role: Role;
  view: string[];
}

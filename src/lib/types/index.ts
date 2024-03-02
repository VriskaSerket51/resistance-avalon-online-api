export enum ExitCode {
  Kick = 4500,
  PasswordWrong = 4501,
}

export enum GameState {
  Wait = "wait",
  Choose = "choose",
  Vote = "vote",
  Quest = "quest",
  End = "end",
  Result = "result",
}

export type RoomMetadata = {
  title: string;
  hasPassword: boolean;
};

export type GameRoomOption = {
  title: string;
  password?: string;
};

export type ClientOption = {
  nickname: string;
  password?: string;
};

export type Team = "citizen" | "mafia";

export type RoleName =
  | "Citizen"
  | "Mafia"
  | "Merlin"
  | "Percival"
  | "Assassin"
  | "Morgana"
  | "Oberon"
  | "Mordred";

export type Role = {
  id: number;
  team: Team;
  name: string;
};

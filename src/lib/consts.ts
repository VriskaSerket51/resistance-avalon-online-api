import { Role, RoleName } from "./types";

export const Roles: { [K in RoleName]: Role } = {
  Citizen: {
    id: 1,
    team: "citizen",
    name: "아서 왕의 신하",
  },
  Mafia: {
    id: 2,
    team: "mafia",
    name: "모드레드의 수하",
  },
  Merlin: {
    id: 3,
    team: "citizen",
    name: "멀린",
  },
  Percival: {
    id: 4,
    team: "citizen",
    name: "퍼시벌",
  },
  Assassin: {
    id: 5,
    team: "mafia",
    name: "암살자",
  },
  Morgana: {
    id: 6,
    team: "mafia",
    name: "모르가나",
  },
  Oberon: {
    id: 7,
    team: "mafia",
    name: "오베론",
  },
  Mordred: {
    id: 8,
    team: "mafia",
    name: "모드레드",
  },
} as const;

export const QuestPlayers: { [key: number]: number[] } = {
  5: [2, 3, 2, 3, 3],
  6: [2, 3, 4, 3, 4],
  7: [2, 3, 3, 4, 4],
  8: [3, 4, 4, 5, 5],
  9: [3, 4, 4, 5, 5],
  10: [3, 4, 4, 5, 5],
} as const;

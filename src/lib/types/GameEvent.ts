import { Role } from ".";

export enum GameEvent {
  StartGameRequest = "game.start.request",
  StartGameResponse = "game.start.response",
  KickPlayerRequest = "game.kick.player.request",
  KickPlayerResponse = "game.kick.player.response",
  RoleSelectEvent = "event.role.select",
  ChooseMemberRequest = "choose.member.request",
  ChooseMemberResponse = "choose.member.response",
  VoteEvent = "event.vote",
  VoteRequest = "vote.request",
  VoteResponse = "vote.response",
  QuestEvent = "event.quest",
  QuestRequest = "quest.request",
  QuestResponse = "quest.response",
  KillMerlinRequest = "game.end.assasin.request",
  KillMerlinResponse = "game.end.assasin.response",
  ResetRoomRequest = "game.restart.request",
  ResetRoomResponse = "game.restart.response",
}

type DefaultResponse = {
  status?: number;
  message?: string;
};

export type StartGameRequest = {};

export type StartGameResponse = DefaultResponse & {};

export type RoleSelectEvent = {
  role: Role;
  view: string[];
};

export type ChooseMemberRequest = {
  memberIds: string[];
};

export type VoteEvent = {
  members: string[];
};

export type VoteRequest = {
  approved: boolean;
};

export type VoteResponse = {
  approved: string[];
  disapproved: string[];
};

export type QuestRequest = {
  succeed: boolean;
};

export type QuestResponse = {
  succeed: number;
  failed: number;
};

export type KillMerlinRequest = {
  merlinId: string;
};

export type KickPlayerRequest = {
  id: string;
};

import { Room, Client, ServerError } from "@colyseus/core";

import { GameRoomState } from "@/lib/schemas/GameRoomState";
import { Player } from "@/lib/schemas/Player";
import {
  ChooseMemberRequest,
  GameChatRequest,
  GameChatRespone,
  GameEvent,
  GameTerminatedEvent,
  KickPlayerRequest,
  KillMerlinRequest,
  QuestRequest,
  QuestResponse,
  RoleSelectEvent,
  StartGameRequest,
  VoteRequest,
  VoteResponse,
} from "@/lib/types/GameEvent";
import { range, shuffle } from "@/utils";
import {
  ClientOption,
  ExitCode,
  GameRoomOption,
  GameState,
  Role,
  RoomMetadata,
} from "@/lib/types";
import { QuestPlayers, Roles } from "@/lib/consts";
import { PlayerSummary } from "@/lib/schemas/PlayerSummary";

export class GameRoom extends Room<GameRoomState> {
  maxClients = 10;

  onCreate(options: GameRoomOption) {
    const metadata: RoomMetadata = {
      title: options.title,
      hasPassword: Boolean(options.password),
    };
    this.setMetadata(metadata);
    this.setState(new GameRoomState());
    this.state.title = options.title.trim();
    this.state.password = options.password?.trim();
    this.handleMessages();
  }

  onAuth(_: Client, options: ClientOption) {
    const { password } = options;
    if (this.state.password && this.state.password != password?.trim()) {
      throw new ServerError(ExitCode.PasswordWrong, "wrong password");
    }
    return true;
  }

  onJoin(client: Client, options: ClientOption) {
    const { nickname } = options;

    const player = new Player({
      id: client.sessionId,
      name: nickname,
    });

    if (this.state.players.size == 0) {
      this.state.masterId = client.sessionId;
      player.isMaster = true;
    }

    this.state.players.set(client.sessionId, player);
  }

  async onLeave(client: Client, consented: boolean) {
    if (this.clients.length == 0) {
      Object.values(this._reconnections).forEach(([_, reconnection]) => {
        reconnection.reject();
      });
      return;
    }

    this._reconnections;

    const player = this.state.players.get(client.sessionId);
    if (!player) {
      return;
    }
    player.isConnected = false;

    if (this.state.gameState != GameState.Wait) {
      this.checkVoteEnded();
      this.checkQuestEnded();
      this.checkGameEnded();
    }

    try {
      if (consented) {
        throw new Error("consented leave");
      }

      if (player.isKicked) {
        throw new Error("kicked player");
      }

      if (this.state.gameState == GameState.Wait) {
        await this.allowReconnection(client, 10);
      } else {
        const reconnection = this.allowReconnection(client, "manual");
        await reconnection;
      }

      player.isConnected = true;

      if (this.state.gameState != GameState.Wait) {
        const event: RoleSelectEvent = {
          role: player.role,
          view: player.view,
        };
        client.send(GameEvent.RoleSelectEvent, event);
      }

      if (
        this.state.gameState == GameState.Vote &&
        !this.state.questApproveMap[client.sessionId]
      ) {
        const members = this.state.questMembers.map((memberId) =>
          this.getPlayerName(memberId)
        );
        client.send(GameEvent.VoteEvent, {
          members: members,
        });
      } else if (
        this.state.gameState == GameState.Quest &&
        this.state.questMembers.includes(client.sessionId) &&
        !this.state.questSucceedMap[client.sessionId]
      ) {
        client.send(GameEvent.QuestEvent);
      }
    } catch (e) {
      this.state.players.delete(client.sessionId);
      if (this.clients.length == 0) {
        return;
      }
      const master = this.clients.at(0);
      this.state.masterId = master.id;
      this.state.players.get(master.id).isMaster = true;
      if (this.state.gameState != GameState.Wait && this.clients.length < 5) {
        const event: GameTerminatedEvent = {
          status: -1,
          message: "인원 수가 부족하여 게임이 강제 종료되었습니다.",
        };
        this.broadcast(GameEvent.GameTerminatedEvent, event);
        this.state.gameState = GameState.Wait;
        return;
      }
    }
  }

  onDispose() {}

  handleMessages() {
    this.onMessage(
      GameEvent.StartGameRequest,
      (client, _: StartGameRequest) => {
        const players = this.state.players.size;
        if (
          this.state.gameState == GameState.Wait &&
          client.sessionId == this.state.masterId &&
          players >= 5
        ) {
          this.lock();
          const roles: Role[] = [
            Roles.Citizen,
            Roles.Citizen,
            Roles.Merlin,
            Roles.Assassin,
          ];
          if (players == 5) {
            roles.push(Roles.Mafia);
          } else if (players == 6) {
            roles.unshift(Roles.Percival);
            if (Math.random() < 0.5) {
              roles.push(Roles.Morgana);
            } else {
              roles.push(Roles.Mordred);
            }
          } else if (players == 7) {
            if (Math.random() < 0.5) {
              roles.unshift(Roles.Percival);
              roles.push(Roles.Morgana);
              if (Math.random() < 0.33) {
                roles.push(Roles.Mordred);
              } else if (Math.random() < 0.66) {
                roles.push(Roles.Oberon);
              } else {
                roles.push(Roles.Mafia);
              }
            } else {
              roles.unshift(Roles.Citizen);
              roles.push(Roles.Mafia);
              roles.push(Roles.Mafia);
            }
          } else if (players == 8) {
            if (Math.random() < 0.5) {
              roles.unshift(Roles.Citizen);
              roles.unshift(Roles.Percival);
              roles.push(Roles.Morgana);
              if (Math.random() < 0.33) {
                roles.push(Roles.Mordred);
              } else if (Math.random() < 0.66) {
                roles.push(Roles.Oberon);
              } else {
                roles.push(Roles.Mafia);
              }
            } else {
              roles.unshift(Roles.Citizen);
              roles.unshift(Roles.Citizen);
              roles.push(Roles.Mafia);
              roles.push(Roles.Mafia);
            }
          } else if (players == 9) {
            roles.unshift(Roles.Citizen);
            roles.unshift(Roles.Citizen);
            roles.unshift(Roles.Percival);
            roles.push(Roles.Morgana);
            roles.push(Roles.Mordred);
          } else if (players == 10) {
            roles.unshift(Roles.Citizen);
            roles.unshift(Roles.Citizen);
            roles.unshift(Roles.Percival);
            roles.push(Roles.Morgana);
            roles.push(Roles.Mordred);
            if (Math.random() < 0.5) {
              roles.push(Roles.Oberon);
            } else {
              roles.push(Roles.Mafia);
            }
          }

          this.state.roles.push(...roles.map((role) => role.name));

          const roleMap: { [key: string]: Role } = {};

          const allocated = [...roles];
          const indices = range(this.state.players.size);
          shuffle(allocated);
          shuffle(indices);
          this.state.players.forEach((player) => {
            player.role = allocated.pop();
            player.index = indices.pop();
            roleMap[player.id] = player.role;
          });

          this.clients.forEach((client) => {
            const player = this.state.players.get(client.sessionId);
            if (!player) {
              return;
            }
            const view: string[] = [];
            if (player.role.id == Roles.Merlin.id) {
              view.push(
                ...Object.entries(roleMap)
                  .filter(
                    ([_, role]) =>
                      role.team == "mafia" && role.id != Roles.Mordred.id
                  )
                  .map(([id]) => this.getPlayerName(id))
              );
            } else if (player.role.team == "mafia") {
              view.push(
                ...Object.entries(roleMap)
                  .filter(
                    ([id, role]) =>
                      player.role.id != Roles.Oberon.id &&
                      player.id != id &&
                      role.team == "mafia" &&
                      role.id != Roles.Oberon.id
                  )
                  .map(([id]) => this.getPlayerName(id))
              );
            } else if (player.role.id == Roles.Percival.id) {
              view.push(
                ...Object.entries(roleMap)
                  .filter(
                    ([_, role]) =>
                      role.id == Roles.Merlin.id || role.id == Roles.Morgana.id
                  )
                  .map(([id]) => this.getPlayerName(id))
              );
            }
            player.view = view;
            client.send(GameEvent.RoleSelectEvent, {
              role: player.role,
              view: view,
            });
          });

          this.state.leader = this.getNextLeader();
          this.state.gameState = GameState.Choose;
          client.send(GameEvent.StartGameResponse);
        } else {
          client.send(GameEvent.StartGameResponse, {
            status: -1,
            message: "인원 수가 부족합니다.",
          });
        }
      }
    );
    this.onMessage(
      GameEvent.KickPlayerRequest,
      (client, request: KickPlayerRequest) => {
        const { id } = request;
        const kicked = this.clients.getById(id);
        const kickedPlayer = this.state.players.get(id);
        if (kicked) {
          kicked.leave(ExitCode.Kick);
        }
        if (kickedPlayer) {
          kickedPlayer.isKicked = true;
        }
        client.send(GameEvent.KickPlayerResponse);
      }
    );
    this.onMessage(
      GameEvent.ChooseMemberRequest,
      (client, request: ChooseMemberRequest) => {
        const { memberIds } = request;
        if (
          this.state.gameState == GameState.Choose &&
          client.sessionId == this.state.leader.id &&
          this.state.players.size >= 5 &&
          this.state.players.size <= 10 &&
          memberIds.length ==
            QuestPlayers[this.state.players.size][this.state.round]
        ) {
          this.state.gameState = GameState.Vote;
          this.state.questMembers = memberIds;
          const members = memberIds.map((memberId) =>
            this.getPlayerName(memberId)
          );
          this.broadcast(GameEvent.VoteEvent, {
            members: members,
          });
          client.send(GameEvent.ChooseMemberResponse);
        }
      }
    );
    this.onMessage(GameEvent.VoteRequest, (client, request: VoteRequest) => {
      const { approved } = request;
      if (this.state.gameState == GameState.Vote) {
        this.state.questApproveMap[client.sessionId] = approved;
        this.checkVoteEnded();
      }
    });
    this.onMessage(GameEvent.QuestRequest, (client, request: QuestRequest) => {
      const { succeed } = request;
      if (
        this.state.gameState == GameState.Quest &&
        this.state.questMembers.includes(client.sessionId)
      ) {
        this.state.questSucceedMap[client.sessionId] = succeed;
        this.checkQuestEnded();
      }
    });
    this.onMessage(
      GameEvent.KillMerlinRequest,
      (client, request: KillMerlinRequest) => {
        const { merlinId } = request;
        if (this.state.gameState == GameState.End) {
          let merlin: Player | null = null;
          for (const [_, player] of this.state.players) {
            if (player.role.id == Roles.Merlin.id) {
              merlin = player;
              break;
            }
          }
          if (merlin?.id == merlinId) {
            this.state.winTeam = "mafia";
          } else {
            this.state.winTeam = "citizen";
          }
          this.revealRoles();
          this.state.gameState = GameState.Result;
          client.send(GameEvent.KillMerlinResponse);
        }
      }
    );
    this.onMessage(GameEvent.ResetRoomRequest, (client) => {
      if (this.state.masterId == client.sessionId) {
        this.resetGame();
        Object.values(this._reconnections).forEach(([_, reconnection]) => {
          reconnection.reject();
        });
        this.unlock();
        client.send(GameEvent.ResetRoomResponse);
      }
    });
    this.onMessage(
      GameEvent.GameChatRequest,
      (client, request: GameChatRequest) => {
        const player = this.state.players.get(client.sessionId);
        const response: GameChatRespone = {
          name: player.name,
          text: request.text,
          datetime: request.datetime,
        };
        this.broadcast(GameEvent.GameChatResponse, response);
      }
    );
  }

  resetGame() {
    this.state.gameState = GameState.Wait;
    this.state.roles.clear();
    this.state.round = 0;
    this.state.leader = undefined;
    this.state.leaderIndex = -1;
    this.state.questSucceed = 0;
    this.state.questFailed = 0;
    this.state.noQuestCount = 0;
    this.state.winTeam = undefined;
    this.state.result.clear();
  }

  checkVoteEnded() {
    const voted = Object.keys(this.state.questApproveMap);
    if (
      this.state.gameState == GameState.Vote &&
      [...this.state.players.values()].filter(
        (player) => player.isConnected && !voted.includes(player.id)
      ).length == 0
    ) {
      const approved = Object.entries(this.state.questApproveMap).filter(
        ([_, value]) => value
      );
      const disapproved = Object.entries(this.state.questApproveMap).filter(
        ([_, value]) => !value
      );
      const response: VoteResponse = {
        approved: [...approved].map(([id]) => this.getPlayerName(id)),
        disapproved: [...disapproved].map(([id]) => this.getPlayerName(id)),
      };
      this.state.questApproveMap = {};
      this.broadcast(GameEvent.VoteResponse, response);
      if (disapproved.length > approved.length) {
        this.state.noQuestCount++;
        if (this.state.noQuestCount == 5) {
          this.state.questFailed++;
          this.state.round++;
        }
        this.state.leader = this.getNextLeader();
        this.state.gameState = GameState.Choose;
        this.checkGameEnded();
      } else {
        this.state.noQuestCount = 0;
        this.state.gameState = GameState.Quest;
        this.state.questMembers.forEach((id) => {
          const client = this.clients.getById(id);
          if (!client) {
            return;
          }
          client.send(GameEvent.QuestEvent);
        });
      }
    }
  }

  checkQuestEnded() {
    const succeedBuffer = Object.keys(this.state.questSucceedMap);
    if (
      this.state.gameState == GameState.Quest &&
      [...this.state.questMembers].filter(
        (id) =>
          this.state.players.get(id)?.isConnected && !succeedBuffer.includes(id)
      ).length == 0
    ) {
      const succeed = Object.values(this.state.questSucceedMap).filter(
        (v) => v
      ).length;
      const failed = succeedBuffer.length - succeed;
      this.state.questSucceedMap = {};
      if (
        failed == 0 ||
        (this.state.round == 3 && this.state.players.size >= 7 && failed == 1)
      ) {
        this.state.questSucceed++;
      } else {
        this.state.questFailed++;
      }
      const response: QuestResponse = {
        succeed: succeed,
        failed: failed,
      };
      this.broadcast(GameEvent.QuestResponse, response);
      this.state.round++;
      this.state.leader = this.getNextLeader();
      this.state.gameState = GameState.Choose;
      this.checkGameEnded();
    }
  }

  checkGameEnded() {
    if (this.state.questSucceed >= 3) {
      this.state.gameState = GameState.End;
    } else if (this.state.questFailed >= 3) {
      this.revealRoles();
      this.state.winTeam = "mafia";
      this.state.gameState = GameState.Result;
    }
  }

  revealRoles() {
    this.state.players.forEach((player) => {
      this.state.result.push(
        new PlayerSummary({
          id: player.id,
          name: player.name,
          team: player.role.team,
          role: player.role.name,
        })
      );
    });
  }

  getPlayerName(id: string) {
    return this.state.players.get(id)?.name || "(알 수 없음)";
  }

  getNextLeader() {
    const players = [...this.state.players.values()].sort(
      (a, b) => a.index - b.index
    );
    this.state.leaderIndex++;
    if (this.state.leaderIndex >= this.state.players.size) {
      this.state.leaderIndex = 0;
    }
    for (const player of players) {
      if (player.isConnected && player.index >= this.state.leaderIndex) {
        this.state.leaderIndex = player.index;
        return player;
      }
    }
    this.state.leaderIndex = 0;
    for (const player of players) {
      if (player.isConnected && player.index >= this.state.leaderIndex) {
        this.state.leaderIndex = player.index;
        return player;
      }
    }
  }
}

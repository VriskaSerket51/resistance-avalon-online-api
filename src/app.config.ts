import config from "@colyseus/tools";
import { monitor } from "@colyseus/monitor";
import basicAuth from "express-basic-auth";

import { GameRoom } from "./rooms/GameRoom";

const basicAuthMiddleware = basicAuth({
  users: {
    [`${process.env.ID}`]: `${process.env.PW}`,
  },

  challenge: true,
});

export default config({
  initializeGameServer: (gameServer) => {
    gameServer.define("game_room", GameRoom);
  },

  initializeExpress: (app) => {
    app.use("/admin", basicAuthMiddleware, monitor());
  },

  beforeListen: () => {},
});

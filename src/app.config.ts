import config from "@colyseus/tools";
import { monitor } from "@colyseus/monitor";
import express from "express";
import basicAuth from "express-basic-auth";
import path from "path";

import { GameRoom } from "./rooms/GameRoom";

const basicAuthMiddleware = basicAuth({
  users: {
    admin: "admin",
  },

  challenge: true,
});

export default config({
  initializeGameServer: (gameServer) => {
    gameServer.define("game_room", GameRoom);
  },

  initializeExpress: (app) => {
    app.use(
      "/",
      express.static(
        path.join(__dirname, "..", "..", "resistance-avalon-online-web", "dist")
      )
    );

    app.use("/admin", basicAuthMiddleware, monitor());
  },

  beforeListen: () => {},
});

import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import { Session } from "./Session.js";

const PORT = Number(process.env.PORT ?? 8787);

const server = createServer((_req, res) => {
  res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
  res.end("WMR dungeon server OK\n");
});

const wss = new WebSocketServer({ server, path: "/ws" });
let nextId = 1;

wss.on("connection", (ws) => {
  const playerId = `p${nextId++}`;
  const session = new Session(ws, playerId);
  ws.on("message", (data) => session.handle(String(data)));
  ws.on("close", () => session.dispose());
});

server.listen(PORT, () => {
  console.log(`[wmr-server] ws://localhost:${PORT}/ws`);
});

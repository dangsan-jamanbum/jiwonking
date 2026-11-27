
const http = require("http");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "public");
const mime = {".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8"};

const server = http.createServer((req,res) => {
  let pathname = decodeURIComponent((req.url || "/").split("?")[0]);
  if (pathname === "/") pathname = "/index.html";
  const file = path.normalize(path.join(publicDir, pathname));
  if (!file.startsWith(publicDir)) { res.writeHead(403); return res.end("Forbidden"); }
  fs.readFile(file, (err,data) => {
    if (err) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, {"Content-Type": mime[path.extname(file)] || "application/octet-stream"});
    res.end(data);
  });
});

const wss = new WebSocket.Server({server});
const players = new Map();
const items = [
  {id:"storm", kind:"delay", label:"폭풍 구름", x:-12, z:-8, active:true},
  {id:"snow", kind:"delay", label:"폭설 경보", x:-7, z:8, active:true},
  {id:"shipfault", kind:"delay", label:"선박 결함 키트", x:7, z:-10, active:true},
  {id:"warehouse", kind:"delay", label:"창고 사고", x:13, z:7, active:true},
  {id:"customs", kind:"delay", label:"세관 검사", x:0, z:13, active:true},
  {id:"snowblower", kind:"fix", label:"만능 제설기", x:-17, z:2, active:true},
  {id:"soldiers", kind:"fix", label:"군인 출동 명령서", x:-16, z:-13, active:true},
  {id:"staff", kind:"fix", label:"사내 잉여 인력", x:17, z:-3, active:true},
  {id:"lobby", kind:"fix", label:"세관사 로비 서류", x:3, z:-16, active:true}
];
let ship = {delay:0, reasons:[], departure:"2026-11-27 18:00"};
let nextId = 1;

function snapshot() {
  return {type:"state", players:[...players.values()], items, ship};
}
function broadcast(obj, except=null) {
  const msg = JSON.stringify(obj);
  for (const [ws] of wss.clients.entries()) {
    if (ws.readyState === WebSocket.OPEN && ws !== except) ws.send(msg);
  }
}
wss.on("connection", ws => {
  const id = "p" + nextId++;
  const color = ["#f4b942","#56c7d8","#f17f7f","#9b8cf5","#7fc78a"][((nextId-2)%5)];
  const player = {id, name:"플레이어 "+id.slice(1), x:0, z:0, rot:0, color, carrying:null};
  players.set(ws, player);
  ws.send(JSON.stringify({type:"welcome", id, state:snapshot()}));
  broadcast({type:"join", player}, ws);

  ws.on("message", raw => {
    let msg; try { msg = JSON.parse(raw.toString()); } catch { return; }
    const p = players.get(ws); if (!p) return;
    if (msg.type === "move") {
      p.x = Math.max(-23, Math.min(23, Number(msg.x)||0));
      p.z = Math.max(-23, Math.min(23, Number(msg.z)||0));
      p.rot = Number(msg.rot)||0;
      p.carrying = msg.carrying || null;
      broadcast({type:"player", player:p}, ws);
    }
    if (msg.type === "pickup") {
      const item = items.find(i => i.id === msg.itemId && i.active);
      if (item && !p.carrying) {
        item.active = false; p.carrying = item.id;
        broadcast({type:"items", items});
        broadcast({type:"player", player:p});
      }
    }
    if (msg.type === "drop") {
      const item = items.find(i => i.id === p.carrying);
      if (item) { item.active = true; item.x = p.x; item.z = p.z; }
      p.carrying = null;
      broadcast({type:"items", items});
      broadcast({type:"player", player:p});
    }
    if (msg.type === "apply") {
      const item = items.find(i => i.id === p.carrying);
      if (item && Math.hypot(p.x, p.z + 20) < 7) {
        if (item.kind === "delay") {
          ship.delay += item.id === "storm" || item.id === "snow" ? 2 : 1;
          ship.reasons.push(item.label);
        } else {
          const targets = {snowblower:["snow"],soldiers:["storm"],staff:["warehouse"],lobby:["customs"]};
          const removed = targets[item.id] || [];
          ship.reasons = ship.reasons.filter(r => !removed.some(id => items.find(x=>x.id===id)?.label===r));
          ship.delay = Math.max(0, ship.delay - 1);
        }
        const carriedId = p.carrying;
        const consumed = items.find(i=>i.id===carriedId);
        if (consumed) consumed.active = false;
        p.carrying = null;
        ship.departure = "지연 "+ship.delay+"시간";
        broadcast({type:"items", items});
        broadcast({type:"ship", ship});
        broadcast({type:"player", player:p});
      }
    }
  });
  ws.on("close", () => { players.delete(ws); broadcast({type:"leave", id}); });
});
server.listen(PORT, () => console.log(`ATD Harbor running at http://localhost:${PORT}`));

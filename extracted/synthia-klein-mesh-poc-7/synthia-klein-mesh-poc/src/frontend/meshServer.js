// meshServer.js — run with: npm run frontend
// Runs the real EventMesh + all 9 tools (8 Klein tools + Head), broadcasts
// every mesh event (messages AND channel emergence) over WebSocket so the
// browser front-end can draw the morphing network live — edges literally
// appear on screen the instant a channel emerges, because that's the same
// 'mesh:emergence' event driving both the Node-side log and the browser draw.

import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';

import { EventMesh } from '../mesh/EventMesh.js';
import { AutoLing } from '../tools/autoling.js';
import { Diseminer } from '../tools/diseminer.js';
import { NovelWriter } from '../tools/novelWriter.js';
import { Messy } from '../tools/messy.js';
import { AnalogyEngine } from '../tools/analogyEngine.js';
import { IChingGrammar } from '../tools/iChingGrammar.js';
import { LanguageContact } from '../tools/languageContact.js';
import { HistoricalMonteCarlo } from '../tools/historicalMonteCarlo.js';
import { Head } from '../tools/head.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.MESH_PORT || 8787;

const mesh = new EventMesh();
const tools = {
  AutoLing: new AutoLing(mesh),
  Diseminer: new Diseminer(mesh),
  NovelWriter: new NovelWriter(mesh),
  Messy: new Messy(mesh),
  AnalogyEngine: new AnalogyEngine(mesh),
  IChingGrammar: new IChingGrammar(mesh),
  LanguageContact: new LanguageContact(mesh),
  HistoricalMonteCarlo: new HistoricalMonteCarlo(mesh),
};
const head = new Head(mesh);
for (const [name, tool] of Object.entries(tools)) head.register(name, tool);

// --- HTTP: serve the single-page front-end ---
const server = http.createServer(async (req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    const html = await readFile(path.join(__dirname, 'index.html'), 'utf-8');
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end(html);
    return;
  }
  res.writeHead(404);
  res.end('not found');
});

// --- WebSocket: broadcast every mesh event live ---
const wss = new WebSocketServer({ server });
const clients = new Set();
wss.on('connection', (ws) => {
  clients.add(ws);
  ws.send(JSON.stringify({ type: 'topology', topology: mesh.topology() }));
  ws.on('close', () => clients.delete(ws));
});

function broadcast(msg) {
  const data = JSON.stringify(msg);
  for (const ws of clients) {
    if (ws.readyState === ws.OPEN) ws.send(data);
  }
}

mesh.onEmergence(({ channel, firstSource }) => {
  broadcast({ type: 'emergence', channel, source: firstSource, at: Date.now() });
});
mesh.subscribeAll((message) => {
  broadcast({ type: 'message', channel: message.channel, source: message.sourceTool, at: message.at });
});

server.listen(PORT, () => {
  console.log(`[meshServer] morphing network live at http://localhost:${PORT}`);
  console.log(`[meshServer] ${Object.keys(tools).length} tools + Head registered`);
});

// Fire each tool once on a staggered interval so you can WATCH channels
// emerge one at a time in the browser instead of all at once.
const demoInputs = [
  () => head.dispatch({ mode: 'generate', relation: 'HAS_PROPERTY', args: ['gate17', 'mutative'] }),
  () => head.dispatch({ corpus: ['gate17 is mutative', 'gate25 is mutative'], term: 'mutative' }),
  () => head.dispatch({ seed: Date.now() % 1000 }),
  () => head.dispatch({ agents: [{ id: 'a1', features: { tension: 0.7 } }], rules: [{ when: (a) => a.features.tension > 0.2, apply: (a) => ({ ...a, features: { tension: a.features.tension * 0.7 } }) }], ticks: 3 }),
  () => head.dispatch({ vocab: ['mutative', 'fixed', 'design'], A: ['mutative'], B: ['fixed'], C: ['design'] }),
  () => head.dispatch({ lines: [1, 1, 0, 0, 1, 0] }),
  () => head.dispatch({ grammarA: { order: 'SVO' }, grammarB: { order: 'SOV' }, generations: 5 }),
  () => head.dispatch({ variants: { x: 1, y: 1 }, generations: 5 }),
];
let i = 0;
const interval = setInterval(() => {
  if (i >= demoInputs.length) { clearInterval(interval); return; }
  demoInputs[i]();
  i++;
}, 1500);

// mcpHub.js
// A single MCP hub exposing all 8 Klein tools as MCP "tools" over stdio.
// Implements the minimal MCP JSON-RPC surface (initialize, tools/list,
// tools/call) by hand — no @modelcontextprotocol/sdk dependency, so this
// runs with zero npm install. Any MCP-compatible client (Claude Desktop,
// Claude Code, etc.) can attach to this as a stdio server, but nothing in
// the hub itself calls an LLM.

import { createInterface } from 'node:readline';
import { EventMesh } from '../mesh/EventMesh.js';
import { AutoLing } from '../tools/autoling.js';
import { Diseminer } from '../tools/diseminer.js';
import { NovelWriter } from '../tools/novelWriter.js';
import { Messy } from '../tools/messy.js';
import { AnalogyEngine } from '../tools/analogyEngine.js';
import { IChingGrammar } from '../tools/iChingGrammar.js';
import { LanguageContact } from '../tools/languageContact.js';
import { HistoricalMonteCarlo } from '../tools/historicalMonteCarlo.js';

const mesh = new EventMesh();
const tools = [
  new AutoLing(mesh),
  new Diseminer(mesh),
  new NovelWriter(mesh),
  new Messy(mesh),
  new AnalogyEngine(mesh),
  new IChingGrammar(mesh),
  new LanguageContact(mesh),
  new HistoricalMonteCarlo(mesh),
];
const toolByName = new Map(tools.map((t) => [t.name, t]));

function toolDescriptor(t) {
  return {
    name: t.name,
    description: `Klein-system tool: ${t.name}. Publishes results to mesh channel "${t.channel}".`,
    inputSchema: { type: 'object', description: 'Tool-specific input — see source comments.', additionalProperties: true },
  };
}

function send(msg) {
  process.stdout.write(JSON.stringify(msg) + '\n');
}

function handle(req) {
  const { id, method, params } = req;
  try {
    if (method === 'initialize') {
      send({ jsonrpc: '2.0', id, result: { protocolVersion: '2024-11-05', serverInfo: { name: 'synthia-klein-mesh', version: '0.1.0' }, capabilities: { tools: {} } } });
      return;
    }
    if (method === 'tools/list') {
      send({ jsonrpc: '2.0', id, result: { tools: tools.map(toolDescriptor) } });
      return;
    }
    if (method === 'tools/call') {
      const tool = toolByName.get(params.name);
      if (!tool) {
        send({ jsonrpc: '2.0', id, error: { code: -32601, message: `unknown tool ${params.name}` } });
        return;
      }
      const result = tool.runAndPublish(params.arguments || {});
      send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify(result) }] } });
      return;
    }
    send({ jsonrpc: '2.0', id, error: { code: -32601, message: `unknown method ${method}` } });
  } catch (err) {
    send({ jsonrpc: '2.0', id, error: { code: -32000, message: err.message } });
  }
}

const rl = createInterface({ input: process.stdin });
rl.on('line', (line) => {
  if (!line.trim()) return;
  let req;
  try { req = JSON.parse(line); } catch { return; }
  handle(req);
});

process.stderr.write('[mcpHub] synthia-klein-mesh MCP hub ready on stdio — 8 tools registered\n');

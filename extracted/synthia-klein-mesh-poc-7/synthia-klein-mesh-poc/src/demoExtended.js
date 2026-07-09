// demoExtended.js — run with: node src/demoExtended.js
import { EventMesh } from './mesh/EventMesh.js';
import { GitHubRAG } from './tools/githubRAG.js';
import { Messy } from './tools/messy.js';
import { NovelWriter } from './tools/novelWriter.js';
import { AIHub } from './tools/aiHub.js';
import { submitCode, submitPaper, listSubmissions } from './sandbox/sandboxRunner.js';

const mesh = new EventMesh();
mesh.onEmergence(({ channel, firstSource }) => console.log(`[mesh] EMERGENT CHANNEL "${channel}" by ${firstSource}`));

console.log('\n--- AIHub (9th center) status — no calls made, just checking config ---');
const aiHub = new AIHub(mesh);
console.log(aiHub.status());

console.log('\n--- GitHubRAG: real retrieval (network call) ---');
const rag = new GitHubRAG(mesh);
const ragResult = await rag.runAndPublish({ query: 'human design gate hexagram', language: 'javascript', maxResults: 3 });
console.log(ragResult);

console.log('\n--- Messy.codegen(): real runnable HTML/canvas world ---');
const messy = new Messy(mesh);
const html = messy.codegen({
  title: 'Test World',
  agents: [{ id: 'a1', features: { x: 100, y: 100, color: '#f5c518' } }],
  ruleDescriptions: ['agents drift and bounce off canvas edges'],
});
console.log(html.slice(0, 300) + '\n... (truncated, ' + html.length + ' chars total)');

console.log('\n--- NovelWriter.codegen(): standalone deterministic story module ---');
const novelWriter = new NovelWriter(mesh);
const novelCode = novelWriter.codegen({ seed: 42 });
console.log(novelCode.slice(0, 200) + '\n... (truncated)');

console.log('\n--- Sandbox: submit + execute generated code ---');
const codeRun = await submitCode({ title: 'messy-world-html-gen-check', code: 'console.log("sandbox alive:", 2 + 2);', sourceTool: 'demoExtended' });
console.log(codeRun);

console.log('\n--- Sandbox: submit a paper (logged, not executed) ---');
const paperRun = await submitPaper({ title: 'Test Paper', content: 'Abstract: testing the submission pipeline.', sourceTool: 'demoExtended' });
console.log(paperRun);

console.log('\n--- Sandbox: list all submissions ---');
console.log(await listSubmissions());

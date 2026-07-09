// index.js
// Proof-of-concept demo: instantiate all 8 tools on one EventMesh, run each
// once with a representative input, watch channels emerge, print topology.
// Run with: npm run demo

import { EventMesh } from './mesh/EventMesh.js';
import { attachSupabaseSync } from './mesh/SupabaseSync.js';
import { AutoLing } from './tools/autoling.js';
import { Diseminer } from './tools/diseminer.js';
import { NovelWriter } from './tools/novelWriter.js';
import { Messy } from './tools/messy.js';
import { AnalogyEngine } from './tools/analogyEngine.js';
import { IChingGrammar } from './tools/iChingGrammar.js';
import { LanguageContact } from './tools/languageContact.js';
import { HistoricalMonteCarlo } from './tools/historicalMonteCarlo.js';

const mesh = new EventMesh();
mesh.onEmergence(({ channel, firstSource }) => {
  console.log(`[mesh] EMERGENT CHANNEL "${channel}" created by ${firstSource}`);
});

await attachSupabaseSync(mesh); // no-op unless SUPABASE_URL/KEY are set

const autoling = new AutoLing(mesh);
const diseminer = new Diseminer(mesh);
const novelWriter = new NovelWriter(mesh);
const messy = new Messy(mesh);
const analogy = new AnalogyEngine(mesh);
const iching = new IChingGrammar(mesh);
const contact = new LanguageContact(mesh);
const monteCarlo = new HistoricalMonteCarlo(mesh);

console.log('\n--- 1. AutoLing (generate + recognize, same rule table) ---');
console.log(autoling.runAndPublish({ mode: 'generate', relation: 'HAS_PROPERTY', args: ['gate17', 'mutative'] }));
console.log(autoling.runAndPublish({ mode: 'recognize', text: 'gate17 is mutative' }));

console.log('\n--- 2. Diseminer (distributional semantics) ---');
console.log(diseminer.runAndPublish({
  corpus: ['gate17 is mutative', 'gate25 is mutative', 'gate46 is design', 'gate6 is conflict'],
  term: 'mutative',
}));

console.log('\n--- 3. NovelWriter (Propp-function narrative) ---');
console.log(novelWriter.runAndPublish({ seed: 42 }));

console.log('\n--- 4. Messy (state-transition simulation) ---');
console.log(messy.runAndPublish({
  agents: [{ id: 'A1', features: { tension: 0.8 } }],
  rules: [{
    when: (a) => a.features.tension > 0.3,
    apply: (a) => ({ ...a, features: { tension: a.features.tension * 0.6 } }),
  }],
  ticks: 4,
}));

console.log('\n--- 5. AnalogyEngine (Boolean feature-vector analogy) ---');
console.log(analogy.runAndPublish({
  vocab: ['mutative', 'fixed', 'design', 'personality'],
  A: ['mutative', 'design'],
  B: ['fixed', 'design'],
  C: ['mutative', 'personality'],
}));

console.log('\n--- 6. IChingGrammar (hexagram -> feature vector) ---');
console.log(iching.runAndPublish({ lines: [1, 0, 1, 1, 1, 0] }));

console.log('\n--- 7. LanguageContact (stochastic grammar blending) ---');
console.log(contact.runAndPublish({
  grammarA: { wordOrder: 'SVO', caseMarking: 'none' },
  grammarB: { wordOrder: 'SOV', caseMarking: 'rich' },
  contactRate: 0.3,
  generations: 8,
  seed: 3,
}));

console.log('\n--- 8. HistoricalMonteCarlo (drift simulation) ---');
console.log(monteCarlo.runAndPublish({
  variants: { variantA: 1, variantB: 1, variantC: 1 },
  generations: 15,
  seed: 11,
}));

console.log('\n--- MESH TOPOLOGY (emergent, not pre-declared) ---');
console.table(mesh.topology());

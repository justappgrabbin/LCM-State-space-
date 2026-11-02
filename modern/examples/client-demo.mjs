/**
 * From the repository root: node modern/examples/client-demo.mjs
 * Creates a real AST-safe Python file, emits event on EXISTING LCM EventMesh.
 * All gate/trigram coordinates here are TEST FIXTURES, not a canonical mapping.
 */
import { resolve } from 'node:path';
import { CapabilityRegistry, ClientComputer } from '../client-computer.mjs';
import { loadLocalKleinFaces } from '../python-faces.mjs';
import { EventMesh } from '../../extracted/synthia-klein-mesh-poc-7/synthia-klein-mesh-poc/src/mesh/EventMesh.js';

const mesh = new EventMesh();
mesh.subscribe('client.capability.executed', event =>
  console.log('Mesh observed:', event.payload.capability, event.payload.outputHash.slice(0,12)));

const registry = new CapabilityRegistry();
await loadLocalKleinFaces(registry, {workspaceRoot:resolve('modern/examples/client-output')});

const client = new ClientComputer({
  id: 'demo-client', registry, permissions:['artifact.write'], mesh
});
const bound = {
  tools: [
    {id:'autoling',gate:6,trigram:[0,1,1]},
    {id:'diseminer',gate:59,trigram:[1,0,1]}
  ],
  context:{
    address:'demo/gate:6/line:4', active:['autoling','diseminer'],
    dimension_weights:{Movement:0.6,Evolution:0.6,Being:0.6,Design:0.6,Space:0.6},
    phase:0.2, coherence:1
  }
};
const inputs = {
  'klein.context':bound,
  'request.code':{action:'create',operation:{
    name:'signal_mix',args:['movement','being'],expression:'(movement+being)/2'
  }}
};
console.log('Discovered capabilities:', registry.list().map(x=>x.id));
console.log('Plan:', client.plan('artifact.code', inputs));
const run = await client.execute('artifact.code', inputs, {
  address:bound.context.address,toolIds:bound.context.active
});
console.log('Result:', run.output);
console.log('Trace receipts:', run.receipts.length);

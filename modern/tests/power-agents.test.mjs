import assert from 'node:assert/strict';
import test from 'node:test';
import {PowerAgent,hammingAtLevel,independentContacts} from '../power-agents.mjs';
import {CapabilityRegistry,ClientComputer} from '../client-computer.mjs';
import {Messy} from '../../extracted/synthia-klein-mesh-poc-7/synthia-klein-mesh-poc/src/tools/messy.js';

const spawn=()=>new PowerAgent({id:'test-person'});
const assign=(a,dimension,gate,extra={})=>a.assign({dimension,gate,level:4,purpose:'analyze addressed '+dimension+' gate '+gate,...extra});

test('five dimensional banks have 64 optional slots each; tools come from real factory',()=>{
  const agent=spawn();
  assert.equal(agent.slots('Movement').length,64);
  assert.equal(agent.slots('Design').length,64);
  const slot=assign(agent,'Movement',1);
  assert.equal(slot.origin,'existing-factory');
  assert.equal(slot.tool,agent.factory.tools.get(slot.tool.id));
  assert.equal(agent.lookup('Movement',1),slot);
  assert.throws(()=>assign(agent,'Movement',1),/Occupied/);
  assert.equal(agent.fillPlace('Evolution').length,64);
  assert.equal(agent.fillPlace('Evolution').length,0);
  assert.equal(agent.slots('Evolution').filter(x=>x.occupied).length,64);
});

test('Hamming-1 uses canonical hexagram bits, not gate-number or fixed HD channel lists',()=>{
  const agent=spawn();
  const a=assign(agent,'Movement',1),b=assign(agent,'Design',43);
  const opposite=assign(agent,'Being',2);
  assert.equal(hammingAtLevel(a,b,'gate'),1);
  assert.equal(hammingAtLevel(a,opposite,'gate'),6);
  assert.ok(independentContacts(a,b).some(x=>x.level==='gate'));
  assert.equal(agent.connect({from:{dimension:'Movement',gate:1},to:{dimension:'Design',gate:43},level:'gate'}).operator,'independent-hamming-1');
  assert.throws(()=>agent.connect({from:{dimension:'Movement',gate:1},to:{dimension:'Being',gate:2},level:'gate'}),/Hamming distance 1/);
  assert.throws(()=>agent.connect({from:{dimension:'Movement',gate:1},to:{dimension:'Movement',gate:1}}),/Self-feedback/);
});

test('DMS address levels compare independently, and missing fine arcs do not fabricate proximity',()=>{
  const agent=spawn();
  const a=assign(agent,'Movement',1,{coordinates:{degree:12,minute:6,second:5}});
  const b=assign(agent,'Design',1,{coordinates:{degree:13,minute:6,second:5}});
  assert.equal(hammingAtLevel(a,b,'gate'),0);
  assert.equal(hammingAtLevel(a,b,'degree'),1);
  assert.equal(hammingAtLevel(a,b,'minute'),0);
  assert.equal(hammingAtLevel(a,b,'arc'),null);
  const edge=agent.connect({from:{dimension:'Movement',gate:1},to:{dimension:'Design',gate:1},level:'degree'});
  assert.deepEqual(edge.contacts,[{level:'degree',distance:1}]);
});

test('existing factory tools execute in linked contact and bounded local feedback',async()=>{
  const agent=spawn();
  const a=assign(agent,'Movement',1),b=assign(agent,'Design',43);
  const link=agent.connect({from:{dimension:'Movement',gate:1},to:{dimension:'Design',gate:43}});
  const r=await agent.runLink(link.id,'alpha alpha beta');
  assert.equal(r.agent,'test-person');
  assert.equal(r.output.occurrences,1);
  assert.equal(agent.mesh.topology().length,1);
  const f=await agent.feedback({at:{dimension:'Movement',gate:1},input:'first',iterations:2});
  assert.equal(f.steps.length,2);
  assert.throws(()=>agent.feedback({at:{dimension:'Movement',gate:1},iterations:9}),/iterations/);
  assert.equal(agent.receipts.length,2);
});

test('MESSY is reused from existing extracted Klein code, including world canvas codegen',()=>{
  const agent=spawn();
  const tool=new Messy(agent.mesh);
  const slot=agent.attachExisting({dimension:'Being',gate:6,tool});
  assert.equal(slot.tool,tool);
  const result=agent.messyWorld({agents:[{id:'seed',features:{x:2,y:3}}],
    rules:[{when:()=>true,apply:a=>({...a,features:{...a.features,x:a.features.x+1}})}],ticks:2});
  assert.equal(result.simulation.finalState[0].features.x,4);
  assert.match(result.html,/canvas/);
  assert.match(result.implementation,/existing\/Messy/);
});

test('original ClientComputer can plan and execute a permissioned Power link',async()=>{
  const agent=spawn();
  const a=assign(agent,'Movement',1),b=assign(agent,'Design',43);
  const edge=agent.connect({from:{dimension:'Movement',gate:1},to:{dimension:'Design',gate:43}});
  const registry=new CapabilityRegistry();
  const goal=agent.registerLink(registry,edge.id);
  const allowed=new ClientComputer({id:'person',registry,permissions:['power.execute']});
  const forbidden=new ClientComputer({id:'person',registry,permissions:[]});
  assert.equal(forbidden.plan(goal,{'power.input':'abc'}).status,'unresolved');
  assert.equal(allowed.plan(goal,{'power.input':'abc'}).status,'planned');
  const r=await allowed.execute(goal,{'power.input':'abc'},{address:'gate:1→43',toolIds:[a.tool.id,b.tool.id]});
  assert.equal(r.output.occurrences,1);
  assert.equal(r.receipts.length,1);
});

test('reproduction remains disabled until real world-completion criteria and implementation exist',()=>{
  const agent=spawn();
  assert.deepEqual(agent.reproductionStatus(),{
    enabled:false,reason:'WORLD_NOT_COMPLETE',
    requirement:'complete and independently verified world before design/authorization'
  });
});

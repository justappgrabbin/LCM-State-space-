import assert from 'node:assert/strict';
import test from 'node:test';
import { CapabilityRegistry, ClientComputer } from '../client-computer.mjs';

const base = (extra = {}) => ({ version: '1.0.0', dimension: 'Design', permission: 'compose', cost: 1, ...extra });
const inputCtx = { address: 'gate:6/line:4', toolIds: ['autoling','diseminer'] };

test('discovers transitive capabilities and assembles an unhardcoded output', async () => {
  const registry = new CapabilityRegistry();
  registry.register(base({id:'recognize',requires:['source.text'],provides:'structure.syntax'}),async ({'source.text':text})=>({tokens:text.split(' ')}));
  registry.register(base({id:'project',requires:['structure.syntax'],provides:'artifact.scene',dimension:'Space'}),async x=>({shapes:x['structure.syntax'].tokens.length}));
  const client = new ClientComputer({id:'user-a',registry,permissions:['compose']});
  const p=client.plan('artifact.scene',{'source.text':'cat sees dog'});
  assert.deepEqual(p.steps.map(x=>x.id),['recognize','project']);
  const r=await client.execute('artifact.scene',{'source.text':'cat sees dog'},inputCtx);
  assert.equal(r.output.shapes,3);
  assert.equal(r.receipts.length,2);
  assert.equal(r.receipts[1].dimension,'Space');
  assert.equal(r.receipts[1].parents.length,1);
});

test('chooses least cost path, not fixed media routing', () => {
  const r=new CapabilityRegistry();
  r.register(base({id:'expensive',requires:['seed'],provides:'artifact',cost:10}),async()=>1);
  r.register(base({id:'step1',requires:['seed'],provides:'intermediate',cost:2}),async()=>1);
  r.register(base({id:'step2',requires:['intermediate'],provides:'artifact',cost:2}),async()=>1);
  const client=new ClientComputer({id:'a',registry:r,permissions:['compose']});
  assert.deepEqual(client.plan('artifact',{seed:'input'}).steps.map(x=>x.id),['step1','step2']);
});

test('permissions and cycles fail closed; proposals do not execute', async()=>{
  const r=new CapabilityRegistry();
  r.register(base({id:'a',requires:['type.b'],provides:'type.a'}),async()=>1);
  r.register(base({id:'b',requires:['type.a'],provides:'type.b'}),async()=>1);
  const no=new ClientComputer({id:'no',registry:r,permissions:[]});
  assert.equal(no.plan('type.a').status,'unresolved');
  const yes=new ClientComputer({id:'yes',registry:r,permissions:['compose']});
  assert.equal(yes.plan('type.a').status,'unresolved');
  const proposal=yes.proposal(base({id:'untrusted',requires:[],provides:'artifact'}));
  assert.equal(proposal.status,'pending-review');
  assert.equal(yes.plan('artifact').status,'unresolved');
});

test('events publish ONLY after actual capability execution', async ()=>{
  const emitted=[];
  const mesh={publish(...args){emitted.push(args);}};
  const r=new CapabilityRegistry();
  r.register(base({id:'a',requires:['seed'],provides:'artifact'}),async ({seed})=>seed+1);
  const client=new ClientComputer({id:'x',registry:r,permissions:['compose'],mesh});
  await client.execute('artifact',{seed:3},{...inputCtx,dryRun:true});
  assert.equal(emitted.length,0);
  const result=await client.execute('artifact',{seed:3},inputCtx);
  assert.equal(result.output,4);
  assert.equal(emitted.length,1);
  assert.equal(emitted[0][0],'client.capability.executed');
  assert.equal(emitted[0][2].address,inputCtx.address);
});

test('client-to-client permissions differ while shared substrate stays stable',async()=>{
  const r=new CapabilityRegistry();
  r.register(base({id:'media',permission:'media.write',requires:['seed'],provides:'artifact.image'}),async()=>({pixels:2}));
  const a=new ClientComputer({id:'a',registry:r,permissions:['media.write']});
  const b=new ClientComputer({id:'b',registry:r,permissions:[]});
  assert.equal(a.plan('artifact.image',{seed:'x'}).status,'planned');
  assert.equal(b.plan('artifact.image',{seed:'x'}).status,'unresolved');
});

test('input guard rejects single tool/no context',async()=>{
  const r=new CapabilityRegistry();
  r.register(base({id:'x',requires:[],provides:'out'}),async()=>42);
  const client=new ClientComputer({id:'x',registry:r,permissions:['compose']});
  await assert.rejects(client.execute('out',{}, {address:'a',toolIds:['a']}),/co-active/);
});

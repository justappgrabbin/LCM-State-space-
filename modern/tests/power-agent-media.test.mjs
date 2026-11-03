import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PowerAgent } from '../power-agents.mjs';
import { CapabilityRegistry, ClientComputer } from '../client-computer.mjs';

test('local Power Agent really uses existing image face to draw then edit 45° without changing original',async()=>{
  const agent=new PowerAgent({id:'image-person'});
  const a=agent.assign({dimension:'Movement',gate:1,level:4,purpose:'analyze shapes'});
  const b=agent.assign({dimension:'Design',gate:43,level:4,purpose:'analyze colors'});
  const link=agent.connect({from:{dimension:'Movement',gate:1},to:{dimension:'Design',gate:43}});
  const weights={Movement:.5,Evolution:.5,Being:.5,Design:.5,Space:.5}; // TEST FIXTURES; not a chart
  const context=agent.mediaContext(link.id,weights);
  assert.equal(context['klein.context'].tools.length,2);
  assert.deepEqual(context.toolIds,[a.tool.id,b.tool.id]);
  const registry=new CapabilityRegistry();
  const work=await mkdtemp(join(tmpdir(),'power-media-'));
  try{
    assert.deepEqual(await agent.enableExistingMedia(registry,{workspaceRoot:work}),
      ['klein.face.code.create','klein.face.image.create','klein.face.video.create']);
    const client=new ClientComputer({id:'image-person',registry,permissions:['artifact.write']});
    const first=await client.execute('artifact.image',{
      'klein.context':context['klein.context'],
      'request.image':{action:'create',operation:{size:[100,60],
        shapes:[{kind:'rectangle',coords:[6,6,50,30]}]}}
    },{address:context.address,toolIds:context.toolIds});
    const source=first.output.file,original=await readFile(source);
    assert.ok((await stat(source)).size>100);
    const second=await client.execute('artifact.image',{
      'klein.context':context['klein.context'],
      'request.image':{action:'edit',source,operation:{ops:[{action:'rotate',degrees:45}]}}
    },{address:context.address,toolIds:context.toolIds});
    assert.notEqual(second.output.file,source);
    assert.deepEqual(await readFile(source),original);
    assert.ok((await stat(second.output.file)).size>100);
    assert.equal(second.output.modality,'image');
    assert.ok(second.output.receiptFile.endsWith('.klein.json'));
  }finally{
    await rm(work,{recursive:true,force:true});
  }
});

test('media bindings require explicit values and actual contact',()=>{
  const agent=new PowerAgent({id:'local'});
  const a=agent.assign({dimension:'Movement',gate:1,level:4,purpose:'analyze'});
  const b=agent.assign({dimension:'Design',gate:43,level:4,purpose:'analyze'});
  const link=agent.connect({from:{dimension:'Movement',gate:1},to:{dimension:'Design',gate:43}});
  assert.throws(()=>agent.mediaContext(link.id,{Movement:1}),/five|weight/i);
});

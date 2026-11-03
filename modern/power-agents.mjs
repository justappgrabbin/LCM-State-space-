/**
 * Power Agents: thin local adapter over EXISTING Cynthia Tool Factory v1.6,
 * Klein EventMesh / MESSY, and ClientComputer. No remote runtime dependencies.
 *
 * A "place" is an addressable dimensional slot bank: up to 64 tools for each
 * existing dimension. Space is an available slot/view, not an invented fifth
 * autonomous thinker. No gate-pair/channel lookup decides connections:
 * Hamming distance 1 is checked at each address level independently.
 *
 * Source originals are preserved in extracted/ and vendored unchanged from
 * Fantastic4; this file is strictly the missing orchestration boundary.
 */
import { IntegratedToolFactory, stableId } from './vendor/tool-factory/src/integrated-tool-factory.mjs';
import { gateToLines } from './vendor/king-wen.mjs';
import { EventMesh } from '../extracted/synthia-klein-mesh-poc-7/synthia-klein-mesh-poc/src/mesh/EventMesh.js';
import { Messy } from '../extracted/synthia-klein-mesh-poc-7/synthia-klein-mesh-poc/src/tools/messy.js';
import { loadLocalKleinFaces } from './python-faces.mjs';

export const PLACES = Object.freeze(['Movement','Evolution','Being','Design','Space']);
const FIELDS = Object.freeze({
  line: [1,6], color: [1,6], tone: [1,6], base: [1,5],
  degree: [0,29], minute: [0,59], second: [0,59], arc: [0,99]
});

function assertPlace(dimension) {
  if (!PLACES.includes(dimension)) throw new RangeError('Unknown existing dimensional place: '+dimension);
}
function assertGate(gate) {
  if (!Number.isInteger(gate) || gate<1 || gate>64) throw new RangeError('Gate must be integer 1..64');
}
function assertIntegerAtLevel(value, level) {
  const [lo, hi]=FIELDS[level];
  if (!Number.isInteger(value) || value<lo || value>hi)
    throw new RangeError(level+' must be integer '+lo+'..'+hi);
}
function bitDistance(a,b) {
  if (a.length!==b.length) throw new RangeError('Address bit widths must match');
  return a.reduce((n,x,i)=>n+(x===b[i]?0:1),0);
}
function levelBits(level, slot) {
  if (level==='gate') return gateToLines(slot.gate);
  if (!(level in FIELDS)) throw new RangeError('Unknown independent comparison level: '+level);
  const [low,hi]=FIELDS[level];
  const value=slot.coordinates[level] ?? slot.tool.plan?.[level];
  if (value===undefined || value===null) return null;
  assertIntegerAtLevel(value,level);
  const width=Math.ceil(Math.log2(hi-low+1));
  return (value-low).toString(2).padStart(width,'0').split('').map(Number);
}

/** This is the rule, not a channel lookup: one bit differs inside ONE layer. */
export function hammingAtLevel(a,b,level='gate') {
  const x=levelBits(level,a),y=levelBits(level,b);
  if (x===null || y===null) return null; // unknown is NOT equal or adjacent
  return bitDistance(x,y);
}
export function independentContacts(a,b) {
  return Object.freeze(['gate',...Object.keys(FIELDS)]
    .map(level=>({level,distance:hammingAtLevel(a,b,level)}))
    .filter(x=>x.distance===1));
}

export class PowerAgent {
  constructor({id,factory=new IntegratedToolFactory(),mesh=new EventMesh()}={}) {
    if (typeof id!=='string' || !id.trim()) throw new TypeError('Agent id required');
    this.id=id;
    this.factory=factory;
    this.mesh=mesh;
    this.places=new Map(PLACES.map(p=>[p,new Map()]));
    this.links=new Map();
    this.receipts=[];
    // World completion criteria have NOT been specified or validated.
    this.worldStatus={complete:false,verified:false,report:null};
  }
  slots(dimension) {
    assertPlace(dimension);
    return Object.freeze(Array.from({length:64},(_,i)=>({
      dimension,gate:i+1,occupied:this.places.get(dimension).has(i+1),
      toolId:this.places.get(dimension).get(i+1)?.tool.id ?? this.places.get(dimension).get(i+1)?.tool.name ?? null
    })));
  }
  lookup(dimension,gate) {
    assertPlace(dimension);assertGate(gate);
    return this.places.get(dimension).get(gate)??null;
  }
  /** Uses the original factory's generate() and keeps its exact tool instance. */
  assign({dimension,gate,purpose,level,coordinates={}}) {
    assertPlace(dimension);assertGate(gate);
    if (this.lookup(dimension,gate)) throw new Error('Occupied: '+dimension+' gate '+gate);
    const request={dimension,gate,purpose:purpose||('addressed '+dimension+' tool gate '+gate)};
    if (level!==undefined) request.level=level;
    const result=this.factory.generate(request);
    if (!result.tool) throw new Error('Factory unresolved: '+result.status);
    if (result.tool.plan.gate!==gate || result.tool.plan.dimension!==dimension)
      throw new Error('Factory returned mismatched address');
    return this.attachExisting({dimension,gate,tool:result.tool,coordinates,origin:'existing-factory'});
  }
  /** Register an original Klein tool (including MESSY) without cloning it. */
  attachExisting({dimension,gate,tool,coordinates={},origin='existing'}) {
    assertPlace(dimension);assertGate(gate);
    if (this.lookup(dimension,gate)) throw new Error('Occupied: '+dimension+' gate '+gate);
    const id=tool?.id||tool?.name;
    if (!id || (typeof tool.execute!=='function' && typeof tool.run!=='function'))
      throw new TypeError('Original tool requires identity and executable run/execute');
    const normalized={};
    for(const [k,v] of Object.entries(coordinates)){
      if (!(k in FIELDS)) throw new RangeError('Unknown coordinate level: '+k);
      assertIntegerAtLevel(v,k);
      normalized[k]=v;
    }
    const slot=Object.freeze({dimension,gate,tool,origin,coordinates:Object.freeze(normalized)});
    this.places.get(dimension).set(gate,slot);
    return slot;
  }
  /** Fill missing gates, not replacements; user can still assign selectively. */
  fillPlace(dimension,blueprint=(gate)=>({purpose:'addressed '+dimension+' tool gate '+gate})) {
    assertPlace(dimension);
    const made=[];
    for (let gate=1;gate<=64;gate++) if(!this.lookup(dimension,gate)){
      const options=blueprint(gate);
      if (!options || typeof options!=='object') throw new TypeError('Tool blueprint must be an object');
      made.push(this.assign({...options,dimension,gate}));
    }
    return made;
  }
  resolve({dimension,gate}) {
    const slot=this.lookup(dimension,gate);
    if(!slot)throw new Error('No assigned tool at '+dimension+' gate '+gate);
    return slot;
  }
  /**
   * Real contact is Hamming-1 at the selected level, or ANY independently
   * checked level when unspecified. A self-reference has Hamming 0: use the
   * bounded feedback() operation instead of pretending it is an edge.
   */
  connect({from,to,level}){
    const a=this.resolve(from),b=this.resolve(to);
    if(a===b)throw new Error('Self-feedback is separate from Hamming contact');
    const contacts=level
      ? [{level,distance:hammingAtLevel(a,b,level)}].filter(x=>x.distance===1)
      : independentContacts(a,b);
    if(!contacts.length)throw new Error('Hamming distance 1 not met at requested structural level');
    const id='link-'+stableId({from:[a.dimension,a.gate],to:[b.dimension,b.gate],level:level||'any'});
    const existing=this.links.get(id);
    if(existing)return existing;
    const edge=Object.freeze({id,from:{dimension:a.dimension,gate:a.gate,toolId:a.tool.id||a.tool.name},
      to:{dimension:b.dimension,gate:b.gate,toolId:b.tool.id||b.tool.name},
      contacts:Object.freeze(contacts),operator:'independent-hamming-1'});
    this.links.set(id,edge);
    return edge;
  }
  /** Sequential execution of EXISTING tools, not a new synthetic tool model. */
  async runLink(linkId,input){
    const edge=this.links.get(linkId);
    if(!edge)throw new Error('Unregistered link: '+linkId);
    const a=this.resolve(edge.from),b=this.resolve(edge.to);
    const call=async (slot,signal)=>slot.tool.execute
      ?slot.tool.execute(signal,{powerAgent:this.id})
      :slot.tool.run(signal);
    const first=await call(a,input),second=await call(b,first);
    const receipt={agent:this.id,linkId,source:edge.from,recipient:edge.to,
      contacts:edge.contacts,sourceOutput:first,output:second};
    this.receipts.push(receipt);
    this.mesh.publish('power.link.executed',this.id,receipt);
    return receipt;
  }
  /**
   * Bounded *self* loop is a recurrence, not Hamming-1, and doesn't require
   * inventing a second mind or agent. Max 8 iterations prevents runaway loops.
   */
  async feedback({at,input,iterations=1}){
    if(!Number.isInteger(iterations)||iterations<1||iterations>8)
      throw new RangeError('Feedback iterations must be 1..8');
    const slot=this.resolve(at);
    let value=input;const steps=[];
    for(let i=0;i<iterations;i++){
      value=slot.tool.execute
        ?await slot.tool.execute(value,{powerAgent:this.id,feedbackStep:i})
        :await slot.tool.run(value);
      steps.push({step:i+1,output:value});
    }
    const receipt={agent:this.id,kind:'self-feedback',at,steps};
    this.receipts.push(receipt);
    this.mesh.publish('power.feedback.executed',this.id,receipt);
    return receipt;
  }
  /**
   * Reuses LCM's ORIGINAL MESSY simulation and canvas generator.
   * The HTML generator has a default motion loop: it does not compile arbitrary
   * JS simulation rule functions into browser code.
   */
  messyWorld({agents=[],rules=[],ticks=1,title='Messy World',ruleDescriptions=[]}={}){
    const messy=new Messy(this.mesh);
    const simulation=messy.run({agents,rules,ticks});
    // MESSY.codegen embeds JSON into an HTML <script>; sanitize this export
    // at the adapter boundary without changing original simulation rules.
    const safeAgents=simulation.finalState.map((a,i)=>({
      id:String(a.id??i).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,60),
      features:Object.fromEntries(Object.entries(a.features||{}).filter(([k,v])=>
        ['x','y','vx','vy','radius'].includes(k)&&typeof v==='number'&&Number.isFinite(v) ||
        k==='color'&&typeof v==='string'&&/^#[0-9a-fA-F]{6}$/.test(v)))
    }));
    const safeTitle=String(title).replace(/[<>&"']/g,'').slice(0,90);
    const safeRules=ruleDescriptions.map(x=>String(x).replace(/[\r\n<>&]/g,' ').slice(0,160));
    const html=messy.codegen({title:safeTitle,agents:safeAgents,ruleDescriptions:safeRules});
    return {simulation,html,implementation:'existing/Messy.run+Messy.codegen'};
  }
  /**
   * Connect addressed, co-active Power tools to the EXISTING Python Klein
   * code/image/video faces. The user supplies dimensional weights explicitly;
   * we will not invent a personal chart or collapse all levels into one.
   */
  mediaContext(linkId,dimensionWeights,{phase=0,coherence=1}={}){
    const edge=this.links.get(linkId);
    if(!edge)throw new Error('No such Hamming-validated link: '+linkId);
    if(!dimensionWeights || PLACES.some(d=>!Number.isFinite(dimensionWeights[d]) ||
        dimensionWeights[d]<0 || dimensionWeights[d]>1) ||
        Object.keys(dimensionWeights).length!==PLACES.length)
      throw new RangeError('Provide one finite 0..1 weight for each existing dimensional place');
    for(const [k,v] of Object.entries({phase,coherence}))
      if(!Number.isFinite(v)||v<0||v>1)throw new RangeError(k+' must be 0..1');
    const participants=[this.resolve(edge.from),this.resolve(edge.to)];
    const ids=participants.map(p=>p.tool.id||p.tool.name);
    if(ids[0]===ids[1])throw new Error('Distinct coactive tool IDs required');
    const address='power:'+this.id+':'+linkId;
    return Object.freeze({
      'klein.context':{
        tools:participants.map(p=>({id:p.tool.id||p.tool.name,
          gate:p.gate,trigram:gateToLines(p.gate).slice(0,3)})),
        context:{address,active:ids,dimension_weights:{...dimensionWeights},phase,coherence}
      },
      address,toolIds:ids
    });
  }
  /** Register the already-authored image/video/code adapters: no new engine. */
  async enableExistingMedia(registry,{workspaceRoot,python='python3'}={}){
    return loadLocalKleinFaces(registry,{workspaceRoot,python});
  }

  /** Expose an existing pair to ClientComputer's typed planner. */
  registerLink(registry,linkId){
    const edge=this.links.get(linkId);if(!edge)throw new Error('No such link');
    const resultType='power.link.'+edge.id;
    registry.register({id:'power.'+stableId([this.id,linkId]),version:'0.1.0',
      dimension:edge.from.dimension,permission:'power.execute',
      cost:2,requires:['power.input'],provides:resultType},
      async material=>(await this.runLink(linkId,material['power.input'])).output);
    return resultType;
  }
  /**
   * Future developmental gate. We do NOT have an actual world-completion
   * verifier or reproduction mechanism: nothing here can create offspring.
   */
  reproductionStatus(){
    return Object.freeze({enabled:false,
      reason:!this.worldStatus.complete?'WORLD_NOT_COMPLETE':
        !this.worldStatus.verified?'WORLD_NOT_VERIFIED':'REPRODUCTION_NOT_IMPLEMENTED',
      requirement:'complete and independently verified world before design/authorization'});
  }
  snapshot(){
    return {agent:this.id,capacityPerPlace:64,
      assignment:Object.fromEntries(PLACES.map(d=>[d,this.slots(d).filter(x=>x.occupied)])),
      links:[...this.links.values()],receipts:this.receipts.length,
      reproduction:this.reproductionStatus()};
  }
}

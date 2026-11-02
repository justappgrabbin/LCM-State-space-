/**
 * Trusted adapter factory: interprets declarative face manifests as typed
 * providers for ClientComputer. A face manifest NEVER supplies executable code.
 * This module binds only to the audited local Klein Python executable.
 */
import { readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const here = dirname(fileURLToPath(import.meta.url));

const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const DEFAULT_MANIFEST = join(here, 'faces.manifest.json');
const PYTHON_ENGINE = join(here, 'klein_modern.py');

/**
 * Register all compatible face adapters. The registry planner does not
 * reference code/image/video anywhere: it discovers providers by type.
 *
 * Each client gets its own output folder and must explicitly authorize
 * artifact.write. The old LCM EventMesh and eight tools remain untouched.
 */
export async function loadLocalKleinFaces(registry, {
  manifestFile = DEFAULT_MANIFEST, workspaceRoot, python = 'python3'
} = {}) {
  if (!workspaceRoot) throw new Error('workspaceRoot is required');
  const doc = JSON.parse(await readFile(manifestFile, 'utf8'));
  if (doc.schema !== 'synthia-lcm/klein-faces.v1' || !Array.isArray(doc.capabilities))
    throw new Error('unsupported face manifest format');
  const outputRoot = resolve(workspaceRoot);
  await mkdir(outputRoot, {recursive: true});

  const registered = [];
  for (const face of doc.capabilities) {
    if (face.runner !== 'python-klein-v1') throw new Error('untrusted runner: ' + face.runner);
    if (!/^[a-z][a-z0-9._-]+$/.test(face.id ?? '') ||
        !/^\.[a-z0-9]+$/.test(face.extension ?? '') ||
        !face.requires.includes(face.requestType) ||
        !face.requires.includes(face.contextType))
      throw new Error('invalid face manifest');
    const run = async (materials, execContext) => {
      const request = materials[face.requestType];
      const bound = materials[face.contextType];
      if (!bound || !request || !['create','edit'].includes(request.action))
        throw new Error('face needs bound Klein context and create/edit request');
      if (bound.context?.address !== execContext.address ||
          !Array.isArray(bound.context.active) ||
          bound.context.active.length !== execContext.toolIds.length ||
          !execContext.toolIds.every(id => bound.context.active.includes(id))) {
        throw new Error('face context does not match active client context');
      }
      if (!Array.isArray(bound.tools)) throw new Error('canonical tools not provided');
      const clientFolder = join(outputRoot, hash(Buffer.from(execContext.clientId)).slice(0,16));
      await mkdir(clientFolder, {recursive:true});
      // Generates a fresh path; the Python engine refuses overwrites too.
      const output = join(clientFolder, randomUUID() + face.extension);
      const operation = request.operation;
      if (!operation || typeof operation !== 'object') throw new Error('operation required');
      let source = undefined;
      if (request.action === 'edit') {
        if (!request.source) throw new Error('editing needs explicit source');
        source = resolve(request.source);
        // By default editing only source artifacts under this client's sandbox.
        if (!source.startsWith(clientFolder + '/')) {
          throw new Error('cannot edit outside the client workspace; import first');
        }
      }
      const job = {tools: bound.tools, context: bound.context, modality: face.modality,
        action:request.action, operation, output, ...(source ? {source} : {})};
      const scratch = await mkdtemp(join(tmpdir(), 'lcm-face-'));
      try {
        const jobFile = join(scratch, 'job.json');
        await writeFile(jobFile, JSON.stringify(job), {flag:'wx'});
        const {stdout} = await execFileAsync(python,[PYTHON_ENGINE,jobFile],
          {timeout:120000, maxBuffer:1024*1024, windowsHide:true});
        const result = JSON.parse(stdout);
        const actualHash = hash(await readFile(result.output));
        const receipt = JSON.parse(await readFile(result.manifest,'utf8'));
        if (actualHash !== result.sha256 || receipt.output_sha256 !== actualHash ||
            receipt.evaluation.context.address !== execContext.address ||
            receipt.modality !== face.modality)
          throw new Error('artifact receipt verification failed');
        return {file:result.output, receiptFile:result.manifest, sha256:actualHash,
          evaluationHash:result.evaluation_hash, source:source ?? null,
          modality:face.modality, dimensionalLens:face.dimension};
      } finally {
        await rm(scratch,{recursive:true,force:true});
      }
    };
    registry.register(face, run);
    registered.push(face.id);
  }
  return registered;
}

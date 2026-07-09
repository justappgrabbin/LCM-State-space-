// sandboxRunner.js
//
// HONESTY NOTE: node:vm is NOT a real security boundary — code run here can
// still reach process, require, and the filesystem unless you strip those
// out of the context yourself. For code from yourself or known tools (what
// this POC is for) that's fine. For untrusted third-party submissions,
// you'd want a real isolate (worker_threads + restricted permissions, or a
// container/VM) — flagging this now so it doesn't get treated as more
// secure than it is.
//
// What this DOES give you: every submission (paper text or code) is logged
// with an id/timestamp, code submissions are actually executed with a
// timeout and their console output captured, and everything is queryable
// later via listSubmissions().

import vm from 'node:vm';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const SUBMISSIONS_DIR = path.resolve(process.cwd(), '.sandbox-submissions');

async function ensureDir() {
  await mkdir(SUBMISSIONS_DIR, { recursive: true });
}

/**
 * Submit and run a piece of JS code in an isolated vm context.
 * Captures console.log output instead of letting it hit real stdout.
 */
export async function submitCode({ title, code, timeoutMs = 2000, sourceTool = 'unknown' }) {
  await ensureDir();
  const id = randomUUID();
  const logs = [];
  const sandboxConsole = {
    log: (...args) => logs.push(args.map(String).join(' ')),
    error: (...args) => logs.push('[error] ' + args.map(String).join(' ')),
  };
  const context = vm.createContext({ console: sandboxConsole });

  let error = null;
  try {
    vm.runInContext(code, context, { timeout: timeoutMs });
  } catch (err) {
    error = err.message;
  }

  const record = {
    id,
    type: 'code',
    title,
    sourceTool,
    code,
    logs,
    error,
    submittedAt: new Date().toISOString(),
  };
  await writeFile(path.join(SUBMISSIONS_DIR, `${id}.json`), JSON.stringify(record, null, 2));
  return record;
}

/** Submit a paper/text artifact — logged but not executed. */
export async function submitPaper({ title, content, sourceTool = 'unknown' }) {
  await ensureDir();
  const id = randomUUID();
  const record = {
    id,
    type: 'paper',
    title,
    sourceTool,
    content,
    submittedAt: new Date().toISOString(),
  };
  await writeFile(path.join(SUBMISSIONS_DIR, `${id}.json`), JSON.stringify(record, null, 2));
  return record;
}

export async function listSubmissions() {
  await ensureDir();
  const files = await readdir(SUBMISSIONS_DIR);
  const records = [];
  for (const f of files.filter((f) => f.endsWith('.json'))) {
    records.push(JSON.parse(await readFile(path.join(SUBMISSIONS_DIR, f), 'utf-8')));
  }
  return records.sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
}

// githubRAG.js
// Retrieval-augmented coding inference WITHOUT an LLM call. Two-stage:
//   1. RETRIEVE: hit GitHub's public code search API for candidate snippets
//   2. RERANK: score candidates against the query using the same
//      co-occurrence/cosine-similarity math as Diseminer (distributional
//      semantics), so relevance ranking is deterministic, not model-based.
//
// This is the "extraction" role you correctly identified for Diseminer —
// it's reused here as the substrate for code retrieval rather than left
// stranded as a standalone demo tool.

import { ToolBase } from './ToolBase.js';

function tokenize(text) {
  return (text.toLowerCase().match(/[a-z0-9_]+/g) || []);
}

function termFreq(tokens) {
  const tf = new Map();
  for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
  return tf;
}

function cosine(a, b) {
  let dot = 0, magA = 0, magB = 0;
  const keys = new Set([...a.keys(), ...b.keys()]);
  for (const k of keys) {
    const x = a.get(k) || 0, y = b.get(k) || 0;
    dot += x * y; magA += x * x; magB += y * y;
  }
  if (!magA || !magB) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export class GitHubRAG extends ToolBase {
  constructor(mesh) {
    super(mesh, 'GitHubRAG', 'code.githubrag');
  }

  /**
   * input = { query: string, language?: string, maxResults?: number }
   * Requires network. GITHUB_TOKEN env var optional but raises rate limits
   * (60/hr unauthenticated -> 5000/hr with a token).
   */
  async run(input) {
    const { query, language, maxResults = 5 } = input;
    const token = process.env.GITHUB_TOKEN;
    let q = query;
    if (language) q += ` language:${language}`;

    const url = `https://api.github.com/search/code?q=${encodeURIComponent(q)}&per_page=${Math.min(maxResults * 2, 20)}`;
    const headers = {
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'synthia-klein-mesh-poc',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let res;
    try {
      res = await fetch(url, { headers });
    } catch (err) {
      return { ok: false, error: `network error: ${err.message}` };
    }
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `GitHub API ${res.status}: ${body.slice(0, 200)}`, hint: token ? undefined : 'set GITHUB_TOKEN to raise the 60/hr unauthenticated rate limit' };
    }
    const data = await res.json();
    const items = data.items || [];

    // Rerank candidates against the query using distributional similarity
    const queryVec = termFreq(tokenize(query));
    const scored = items.map((item) => {
      const text = `${item.repository?.full_name || ''} ${item.path || ''} ${item.name || ''}`;
      const vec = termFreq(tokenize(text));
      return {
        repo: item.repository?.full_name,
        path: item.path,
        url: item.html_url,
        score: cosine(queryVec, vec),
      };
    }).sort((a, b) => b.score - a.score).slice(0, maxResults);

    return { ok: true, query, totalFound: data.total_count ?? items.length, results: scored };
  }
}

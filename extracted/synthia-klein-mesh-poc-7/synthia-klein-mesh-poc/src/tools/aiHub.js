// aiHub.js — THE 9TH CENTER
//
// Connects your tools/mesh to your actual AI roster: Kimi, Claude, ChatGPT,
// Gemini. This is a ROUTER, not an oracle — it never picks a provider for
// you implicitly; the caller names one. Each provider is a no-op until its
// API key env var is set, same pattern as SupabaseSync, so this file is
// safe to ship even with zero keys configured.
//
// Env vars expected:
//   ANTHROPIC_API_KEY   -> Claude
//   OPENAI_API_KEY       -> ChatGPT
//   GOOGLE_API_KEY       -> Gemini
//   KIMI_API_KEY          -> Kimi (Moonshot AI)

import { ToolBase } from './ToolBase.js';

const PROVIDERS = {
  claude: {
    envKey: 'ANTHROPIC_API_KEY',
    async call(prompt, key) {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] }),
      });
      const data = await res.json();
      return data?.content?.map((c) => c.text).join('') ?? JSON.stringify(data);
    },
  },
  chatgpt: {
    envKey: 'OPENAI_API_KEY',
    async call(prompt, key) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }] }),
      });
      const data = await res.json();
      return data?.choices?.[0]?.message?.content ?? JSON.stringify(data);
    },
  },
  gemini: {
    envKey: 'GOOGLE_API_KEY',
    async call(prompt, key) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      const data = await res.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? JSON.stringify(data);
    },
  },
  kimi: {
    envKey: 'KIMI_API_KEY',
    async call(prompt, key) {
      const res = await fetch('https://api.moonshot.cn/v1/chat/completions', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
        body: JSON.stringify({ model: 'moonshot-v1-8k', messages: [{ role: 'user', content: prompt }] }),
      });
      const data = await res.json();
      return data?.choices?.[0]?.message?.content ?? JSON.stringify(data);
    },
  },
};

export class AIHub extends ToolBase {
  constructor(mesh) {
    super(mesh, 'AIHub', 'hub.ninthcenter');
  }

  status() {
    return Object.fromEntries(
      Object.entries(PROVIDERS).map(([name, p]) => [name, Boolean(process.env[p.envKey])])
    );
  }

  /** input = { provider: 'claude'|'chatgpt'|'gemini'|'kimi', prompt: string } */
  async run(input) {
    const { provider, prompt } = input;
    const p = PROVIDERS[provider];
    if (!p) return { ok: false, error: `unknown provider "${provider}". Options: ${Object.keys(PROVIDERS).join(', ')}` };
    const key = process.env[p.envKey];
    if (!key) return { ok: false, error: `${provider} not configured — set ${p.envKey} to enable`, status: this.status() };
    try {
      const text = await p.call(prompt, key);
      return { ok: true, provider, response: text };
    } catch (err) {
      return { ok: false, error: `${provider} call failed: ${err.message}` };
    }
  }
}

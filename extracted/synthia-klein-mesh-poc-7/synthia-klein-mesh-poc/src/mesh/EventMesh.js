// EventMesh.js
// The "mesh" connecting all 8 tools. Pure Node EventEmitter underneath —
// no network dependency required for the local POC.
//
// EMERGENT CHANNELS: channels are not pre-declared anywhere. The first time
// any tool publishes to a channel name, the mesh registers it and emits a
// 'mesh:emergence' event so subscribers can react to new topology forming
// in real time. This mirrors Klein's bidirectional rule architecture: the
// same publish/subscribe primitive drives both "generation" (a tool posting
// a result) and "recognition" (another tool noticing a pattern and reacting).

import { EventEmitter } from 'node:events';
import { randomUUID } from 'node:crypto';

export class EventMesh extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(0);
    this.channels = new Map(); // channelName -> { createdAt, messageCount, sourceTools: Set }
    this.log = [];
  }

  /** Publish a message onto a channel. Channel is created on first use. */
  publish(channel, sourceTool, payload) {
    const isNew = !this.channels.has(channel);
    if (isNew) {
      this.channels.set(channel, {
        createdAt: Date.now(),
        messageCount: 0,
        sourceTools: new Set(),
      });
      this.emit('mesh:emergence', { channel, firstSource: sourceTool, at: Date.now() });
    }
    const meta = this.channels.get(channel);
    meta.messageCount += 1;
    meta.sourceTools.add(sourceTool);

    const message = {
      id: randomUUID(),
      channel,
      sourceTool,
      payload,
      at: Date.now(),
    };
    this.log.push(message);
    this.emit(channel, message);
    this.emit('mesh:any', message); // wildcard listeners
    return message;
  }

  /** Subscribe to a specific channel by name. */
  subscribe(channel, handler) {
    this.on(channel, handler);
    return () => this.off(channel, handler);
  }

  /** Subscribe to every message regardless of channel (wildcard). */
  subscribeAll(handler) {
    this.on('mesh:any', handler);
    return () => this.off('mesh:any', handler);
  }

  /** Subscribe to channel emergence itself — useful for a watchdog/reporter. */
  onEmergence(handler) {
    this.on('mesh:emergence', handler);
    return () => this.off('mesh:emergence', handler);
  }

  topology() {
    return Array.from(this.channels.entries()).map(([name, meta]) => ({
      channel: name,
      messageCount: meta.messageCount,
      sourceTools: Array.from(meta.sourceTools),
      ageMs: Date.now() - meta.createdAt,
    }));
  }
}

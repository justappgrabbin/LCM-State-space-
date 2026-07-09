// witness.js
//
// Two additive pieces. Neither touches any of the 8 original tools.
//
// 1. Witness -- wraps ANY existing ToolBase instance. Intercepts its
//    run()/runAndPublish() calls and publishes a snapshot (input + output +
//    timestamp) to a dedicated witness channel. The wrapped tool never
//    knows it's being watched -- it keeps running exactly as it always
//    has. This is what makes the system "locally self-measuring" without
//    modifying a single one of the 8 tools.
//
// 2. TripleWitness -- watches three specific channels (e.g. one per
//    dimension: mind/body/heart) and fires a callback the moment all
//    three have published within a given time window. This is the actual
//    mechanism underneath "a triple crystallizes when three dimensions
//    co-activate" -- built as a detector, not as a rewrite of AutoLing.
//    AutoLing keeps doing exactly what it does (bidirectional relation
//    matching); TripleWitness is a separate, additional watcher.

export class Witness {
  /**
   * @param mesh        the EventMesh instance
   * @param tool        any existing ToolBase instance (unmodified)
   * @param witnessChannel  where snapshots get published, e.g. "mind:memory:17:witness"
   */
  constructor(mesh, tool, witnessChannel) {
    this.mesh = mesh;
    this.tool = tool;
    this.witnessChannel = witnessChannel;
  }

  /** Run the wrapped tool exactly as normal, then publish a snapshot. */
  async runAndWitness(input) {
    const startedAt = Date.now();
    const output = await this.tool.runAndPublish(input); // tool's own behavior, untouched
    const snapshot = {
      tool: this.tool.name,
      toolChannel: this.tool.channel,
      input,
      output,
      startedAt,
      finishedAt: Date.now(),
    };
    this.mesh.publish(this.witnessChannel, `Witness(${this.tool.name})`, snapshot);
    return output;
  }
}

export class TripleWitness {
  /**
   * @param mesh     the EventMesh instance
   * @param channels array of exactly 3 channel names to watch
   *                 (e.g. ["mind:...", "body:...", "heart:..."])
   * @param windowMs how close together (ms) all 3 must fire to count as
   *                 one crystallization event, default 2000ms
   * @param onTriple callback({ mind, body, heart, channels }) fired once
   *                 per crystallization
   */
  constructor(mesh, channels, { windowMs = 2000, onTriple } = {}) {
    if (channels.length !== 3) {
      throw new Error("TripleWitness requires exactly 3 channels");
    }
    this.mesh = mesh;
    this.channels = channels;
    this.windowMs = windowMs;
    this.onTriple = onTriple;
    this.latest = new Map(); // channel -> {message, at}
    this.unsubscribers = channels.map((ch) =>
      mesh.subscribe(ch, (message) => this._onMessage(ch, message))
    );
  }

  _onMessage(channel, message) {
    this.latest.set(channel, { message, at: Date.now() });
    this._checkCrystallization();
  }

  _checkCrystallization() {
    if (this.latest.size < 3) return;
    const times = [...this.latest.values()].map((v) => v.at);
    const spread = Math.max(...times) - Math.min(...times);
    if (spread > this.windowMs) return; // not close enough together -- no triple yet

    const [chA, chB, chC] = this.channels;
    const triple = {
      channels: this.channels,
      a: { channel: chA, ...this.latest.get(chA) },
      b: { channel: chB, ...this.latest.get(chB) },
      c: { channel: chC, ...this.latest.get(chC) },
      crystallizedAt: Date.now(),
    };
    this.mesh.publish(
      `triple:${this.channels.join("+")}`,
      "TripleWitness",
      triple
    );
    if (this.onTriple) this.onTriple(triple);
    this.latest.clear(); // reset for the next crystallization
  }

  destroy() {
    this.unsubscribers.forEach((unsub) => unsub());
  }
}

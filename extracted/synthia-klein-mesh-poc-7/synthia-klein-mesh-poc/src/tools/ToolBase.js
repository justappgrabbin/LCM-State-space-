// ToolBase.js
// Common contract for every Klein-system tool. Each tool:
//  - has a name and a home channel it publishes to
//  - implements run(input) with real logic (no LLM call)
//  - can read other tools' output by subscribing to mesh channels
//  - can ALSO emit JS code, not just semantic structures, via codegen()

export class ToolBase {
  constructor(mesh, name, channel) {
    this.mesh = mesh;
    this.name = name;
    this.channel = channel;
  }

  /** Override: do the actual work, return a result object. */
  run(_input) {
    throw new Error(`${this.name}.run() not implemented`);
  }

  /** Convenience: run, then publish the result onto this tool's channel.
   *  Supports tools whose run() returns a Promise. */
  async runAndPublish(input) {
    const result = await this.run(input);
    this.mesh.publish(this.channel, this.name, result);
    return result;
  }

  /**
   * Optional: tools that can also emit runnable JS (not just semantics)
   * implement this. Returns a string of JS source.
   */
  codegen(_input) {
    return `// ${this.name} has no codegen() implementation yet.`;
  }
}

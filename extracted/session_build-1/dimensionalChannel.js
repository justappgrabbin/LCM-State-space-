// dimensionalChannel.js
//
// Pure naming convention layer over the EXISTING EventMesh. Nothing about
// EventMesh.publish/subscribe changes -- channels are still just strings,
// still still created on first publish. This only gives you a consistent
// way to build and parse those strings so a channel name carries real
// coordinates: which of the 5 dimensions, which of up to 9 centers, which
// of the 64 gates, which tool is speaking.
//
// {dimension}:{center}:{gate}:{tool}
// e.g. "mind:memory:17:autoling"
//
// This does NOT confine any tool or any hub to one center. A tool can
// publish/subscribe across as many dimensional coordinates as it wants --
// this just makes those coordinates legible instead of implicit.

export function buildChannel({ dimension, center, gate, tool }) {
  const parts = [dimension, center, gate, tool].filter(
    (p) => p !== undefined && p !== null && p !== ""
  );
  if (parts.length === 0) {
    throw new Error("buildChannel: at least one coordinate is required");
  }
  return parts.join(":");
}

/**
 * Parse a dimensional channel string back into its parts. Tolerant of
 * partial channels (e.g. just "mind:memory" or a plain legacy channel
 * name like "lang.autoling" from the original 8 tools -- those still work
 * unchanged, they just won't have dimension/center/gate/tool split out).
 */
export function parseChannel(channelName) {
  const parts = channelName.split(":");
  const [dimension, center, gate, tool] = parts;
  return {
    raw: channelName,
    dimension: dimension ?? null,
    center: center ?? null,
    gate: gate !== undefined ? Number(gate) || gate : null,
    tool: tool ?? null,
    isDimensional: parts.length > 1, // false for legacy flat channel names
  };
}

/**
 * Subscribe to every channel matching a partial dimensional coordinate.
 * Since EventMesh channels aren't pre-declared, this works by wildcard-
 * listening (mesh.subscribeAll) and filtering by prefix match -- no change
 * to EventMesh required.
 *
 * match = { dimension?, center?, gate?, tool? } -- any subset.
 * Only the fields you provide are required to match; omitted fields are
 * wildcards.
 */
export function subscribeDimensional(mesh, match, handler) {
  return mesh.subscribeAll((message) => {
    const parsed = parseChannel(message.channel);
    const fields = ["dimension", "center", "gate", "tool"];
    const isMatch = fields.every((f) => {
      if (match[f] === undefined || match[f] === null) return true;
      return String(parsed[f]) === String(match[f]);
    });
    if (isMatch) handler(message, parsed);
  });
}

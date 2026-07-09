// channelArchitectures.js
//
// Per-channel neural/computational archetype assignments, consolidated
// from TWO separate past verified sessions (not tonight's pasted docs,
// which flattened these down to one value per whole circuit). Each
// channel keeps its OWN specific architecture -- the circuit-level base
// is a separate property, not a replacement for the per-channel value.
//
// Status per entry: CONFIRMED (verified across sessions, validated with
// stated reasoning) or UNRESOLVED (flagged with "?" in the source
// sessions, never actually assigned).

export const CIRCUIT_BASE_RHYTHM = {
  Understanding: "DFF (continuous, feedforward)",
  Knowing: "LSM (pulsed, unpredictable bursts -- 3-60 IS this base)",
  Sensing: "DBN / developmental, layer-wise growth",
  Ego: "HMM (reputation over time -- hidden state=true will, observable=agreements, transitions=track record)",
};

export const CHANNEL_ARCHITECTURES = {
  // ---- Understanding circuit (DFF base) ----
  "63-4":  { name: "Logic",       arch: "DFF (Deep Feed Forward)",              circuit: "Understanding", status: "CONFIRMED",
    reasoning: "Pure pattern recognition, no recursion/memory -- pressure (63) to formula (4), straight signal forward." },
  "17-62": { name: "Acceptance",  arch: "RBM (Restricted Boltzmann Machine)",   circuit: "Understanding", status: "CONFIRMED",
    reasoning: "Two-layer bidirectional constraint -- opinion (17, hidden) and facts (62, visible) constrain each other." },
  "18-58": { name: "Judgment",    arch: "Hopfield Network",                     circuit: "Understanding", status: "CONFIRMED",
    reasoning: "Stores an ideal pattern (58, baseline vitality), corrects deviation (18) -- attractor dynamics, error correction." },
  "16-48": { name: "Wavelength",  arch: "Sparse Autoencoder",                   circuit: "Understanding", status: "CONFIRMED",
    reasoning: "Compresses deep knowledge (48) into efficient expressible skill (16) -- sparse latent representation." },
  "9-52":  { name: "Concentration", arch: "ELM (Extreme Learning Machine)",     circuit: "Understanding", status: "CONFIRMED",
    reasoning: "Fixed random projection -- concentration as a fixed, untrained focal point." },
  "15-5":  { name: "Rhythm",      arch: "Kohonen Network (Self-Organizing Map)", circuit: "Understanding", status: "CONFIRMED",
    reasoning: "Self-organizing topology -- rhythm organizes itself without supervision." },
  "31-7":  { name: "The Alpha",   arch: "DCN (Deep Convolutional Network)",     circuit: "Understanding", status: "CONFIRMED",
    reasoning: "Multi-scale hierarchical filters -- leadership operating across many scales at once." },

  // ---- Knowing circuit (LSM base) ----
  "3-60":  { name: "Mutation",    arch: "LSM (Liquid State Machine)",           circuit: "Knowing", status: "CONFIRMED",
    reasoning: "THE base rhythm of the whole circuit -- unpredictable burst firing, reservoir dynamics." },
  "61-24": { name: "Awareness",   arch: "NTM (Neural Turing Machine)",          circuit: "Knowing", status: "CONFIRMED",
    reasoning: "External memory read/write into the unknowable -- 'knocking on a door with no handle.'" },
  "43-23": { name: "Structuring", arch: "Deconvolutional Network",              circuit: "Knowing", status: "CONFIRMED",
    reasoning: "Reverses compression -- internal abstract knowing (43) unpacked into communicable structure (23)." },
  "28-38": { name: "Struggle",    arch: "GAN (Generative Adversarial Network)", circuit: "Knowing", status: "CONFIRMED",
    reasoning: "Two literally opposing forces (28 purpose-seeking vs 38 fighting-to-fight) -- tension IS the architecture." },
  "20-57": { name: "Brainwave",   arch: "ESN (Echo State Network)",             circuit: "Knowing", status: "CONFIRMED",
    reasoning: "No processing delay -- reservoir fires, voice speaks immediately, present-moment signal." },
  "55-39": { name: "Emoting",     arch: "Capsule Network",                      circuit: "Knowing", status: "CONFIRMED (corrected)",
    reasoning: "Corrected from an earlier GRU guess -- spirit maintaining orientation/identity through provocation, which is what capsule networks preserve (pose/identity) rather than just gating flow." },
  "12-22": { name: "Openness",    arch: "VAE (Variational Autoencoder)",        circuit: "Knowing", status: "CONFIRMED",
    reasoning: "Latent space sampling of social emotion -- refined/reconstructed, not raw." },
  "2-14":  { name: "The Beat",    arch: "RBF (Radial Basis Function Network)",  circuit: "Knowing", status: "CONFIRMED",
    reasoning: "Directional resonance radiating from a center, not a logical decision." },
  "8-1":   { name: "Inspiration", arch: "Attention Network",                    circuit: "Knowing", status: "CONFIRMED",
    reasoning: "Salience detection -- making the invisible visible through focus." },

  // ---- Sensing circuit (DBN/developmental base) ----
  "42-53": { name: "Maturation",  arch: "DBN (Deep Belief Network)",            circuit: "Sensing", status: "CONFIRMED",
    reasoning: "Layer-wise developmental growth -- this is also the circuit's own base rhythm." },
  "64-47": { name: "Abstraction", arch: "DNC (Differentiable Neural Computer)", circuit: "Sensing", status: "CONFIRMED" },
  "11-56": { name: "Curiosity",   arch: "GAN (Generative Adversarial Network)", circuit: "Sensing", status: "CONFIRMED" },
  "46-29": { name: "Discovery",   arch: "DCIGN (Deep Convolutional Inverse Graphics Network)", circuit: "Sensing", status: "CONFIRMED" },
  "33-13": { name: "The Prodigal / Fellowship", arch: "NTM (Neural Turing Machine)", circuit: "Sensing", status: "CONFIRMED" },
  "30-41": { name: "Recognition", arch: "Kuramoto oscillator, permanently sub-threshold coupling (see dimensionalEdge.js)", circuit: "Sensing", status: "CONFIRMED",
    reasoning: "Ra's own Guide to the Channels: expectation -> desire -> consumption -> emptiness -> expectation again, explicitly 'never demonstrate emotional awareness,' never reaching clarity. This is NOT a Hopfield-style convergence (that settles into a stored stable pattern). It's the Kuramoto order parameter r structurally never reaching 1.0 -- oscillating permanently without phase-lock, by the gate's own described nature, not a bug in the model." },
  "35-36": { name: "Transitoriness", arch: "VAE (Variational Autoencoder)",     circuit: "Sensing", status: "CONFIRMED" },

  // ---- Centering (not a full circuit -- G/Sacral connective channels) ----
  "10-34": { name: "Exploration", arch: "DRN (Deep Residual Network)",          circuit: "Centering", status: "CONFIRMED" },
  "25-51": { name: "Initiation",  arch: "DAE (Denoising Autoencoder)",          circuit: "Centering", status: "CONFIRMED (corrected)",
    reasoning: "Corrected from an earlier Actor-Critic guess -- shock (51) as a denoising process, restoring signal (25) through disruption." },

  // ---- Ego circuit -- HMM base, individual channels not fully itemized in past sessions ----
  // Only the CIRCUIT base (HMM) was confirmed; specific channel-level
  // architectures within Ego were not found in what's been searched so
  // far. Flagged as a real gap, not guessed at.
};

export function getChannelArchitecture(channelId) {
  return CHANNEL_ARCHITECTURES[channelId] ?? { status: "NOT FOUND", note: "not covered by any verified past session" };
}

export function unresolvedChannels() {
  return Object.entries(CHANNEL_ARCHITECTURES)
    .filter(([, v]) => v.status.includes("UNRESOLVED"))
    .map(([id, v]) => ({ id, ...v }));
}

if (typeof process !== "undefined") {
  try {
    if (import.meta.url === `file://${process.argv[1]}`) {
      const confirmed = Object.values(CHANNEL_ARCHITECTURES).filter((v) => v.status.includes("CONFIRMED")).length;
      const total = Object.keys(CHANNEL_ARCHITECTURES).length;
      console.log(`Channel architectures: ${confirmed}/${total} confirmed (of 36 total HD channels, ${total} have been touched by prior verification work)`);
      console.log("Unresolved:", unresolvedChannels());
      console.log("\nExample -- 28-38 Struggle:", getChannelArchitecture("28-38"));
    }
  } catch (_) { /* browser context */ }
}

// dimensionalEdge.js
//
// Two real, established mathematical mechanisms, combined:
//
// 1. RESONANCE WEIGHT -- cosine similarity between three dimensions'
//    computed values for a gate. Same math Diseminer already uses for
//    term vectors, applied here to dimension-value vectors instead.
//    Produces a static edge weight: how aligned are these three
//    dimensions RIGHT NOW, for this gate.
//
// 2. PHASE SYNCHRONY -- the Kuramoto model (real physics/neuroscience
//    math for coupled oscillators). Each dimension is treated as an
//    oscillator with its own phase and natural frequency; coupling
//    strength pulls them toward synchrony over time. This is the same
//    underlying math behind "binding by synchrony" in neuroscience
//    (Singer & Gray) -- features bind into one percept when the neural
//    populations encoding them phase-lock in gamma-band oscillation.
//    A triple "crystallizing" IS three dimensions phase-locking.
//
// Neither of these is a neural net with learned weights. Both are pure,
// deterministic state-space math -- consistent with "state space, not
// neural net" established earlier this session.

/**
 * Cosine similarity between two equal-length numeric vectors.
 * Returns a value in [-1, 1]. 1 = perfectly aligned, 0 = orthogonal
 * (unrelated), -1 = perfectly opposed.
 */
function cosineSimilarity(a, b) {
  if (a.length !== b.length) throw new Error("vectors must be equal length");
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/**
 * Compute the resonance-based edge weight between three dimensions for a
 * given gate. Each `dimensionValues` entry is a numeric vector produced
 * by that dimension's own function (spectrum hue, Color/Tone/Base value,
 * degree position -- whatever that dimension actually computes).
 *
 * Returns pairwise similarities AND a combined triple-coherence score
 * (average of the three pairwise similarities) -- this combined score is
 * the actual edge weight for the triple as a whole.
 */
export function resonanceEdgeWeight(dimensionValues) {
  const [a, b, c] = dimensionValues; // three vectors, one per dimension
  const ab = cosineSimilarity(a, b);
  const bc = cosineSimilarity(b, c);
  const ac = cosineSimilarity(a, c);
  return {
    pairwise: { ab, bc, ac },
    tripleCoherence: (ab + bc + ac) / 3, // the actual edge weight
  };
}

/**
 * Kuramoto oscillator model -- N oscillators, each with a phase (radians)
 * and natural frequency, pulled toward synchrony by coupling strength K.
 * Standard equation: dtheta_i/dt = omega_i + (K/N) * sum(sin(theta_j - theta_i))
 *
 * Returns a stepper function: call it repeatedly to advance the
 * simulation by dt, and it returns current phases + an order parameter r
 * (0 = fully desynchronized, 1 = fully phase-locked -- r IS the real-time
 * "how close to crystallizing" measure).
 */
export function createOscillatorSystem(initialPhases, naturalFrequencies, couplingStrength) {
  let phases = [...initialPhases];
  const N = phases.length;
  const omega = naturalFrequencies;
  const K = couplingStrength;

  function orderParameter() {
    // Kuramoto order parameter r*e^(i*psi) = (1/N) * sum(e^(i*theta_j))
    let sumSin = 0, sumCos = 0;
    for (const theta of phases) {
      sumSin += Math.sin(theta);
      sumCos += Math.cos(theta);
    }
    const r = Math.sqrt(sumSin * sumSin + sumCos * sumCos) / N;
    const psi = Math.atan2(sumSin, sumCos);
    return { r, psi }; // r close to 1 = phase-locked = triple crystallizing
  }

  function step(dt = 0.01) {
    const next = phases.map((theta_i, i) => {
      let coupling = 0;
      for (let j = 0; j < N; j++) {
        coupling += Math.sin(phases[j] - theta_i);
      }
      const dtheta = omega[i] + (K / N) * coupling;
      return theta_i + dtheta * dt;
    });
    phases = next;
    return { phases: [...phases], ...orderParameter() };
  }

  return { step, getPhases: () => [...phases], orderParameter };
}

// ============================================================
// Self-test
// ============================================================
function _selfTest() {
  console.log("--- Resonance edge weight (static, cosine similarity) ---");
  // Example: three dimensions' computed values for the same gate
  const mindValue = [0.8, 0.2, 0.5];
  const bodyValue = [0.75, 0.25, 0.45];
  const heartValue = [0.1, 0.9, 0.3];
  const result = resonanceEdgeWeight([mindValue, bodyValue, heartValue]);
  console.log("Mind/Body/Heart triple coherence:", result);

  console.log("\n--- Phase synchrony (dynamic, Kuramoto oscillators) ---");
  // Three oscillators (Mind, Body, Heart) with different natural frequencies,
  // moderate coupling -- watch them pull toward (or fail to reach) sync.
  const system = createOscillatorSystem(
    [0, Math.PI / 2, Math.PI],   // initial phases: totally out of sync
    [1.0, 1.05, 0.95],           // natural frequencies (close but not identical)
    2.0                           // coupling strength
  );
  for (let t = 0; t < 5; t++) {
    const state = system.step(0.1);
    console.log(`t=${t}  r=${state.r.toFixed(3)} (1.0 = fully phase-locked/crystallized)`);
  }
}

try {
  const isDirectRun =
    typeof process !== "undefined" &&
    import.meta.url === `file://${process.argv[1]}`;
  if (isDirectRun) _selfTest();
} catch (_) { /* browser/bundler context -- skip */ }

// PENDING_VERIFICATION.js
//
// Two pieces from tonight's pasted code that are NOT merged into
// stateSpace.js because they're new, asserted schemes with no source
// behind them yet -- not because they're wrong. Holding them here so
// nothing gets lost while waiting on clarification.

// QUESTION 1: Is this a real 9th Klein tool from another session, or did
// this drift away from the 8 REAL, cited tools already verified in
// synthia-klein-mesh-poc (AutoLing, Diseminer, NovelWriter, Messy,
// AnalogyEngine, IChingGrammar, LanguageContact, HistoricalMonteCarlo)?
export const KLEIN_TOOLS_PENDING = {
  1: { name: "Head_Center_Engine", primaryExpression: "CODE" },
  2: { name: "Ajna_Center_Engine", primaryExpression: "TEXT" },
  3: { name: "Throat_Center_Engine", primaryExpression: "TEXT" },
  4: { name: "G_Center_Engine", primaryExpression: "VISUAL" },
  5: { name: "Heart_Center_Engine", primaryExpression: "CODE" },
  6: { name: "Sacral_Center_Engine", primaryExpression: "VISUAL" },
  7: { name: "Spleen_Center_Engine", primaryExpression: "CODE" },
  8: { name: "Solar_Plexus_Engine", primaryExpression: "TEXT" },
  9: { name: "Root_Center_Engine", primaryExpression: "VISUAL" },
};

// QUESTION 2: Is this planet -> dimension assignment from a specific
// source, or an assumption that needs checking? Doesn't yet match the
// five dimensions (Movement/Evolution/Being/Design/Space) or the
// Tropical/Sidereal/Draconic lens system already confirmed tonight.
export function getActivationDimension_PENDING(planetKey, streamType) {
  if (streamType === "design") return "BODY";
  switch (planetKey) {
    case "Sun":
    case "Earth":
      return "PERSONALITY";
    case "NorthNode":
    case "SouthNode":
      return "JOURNEY";
    case "Moon":
    case "Mercury":
      return "MIND";
    case "Venus":
    case "Mars":
      return "HEART";
    default:
      return "JOURNEY";
  }
}

# Klein modern adapters — experimental branch

This folder adds the **existing tested standalone Python multimodal prototype** to the LCM repository without replacing its original ZIPs, extracted historical files, JS EventMesh, or Klein source tools.

## What is here

- \`klein_modern.py\`: SPEC-2-style contextual gate tool evaluation; deterministic, non-destructive code/image/video create/edit operations; SHA-256 receipts.
- \`tests/test_klein_modern.py\`: nine pytest cases covering joint evaluation, validation, child activation, code AST, image pixels, video output, and receipts.
- \`examples/code_job.json\`: fully specified example.
- \`AUDIT.md\`: historical candidate comparisons and unresolved verification.
- \`requirements-dev.txt\`: local testing dependencies.

This is deliberately **additive**. The original LCM proof-of-concept is in \`extracted/synthia-klein-mesh-poc-7/synthia-klein-mesh-poc/\`. That code uses a JavaScript \`EventMesh\` and contains the original eight-tool inventory; **nothing in it is overwritten or secretly replaced**.

## Usage

Requires Python 3.10+, [ffmpeg](https://ffmpeg.org/) with libx264, and Pillow (installed through pip).

From the repository root:

\`\`\`bash
python -m pip install -r modern/requirements-dev.txt
python -m pytest -q modern/tests
python modern/klein_modern.py modern/examples/code_job.json
\`\`\`

The example writes \`modern/examples/generated_signal_mix.py\` and its accompanying \`.klein.json\` receipt. Change \`output\` or delete your generated local output before running the job again. Outputs are never overwritten. No API key or cloud AI service is needed.

## Contract

1. **Explicit active node:** two or more distinct Klein tools must be jointly active in one supplied address/context. No isolated tool can produce a canonical joint result.
2. **Exact core output:** \`{relation, intensity, direction}\`; media-specific dimensions are metadata outside the core contract.
3. **No invented mappings:** gate-trigram bits must be supplied from authoritative external source; demo gate numbers and bits are **test fixtures only**.
4. **Same five frames:** Movement, Evolution, Being, Design, Space. New code/image/video qualities are projections of these, not new physics or a sixth dimension.
5. **Evidence and history:** deterministic context fingerprint, source and artifact hashes, explicit witnessed receipt, and separate possible-only concept.
6. **Non-destructive:** each output is a **new path**. Inputs, current LCM archives, default branch and historic interfaces remain unmodified.

### Mathematical fidelity boundary

The \`provisional-trigram-joint-v1\` numerical kernel is an **illustrative placeholder**, not a recovered original Klein equation or the authoritative Synthia operator. It must be replaced after the canonical gate-mesh registry and joint-composition rule are verified against the original sources.

The previous version's nine tests passing proves only the prototype's current contract and media operations. It **does not prove** all historical Sheldon Klein programs are implemented faithfully, or that this is already connected to the live application.

### Media operations

- Code: Python AST-safe restricted expression creation and AST symbol renaming into new files.
- Image: Pillow drawing and basic geometric/pixel edits.
- Video: deterministic scene animation into real H.264 MP4 using ffmpeg; trims/resizes/brightness/grayscale.
- Not included: pretrained generative image/video model, IDE/Morph integration, autonomous code generation, or historical AUTOLING/DISEMINER replacement.

## Integration path

**Do not rewrite the original POC.** Next stage is an explicit adapter to its \`EventMesh.publish()\`/tool registry with validated source addresses and provenance. The Python prototype is currently independent, so an LCM mesh event is *not* emitted by this code. Once canonical mappings and operator are identified, bridge rather than duplicating those authorities.

Suggested channel: \`artifact.klein.multimodal\`; payload is the verified \`.klein.json\` receipt. The channel should only be published *after* artifact verification, and must retain source address, source tool(s), dimension lens, and receipt hashes.

## Reference

- [Synthia architecture and SPEC-2](https://docs.google.com/document/d/1a4-4qM_dOJSaUUokRA68s1g0KeUkxUX5-YWnuS11bFs/edit)
- [Behavioral comparison of historical Klein GitHub candidates](https://drive.google.com/file/d/1GHWmHzDkBprgeRg5Uj2JevR-ejhOu8Bb/view)
- [Klein execution report](https://drive.google.com/file/d/14PF4IgEelrKWCTLytBYPRtyzv_o3IRQH/view)

Prepared on a separate review branch; do not merge without validating the canonical operator and historical fixtures.

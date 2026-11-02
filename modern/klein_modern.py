#!/usr/bin/env python3
"""Synthia Klein SPEC-2 extension prototype. Additive, local, deterministic.

This is NOT a replacement for historical Sheldon Klein AUTOLING/DISEMINER
or the canonical Synthia graph/mesh. Inject canonical gate/trigram/address data.
"""
from __future__ import annotations
import argparse
import ast
import hashlib
import json
import math
import os
import re
import subprocess
import tempfile
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Any

DIMENSIONS = ("Movement", "Evolution", "Being", "Design", "Space")
WHO_MAP = {"who": "Space", "what": "Evolution", "where": "Being", "when": "Movement", "why": "Design"}


def canonical(obj: Any) -> str:
    return json.dumps(obj, sort_keys=True, ensure_ascii=False, separators=(",", ":"), allow_nan=False)


def sha256_bytes(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def hash_file(path: str | Path) -> str:
    return sha256_bytes(Path(path).read_bytes())


def clamp(x: float) -> float:
    return max(0.0, min(1.0, x))


@dataclass(frozen=True)
class Tool:
    id: str
    gate: int
    trigram: tuple[int, int, int]
    children: tuple['Tool', ...] = ()

    def __post_init__(self) -> None:
        if not self.id or not 1 <= self.gate <= 64 or len(self.trigram) != 3 or any(x not in (0, 1) for x in self.trigram):
            raise ValueError('tool requires id, canonical gate 1..64, and three binary trigram bits')
        if len(self.children) > 3 or len(set(c.id for c in self.children)) != len(self.children):
            raise ValueError('zero to three uniquely identified child tools allowed')


@dataclass(frozen=True)
class Context:
    address: str
    active: tuple[str, ...]
    dimension_weights: dict[str, float]
    phase: float = 0.0
    coherence: float = 1.0

    def __post_init__(self) -> None:
        if not self.address or len(self.active) < 2 or len(set(self.active)) != len(self.active):
            raise ValueError('explicit node address and at least two unique co-active tools required')
        if set(self.dimension_weights) != set(DIMENSIONS):
            raise ValueError('all five pre-existing dimension weights required; no invented axis')
        for n in (*self.dimension_weights.values(), self.phase, self.coherence):
            if not isinstance(n, (float, int)) or not math.isfinite(n) or not 0 <= n <= 1:
                raise ValueError('dimension weights, phase and coherence must be finite 0..1')


class KleinEngine:
    """Evaluates *joint* topological contacts, never sums separate tool outputs.

    The contact metric is explicitly a PROVISIONAL, replaceable kernel, because
    SPEC-2 specifies invariants but no unique numerical relation formula.
    """
    def __init__(self, tools: list[Tool]):
        if len({t.id for t in tools}) != len(tools):
            raise ValueError('duplicate tool ids')
        self.tools = {t.id: t for t in tools}
        self.ledger: dict[str, dict] = {}

    @staticmethod
    def _kernel(selected: list[Tool], context: Context) -> dict:
        pairs = [(selected[i], selected[j]) for i in range(len(selected)) for j in range(i + 1, len(selected))]
        if not pairs:
            raise ValueError('joint evaluation requires at least two active tools')
        # Each directed triad contact depends on BOTH trigrams in the same evaluation.
        contacts = [sum(a.trigram[k] ^ b.trigram[(k + 1) % 3] for k in range(3)) / 3.0 for a, b in pairs]
        alignments = [sum(a.trigram[k] == b.trigram[k] for k in range(3)) / 3.0 for a, b in pairs]
        h = sum(contacts) / len(contacts)
        alignment = sum(alignments) / len(alignments)
        # The five *existing* weights modulate the same pairwise contact, not five new tools.
        w = context.dimension_weights
        temporal = (context.phase + w['Movement']) / 2
        field = (w['Being'] + w['Design'] + w['Evolution'] + w['Space']) / 4
        interaction = clamp((h * (0.4 + 0.3 * field) + (1 - alignment) * 0.3) * (0.65 + 0.35 * context.coherence))
        # Relation is emergent from joint contact quality and current context.
        relation = 'interference' if h > 0.66 and alignment < 0.5 else ('resonance' if alignment >= 0.66 else 'exchange')
        direction = 1 if temporal + (h - alignment) / 2 > 0.58 else (-1 if temporal + (h - alignment) / 2 < 0.42 else 0)
        return {'relation': relation, 'intensity': round(interaction, 8), 'direction': direction}

    def evaluate(self, context: Context, selected_ids: tuple[str, ...] | None = None) -> tuple[dict, dict]:
        ids = tuple(sorted(selected_ids if selected_ids is not None else context.active))
        if len(ids) < 2 or len(set(ids)) != len(ids) or not set(ids).issubset(context.active):
            raise ValueError('evaluated tools must be unique, co-active members of explicit context')
        if not set(ids).issubset(self.tools):
            raise ValueError('unknown tool id; never invent missing gate operators')
        selection = [self.tools[x] for x in ids]
        record = {'address': context.address, 'active': sorted(context.active), 'selected': list(ids),
                  'trigrams': {t.id: list(t.trigram) for t in selection},
                  'gates': {t.id: t.gate for t in selection},
                  'dimension_weights': context.dimension_weights, 'phase': context.phase,
                  'coherence': context.coherence, 'kernel': 'provisional-trigram-joint-v1'}
        key = sha256_bytes(canonical(record).encode())
        out = self._kernel(selection, context)
        if set(out) != {'relation', 'intensity', 'direction'}:
            raise AssertionError('Klein output contract violated')
        receipt = {'evaluation_hash': key, 'context': record, 'result': out,
                   'witnessed': True, 'possible_only': False}
        if key in self.ledger and self.ledger[key]['result'] != out:
            raise AssertionError('determinism violation')
        self.ledger[key] = receipt
        return out, receipt

    def evaluate_children(self, parent_id: str, context: Context) -> list[dict]:
        """Child evaluation needs child co-activation, never fabricates it."""
        parent = self.tools[parent_id]
        if len(parent.children) < 2:
            return []
        child_ids = tuple(c.id for c in parent.children)
        if not set(child_ids).issubset(context.active):
            raise ValueError('child tools must be explicitly co-active in context')
        combined = KleinEngine([*parent.children])
        return [combined.evaluate(context, child_ids)[1]]


def write_new(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('xb') as f:  # never destroy the source or an earlier artifact
        f.write(data)


def sidecar(output: Path, receipt: dict, modality: str, operation: dict, source: Path | None = None) -> Path:
    info = {'schema': 'synthia-klein-multimodal/v1', 'modality': modality,
            'operation': operation, 'output_sha256': hash_file(output),
            'source_sha256': hash_file(source) if source else None,
            'original_untouched': True, 'evaluation': receipt,
            'dimensional_lens': {'code': 'Design', 'image': 'Space', 'video': 'Movement'}[modality],
            'wh_fields': WHO_MAP}
    info_path = Path(str(output) + '.klein.json')
    write_new(info_path, (json.dumps(info, indent=2, sort_keys=True) + '\n').encode())
    return info_path


IDENT = re.compile(r'^[A-Za-z_][A-Za-z0-9_]*$')
ALLOWED_EXPR = (ast.Expression, ast.BinOp, ast.UnaryOp, ast.Name, ast.Constant,
                ast.Add, ast.Sub, ast.Mult, ast.Div, ast.FloorDiv, ast.Mod, ast.Pow,
                ast.USub, ast.UAdd, ast.Call, ast.Load)
ALLOWED_CALLS = {'abs', 'min', 'max', 'round'}


def safe_expression(expr: str, args: list[str]) -> ast.AST:
    tree = ast.parse(expr, mode='eval')
    for n in ast.walk(tree):
        if not isinstance(n, ALLOWED_EXPR):
            raise ValueError(f'code creation expression not in safe subset: {type(n).__name__}')
        if isinstance(n, ast.Name) and n.id not in set(args) | ALLOWED_CALLS:
            raise ValueError(f'undeclared variable: {n.id}')
        if isinstance(n, ast.Call) and (not isinstance(n.func, ast.Name) or n.func.id not in ALLOWED_CALLS or n.keywords):
            raise ValueError('only pure built-in calls allowed')
        if isinstance(n, ast.Constant) and not isinstance(n.value, (float, int)):
            raise ValueError('numeric constants only')
    return tree


def create_code(spec: dict, output: Path) -> None:
    name, args, expr = spec['name'], spec['args'], spec['expression']
    if not IDENT.fullmatch(name) or any(not IDENT.fullmatch(x) for x in args) or len(set(args)) != len(args):
        raise ValueError('invalid/duplicate Python identifiers')
    expression = safe_expression(expr, args)
    # Safe subset; user-specified code is data, not evaluated during creation.
    content = f'def {name}({", ".join(args)}):\n    """Generated from validated Klein code grammar."""\n    return {ast.unparse(expression.body)}\n'
    ast.parse(content)
    write_new(output, content.encode())


class RenameSymbol(ast.NodeTransformer):
    def __init__(self, before: str, after: str):
        self.before, self.after = before, after

    def visit_FunctionDef(self, node):
        if node.name == self.before:
            node.name = self.after
        return self.generic_visit(node)

    def visit_Name(self, node):
        if node.id == self.before:
            node.id = self.after
        return node


def transform_code(source: Path, output: Path, before: str, after: str) -> None:
    if not IDENT.fullmatch(before) or not IDENT.fullmatch(after):
        raise ValueError('invalid symbol identifier')
    tree = ast.parse(source.read_text())
    tree = RenameSymbol(before, after).visit(tree)
    ast.fix_missing_locations(tree)
    write_new(output, (ast.unparse(tree) + '\n').encode())


def draw_scene(scene: dict):
    from PIL import Image, ImageDraw, ImageFont
    width, height = scene.get('size', [640, 360])
    if not (16 <= width <= 4096 and 16 <= height <= 4096):
        raise ValueError('canvas outside supported size')
    img = Image.new('RGB', (width, height), scene.get('background', '#161b36'))
    d = ImageDraw.Draw(img)
    for item in scene.get('shapes', []):
        kind, coords = item['kind'], item['coords']
        fill = item.get('fill', '#b2a7ff')
        if kind == 'rectangle': d.rectangle(coords, fill=fill)
        elif kind == 'ellipse': d.ellipse(coords, fill=fill)
        elif kind == 'line': d.line(coords, fill=fill, width=item.get('width', 3))
        elif kind == 'text': d.text(coords, item['text'], fill=fill, font=ImageFont.load_default())
        else: raise ValueError('unsupported scene shape')
    return img


def create_image(scene: dict, output: Path) -> None:
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / 'canvas.png'
        draw_scene(scene).save(path)
        write_new(output, path.read_bytes())


def transform_image(source: Path, output: Path, ops: list[dict]) -> None:
    from PIL import Image, ImageEnhance, ImageOps
    with Image.open(source) as original:
        img = original.copy()
    for op in ops:
        action = op['action']
        if action == 'rotate': img = img.rotate(float(op['degrees']), expand=True)
        elif action == 'resize': img = img.resize((int(op['width']), int(op['height'])), Image.Resampling.LANCZOS)
        elif action == 'crop': img = img.crop(tuple(op['box']))
        elif action == 'brightness': img = ImageEnhance.Brightness(img).enhance(float(op['factor']))
        elif action == 'contrast': img = ImageEnhance.Contrast(img).enhance(float(op['factor']))
        elif action == 'grayscale': img = ImageOps.grayscale(img).convert('RGB')
        elif action == 'mirror': img = ImageOps.mirror(img)
        else: raise ValueError(f'unsupported image action: {action}')
    if output.suffix.lower() not in ('.png', '.jpg', '.jpeg', '.webp'):
        raise ValueError('supported image outputs: png/jpg/webp')
    with tempfile.TemporaryDirectory() as tmp:
        intermediate = Path(tmp) / ('image' + output.suffix)
        img.convert('RGB').save(intermediate)
        write_new(output, intermediate.read_bytes())


def _run_ffmpeg(args: list[str]) -> None:
    try:
        p = subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-nostdin', '-y', *args],
                           capture_output=True, text=True, timeout=90)
    except FileNotFoundError as exc:
        raise RuntimeError('ffmpeg required for MP4 creation/manipulation') from exc
    if p.returncode:
        raise RuntimeError('ffmpeg failed: ' + p.stderr[-900:])


def create_video(spec: dict, output: Path) -> None:
    """Render actual H.264 frames from a deterministic scene timeline (no AI provider)."""
    fps = int(spec.get('fps', 12)); duration = float(spec.get('seconds', 2))
    if not 1 <= fps <= 30 or not 0.1 <= duration <= 30:
        raise ValueError('fps or duration out of bounds')
    base = draw_scene(spec['scene'])
    from PIL import ImageDraw
    frames = max(1, round(duration * fps))
    with tempfile.TemporaryDirectory() as temp:
        temp = Path(temp)
        for n in range(frames):
            img = base.copy()
            # Time is the additional video quality. Position varies deterministically by frame.
            d = ImageDraw.Draw(img)
            t = n / max(frames - 1, 1)
            x = 20 + round((img.width - 60) * t)
            d.ellipse([x, img.height - 55, x + 30, img.height - 25], fill=spec.get('moving_color', '#89efdc'))
            img.save(temp / f'frame{n:05d}.png')
        intermediate = temp / 'render.mp4'
        _run_ffmpeg(['-framerate', str(fps), '-i', str(temp/'frame%05d.png'), '-c:v', 'libx264',
                    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(intermediate)])
        write_new(output, intermediate.read_bytes())


def transform_video(source: Path, output: Path, spec: dict) -> None:
    filters = []
    if 'scale' in spec:
        w, h = map(int, spec['scale'])
        if w < 16 or h < 16 or w > 4096 or h > 4096 or w % 2 or h % 2:
            raise ValueError('scale must be positive even dimensions within 4096')
        filters.append(f'scale={w}:{h}')
    if spec.get('grayscale'):
        filters.append('hue=s=0')
    if 'brightness' in spec:
        b = float(spec['brightness'])
        if not -1 <= b <= 1: raise ValueError('brightness -1..1')
        filters.append(f'eq=brightness={b}')
    if not filters and 'start' not in spec and 'seconds' not in spec:
        raise ValueError('nothing to transform')
    args = []
    if 'start' in spec:
        start = float(spec['start'])
        if start < 0: raise ValueError('start >= 0')
        args += ['-ss', str(start)]
    args += ['-i', str(source)]
    if 'seconds' in spec:
        duration = float(spec['seconds'])
        if not 0 < duration <= 300: raise ValueError('duration out of bounds')
        args += ['-t', str(duration)]
    if filters: args += ['-vf', ','.join(filters)]
    with tempfile.TemporaryDirectory() as tmp:
        intermediate = Path(tmp) / 'edited.mp4'
        args += ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', str(intermediate)]
        _run_ffmpeg(args)
        write_new(output, intermediate.read_bytes())


def run_job(job: dict) -> dict:
    """Common entry for all media: evaluate before executing, receipt after real output."""
    tools = [Tool(id=x['id'], gate=x['gate'], trigram=tuple(x['trigram'])) for x in job['tools']]
    c = job['context']
    context = Context(address=c['address'], active=tuple(c['active']),
                      dimension_weights=c['dimension_weights'], phase=c.get('phase', 0),
                      coherence=c.get('coherence', 1))
    engine = KleinEngine(tools)
    _, receipt = engine.evaluate(context)
    media, action, operation = job['modality'], job['action'], job['operation']
    output = Path(job['output']).expanduser().resolve()
    source = Path(job['source']).expanduser().resolve() if 'source' in job else None
    if output.exists() or Path(str(output) + '.klein.json').exists():
        raise FileExistsError('destination already exists; originals are never overwritten')
    if source and source == output:
        raise ValueError('source and output paths must differ')
    if media == 'code' and action == 'create': create_code(operation, output)
    elif media == 'code' and action == 'edit' and source: transform_code(source, output, operation['from'], operation['to'])
    elif media == 'image' and action == 'create': create_image(operation, output)
    elif media == 'image' and action == 'edit' and source: transform_image(source, output, operation['ops'])
    elif media == 'video' and action == 'create': create_video(operation, output)
    elif media == 'video' and action == 'edit' and source: transform_video(source, output, operation)
    else: raise ValueError('unsupported modality/action or missing edit source')
    manifest = sidecar(output, receipt, media, operation, source)
    return {'output': str(output), 'manifest': str(manifest), 'sha256': hash_file(output),
            'evaluation_hash': receipt['evaluation_hash'], 'core_result': receipt['result']}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Local, additive Synthia Klein multimodal adapter')
    parser.add_argument('job', type=Path, help='JSON job document')
    args = parser.parse_args()
    print(json.dumps(run_job(json.loads(args.job.read_text())), indent=2))

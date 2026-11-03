"""Verify the requested 45-degree projection using the existing Klein image tool.

This adds a test, not a replacement or another media engine.
"""
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from PIL import Image
from klein_modern import create_image, transform_image

def test_existing_image_adapter_rotates_45_degrees_without_overwriting(tmp_path: Path):
    original = tmp_path / "original.png"
    rotated = tmp_path / "rotated.png"
    create_image({"size": [100, 60], "shapes": [{"kind": "rectangle", "coords": [5, 5, 40, 30]}]}, original)
    before = original.read_bytes()
    transform_image(original, rotated, [{"action": "rotate", "degrees": 45}])
    assert original.read_bytes() == before
    assert rotated.exists()
    with Image.open(rotated) as result:
        assert result.width > 100
        assert result.height > 60

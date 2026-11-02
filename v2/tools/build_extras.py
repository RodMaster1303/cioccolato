import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFont
import potrace

ROOT = Path(__file__).resolve().parent.parent
REFS = ROOT / 'refs'
BRAND = ROOT / 'src' / 'assets' / 'brand'
MICHIS = ROOT / 'src' / 'assets' / 'michis'
PUBLIC = ROOT / 'public'
CACAO = (20, 10, 15)
REAL = {'mandarino': (210, 500, 1010, 1300), 'pivi': (60, 40, 480, 460), 'zombie': (260, 330, 1060, 1130)}


def trace_paths(gray, threshold, scale=4):
    big = gray.resize((gray.width * scale, gray.height * scale), Image.LANCZOS)
    bitmap = potrace.Bitmap(np.asarray(big) <= threshold)
    curves = bitmap.trace(turdsize=30, alphamax=1.0, opticurve=True, opttolerance=0.3)
    parts = []
    for curve in curves:
        ys = [curve.start_point.y] + [seg.end_point.y for seg in curve.segments]
        if min(ys) < 4 and max(ys) - min(ys) < 24:
            continue
        start = curve.start_point
        d = [f'M{start.x:.1f} {start.y:.1f}']
        for seg in curve.segments:
            end = seg.end_point
            if seg.is_corner:
                d.append(f'L{seg.c.x:.1f} {seg.c.y:.1f}L{end.x:.1f} {end.y:.1f}')
            else:
                d.append(f'C{seg.c1.x:.1f} {seg.c1.y:.1f} {seg.c2.x:.1f} {seg.c2.y:.1f} {end.x:.1f} {end.y:.1f}')
        d.append('Z')
        parts.append(''.join(d))
    return ''.join(parts), big.size


def build_wordmark():
    logo = Image.open(ROOT / 'cioccolato.jpeg').convert('L')
    script = logo.crop((150, 515, 590, 612))
    sub = logo.crop((240, 614, 500, 658))
    d_script, size_script = trace_paths(script, 150)
    d_sub, size_sub = trace_paths(sub, 130)
    svg_script = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size_script[0]} {size_script[1]}" fill="currentColor" fill-rule="evenodd" aria-hidden="true"><path d="{d_script}"/></svg>'
    svg_sub = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size_sub[0]} {size_sub[1]}" fill="currentColor" fill-rule="evenodd" aria-hidden="true"><path d="{d_sub}"/></svg>'
    (BRAND / 'wordmark-script.svg').write_text(svg_script, encoding='utf-8')
    (BRAND / 'wordmark-sub.svg').write_text(svg_sub, encoding='utf-8')
    return {'script': size_script, 'sub': size_sub, 'script_bytes': len(svg_script), 'sub_bytes': len(svg_sub)}


def build_marks():
    sprite = Image.open(MICHIS / 'pivi-sit.webp').convert('RGBA')
    a = np.asarray(sprite)[:, :, 3]
    ys, xs = np.where(a > 200)
    x0, x1, y0 = xs.min(), xs.max(), ys.min()
    w = x1 - x0
    head = sprite.crop((x0 - 4, y0 - 4, x1 + 4, y0 + int(w * 0.92)))
    side = max(head.size)
    square = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    square.paste(head, ((side - head.width) // 2, (side - head.height) // 2), head)
    square.resize((256, 256), Image.LANCZOS).save(BRAND / 'pivi-mark.webp', 'WEBP', quality=90, method=6)
    for size, name in ((64, 'favicon.png'), (180, 'apple-touch-icon.png')):
        base = Image.new('RGBA', (size, size), CACAO + (255,))
        inner = square.resize((int(size * 0.86), int(size * 0.86)), Image.LANCZOS)
        base.paste(inner, ((size - inner.width) // 2, int(size * 0.1)), inner)
        PUBLIC.mkdir(exist_ok=True)
        base.convert('RGB').save(PUBLIC / name, optimize=True)
    return {'mark': square.size}


def build_og():
    canvas = Image.new('RGB', (1200, 630), CACAO)
    glow = Image.new('RGB', (1200, 630), (0, 0, 0))
    draw = ImageDraw.Draw(glow)
    draw.ellipse((-120, 30, 760, 700), fill=(60, 18, 40))
    glow = glow.filter(__import__('PIL.ImageFilter', fromlist=['GaussianBlur']).GaussianBlur(120))
    canvas = ImageChops.screen(canvas, glow)
    trio = Image.open(BRAND / 'trio-completo.webp').convert('RGB')
    trio = trio.resize((int(trio.width * 590 / trio.height), 590), Image.LANCZOS)
    canvas = ImageChops.screen(canvas, _on_black(trio, (30, 20), canvas.size))
    logo = Image.open(ROOT / 'cioccolato.jpeg').convert('RGB')
    word = logo.crop((150, 526, 590, 660))
    fade = np.ones((word.height, word.width), dtype=np.float32)
    fade[:14] = np.linspace(0, 1, 14)[:, None]
    arr = np.asarray(word).astype(np.float32)
    arr[arr.max(axis=2) < 70] = 0
    word = Image.fromarray((arr * fade[:, :, None]).astype(np.uint8))
    word = word.resize((520, int(word.height * 520 / word.width)), Image.LANCZOS)
    canvas = ImageChops.screen(canvas, _on_black(word, (650, 225), canvas.size))
    draw = ImageDraw.Draw(canvas)
    try:
        font = ImageFont.truetype('C:/Windows/Fonts/georgia.ttf', 30)
    except OSError:
        font = ImageFont.load_default()
    draw.text((640, 410), 'Pastelería y catering', font=font, fill=(251, 230, 199))
    draw.text((640, 452), 'La Paz y El Alto', font=font, fill=(241, 85, 145))
    PUBLIC.mkdir(exist_ok=True)
    canvas.save(PUBLIC / 'og.jpg', quality=88, optimize=True)
    return {'og': canvas.size}


def _on_black(image, pos, size):
    layer = Image.new('RGB', size, (0, 0, 0))
    layer.paste(image, pos)
    return layer


def build_real_photos():
    target = REFS / 'fotos-reales'
    out = {}
    for name, box in REAL.items():
        source = target / f'{name}-real.png'
        crop = Image.open(source).convert('RGB').crop(box).resize((560, 560), Image.LANCZOS)
        crop.save(MICHIS / f'real-{name}.jpg', quality=88, optimize=True)
        out[name] = Image.open(source).size
    return out


STEPS = {'wordmark': build_wordmark, 'marks': build_marks, 'og': build_og, 'real': build_real_photos}

if __name__ == '__main__':
    chosen = sys.argv[1:] or list(STEPS)
    print(json.dumps({step: STEPS[step]() for step in chosen}, indent=1))

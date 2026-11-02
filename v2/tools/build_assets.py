import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

sys.path.insert(0, str(Path(__file__).resolve().parent))
from cutout import (alpha_mask, bake_glow, cut_sprites, dominant_color, load_rgb, order_grid, soft_alpha, trim_ledge)

ROOT = Path(__file__).resolve().parent.parent
REFS = ROOT / 'refs'
MICHIS = ROOT / 'src' / 'assets' / 'michis'
BRAND = ROOT / 'src' / 'assets' / 'brand'

GLOW = {'pivi': (241, 85, 145), 'mandarino': (238, 124, 62), 'zombie': (247, 140, 120)}
EXPRESSIONS = ['sit', 'blink', 'look-left', 'look-right', 'look-up', 'meow']
ACTIONS = ['crouch', 'pounce', 'swipe', 'peek', 'sleep', 'walk']
SHEETS = [
    ('p05-pivi-expresiones.jpg', 'pivi', EXPRESSIONS),
    ('p06-pivi-acciones.jpg', 'pivi', ACTIONS),
    ('p07-mandarino-expresiones.jpg', 'mandarino', EXPRESSIONS),
    ('p08-mandarino-acciones.jpg', 'mandarino', ACTIONS),
    ('p09-zombie-expresiones.jpg', 'zombie', EXPRESSIONS),
    ('p10-zombie-acciones.jpg', 'zombie', ACTIONS),
]
PROPS = ['yarn-pink', 'yarn-cyan', 'yarn-orange', 'cupcake-pink', 'cupcake-yellow', 'cupcake-green',
         'macaron-blue', 'macaron-pink', 'croissant', 'donut', 'cake-rainbow', 'cake-strawberry']


def save_webp(image, path, quality=88):
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, 'WEBP', quality=quality, method=6, alpha_quality=80)


def build_michis():
    report = {}
    for filename, michi, poses in SHEETS:
        rgb = load_rgb(REFS / filename)
        sprites = cut_sprites(rgb)
        if len(sprites) != len(poses):
            raise SystemExit(f'{filename}: se esperaban {len(poses)} poses y salieron {len(sprites)}')
        for sprite, pose in zip(order_grid(sprites, 2, 3, rgb.shape[0], rgb.shape[1]), poses):
            image = trim_ledge(sprite['image']) if pose == 'peek' else sprite['image']
            baked = bake_glow(image, GLOW[michi])
            save_webp(baked, MICHIS / f'{michi}-{pose}.webp')
            report[f'{michi}-{pose}'] = list(baked.size)
    return report


def build_props():
    rgb = load_rgb(REFS / 'p11-objetos-lana-y-postres.jpg')
    sprites = cut_sprites(rgb, group=20, min_area=3000, threshold=170, close=4)
    if len(sprites) != len(PROPS):
        raise SystemExit(f'p11: se esperaban {len(PROPS)} objetos y salieron {len(sprites)}')
    report = {}
    for sprite, name in zip(order_grid(sprites, 3, 4, rgb.shape[0], rgb.shape[1]), PROPS):
        baked = bake_glow(sprite['image'], dominant_color(sprite['image']), max_side=420, pad=34, sigma=11, strength=0.85)
        save_webp(baked, MICHIS / f'obj-{name}.webp')
        report[f'obj-{name}'] = list(baked.size)
    return report


def build_trio():
    with_sweets = load_rgb(REFS / 'p03-trio-con-postres.png')
    cats = load_rgb(REFS / 'p04-trio-sin-postres.png')
    mask = alpha_mask(cats)
    alpha = soft_alpha(mask)
    content = ndi.binary_dilation(with_sweets.max(axis=2) > 24, iterations=6)
    ys, xs = np.where(content)
    box = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)
    rgba = np.dstack([cats, (alpha * 255).astype(np.uint8)])
    cats_img = Image.fromarray(rgba, 'RGBA').crop(box)
    near = ndi.binary_dilation(mask, iterations=5)
    sweets = with_sweets.copy()
    sweets[near] = 0
    peak = sweets.max(axis=2).astype(np.float32)
    color = np.where(peak[:, :, None] > 14, sweets.astype(np.float32) * (255.0 / np.maximum(peak, 1)[:, :, None]), 0)
    sweets_img = Image.fromarray(np.dstack([np.clip(color, 0, 255), peak]).astype(np.uint8), 'RGBA').crop(box)
    width = 1600
    height = round(cats_img.height * width / cats_img.width)
    save_webp(cats_img.resize((width, height), Image.LANCZOS), BRAND / 'trio-gatos.webp', 90)
    save_webp(sweets_img.resize((width, height), Image.LANCZOS), BRAND / 'trio-postres.webp', 86)
    save_webp(Image.fromarray(with_sweets, 'RGB').crop(box).resize((width, height), Image.LANCZOS), BRAND / 'trio-completo.webp', 88)
    pieces = []
    for name, region in (('mandarino', (slice(None), slice(0, cats.shape[1] // 2))), ('zombie', (slice(None), slice(cats.shape[1] // 2, None)))):
        sub = cats[region]
        r, g, b = sub[:, :, 0].astype(int), sub[:, :, 1].astype(int), sub[:, :, 2].astype(int)
        mx, mn = sub.max(axis=2).astype(int), sub.min(axis=2).astype(int)
        sat = (mx - mn) / np.maximum(mx, 1)
        if name == 'mandarino':
            sel = (sat > 0.22) & (mx > 150) & (r > g) & (g > b) & mask[region]
        else:
            sel = (mx < 110) & mask[region]
        yy, xx = np.where(sel)
        offset = region[1].start or 0
        pieces.append((name, int(np.percentile(xx, 1)) + offset, int(np.percentile(yy, 1)), int(np.percentile(xx, 99)) + offset, int(np.percentile(yy, 99))))
    return {'box': box, 'size': [width, height], 'bboxes': pieces}


STEPS = {'michis': build_michis, 'props': build_props, 'trio': build_trio}


def main():
    chosen = sys.argv[1:] or list(STEPS)
    report = {step: STEPS[step]() for step in chosen}
    for step, value in report.items():
        print(step, len(value) if isinstance(value, dict) else value)


if __name__ == '__main__':
    main()

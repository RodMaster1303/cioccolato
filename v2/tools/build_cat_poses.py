from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'src' / 'assets' / 'michis'
TARGET = ROOT / 'src' / 'assets' / 'cats'
CATS = ('pivi', 'mandarino', 'zombie')
POSES = ('sit', 'blink', 'look-left', 'look-right', 'look-up', 'meow', 'sleep', 'swipe', 'crouch', 'pounce')
CANVAS = 808
BODY_FRACTION = 0.35


def body_center(image):
    alpha = np.asarray(image)[:, :, 3]
    ys, xs = np.where(alpha > 20)
    top, bottom = ys.min(), ys.max()
    band = ys >= bottom - (bottom - top) * BODY_FRACTION
    return float(xs[band].mean())


def normalize(path):
    image = Image.open(path).convert('RGBA')
    width, height = image.size
    if width >= CANVAS - 2:
        x = (CANVAS - width) // 2
    else:
        x = max(0, min(round(CANVAS / 2 - body_center(image)), CANVAS - width))
    canvas = Image.new('RGBA', (CANVAS, CANVAS), (0, 0, 0, 0))
    canvas.paste(image, (x, CANVAS - height))
    return canvas


def main():
    TARGET.mkdir(parents=True, exist_ok=True)
    count = 0
    for cat in CATS:
        for pose in POSES:
            name = f'{cat}-{pose}'
            normalize(SOURCE / f'{name}.webp').save(TARGET / f'{name}.webp', 'WEBP', quality=90, method=6)
            count += 1
    print(count, 'poses ->', TARGET)


if __name__ == '__main__':
    main()

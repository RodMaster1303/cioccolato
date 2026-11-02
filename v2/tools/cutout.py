import numpy as np
from PIL import Image
from scipy import ndimage as ndi


def load_rgb(path):
    return np.asarray(Image.open(path).convert('RGB'))


def alpha_mask(rgb, threshold=180, close=2):
    lum = rgb.max(axis=2)
    barrier = ndi.binary_dilation(lum > threshold, iterations=close)
    labels, _ = ndi.label(~barrier)
    border = np.concatenate([labels[0, :], labels[-1, :], labels[:, 0], labels[:, -1]])
    outside = np.isin(labels, np.unique(border[border > 0]))
    mask = ndi.binary_erosion(~outside, iterations=close)
    return mask


def soft_alpha(mask, sigma=0.9):
    return ndi.gaussian_filter(mask.astype(np.float32), sigma)


def cut_sprites(rgb, group=28, min_area=4000, threshold=180, close=2):
    mask = alpha_mask(rgb, threshold=threshold, close=close)
    alpha = soft_alpha(mask)
    grouped = ndi.binary_dilation(mask, iterations=group)
    labels, _ = ndi.label(grouped, structure=np.ones((3, 3)))
    sprites = []
    for index, box in enumerate(ndi.find_objects(labels), start=1):
        region = (labels[box] == index) & ndi.binary_dilation(mask[box], iterations=group)
        a = alpha[box] * region
        if (a > 0.5).sum() < min_area:
            continue
        rgba = np.dstack([rgb[box], (np.clip(a, 0, 1) * 255).astype(np.uint8)])
        cy = (box[0].start + box[0].stop) / 2
        cx = (box[1].start + box[1].stop) / 2
        sprites.append({'image': Image.fromarray(rgba, 'RGBA'), 'cx': cx, 'cy': cy, 'box': box})
    return sprites


def order_grid(sprites, rows, cols, height, width):
    def cell(s):
        return (min(int(s['cy'] / (height / rows)), rows - 1), min(int(s['cx'] / (width / cols)), cols - 1))

    return sorted(sprites, key=lambda s: (cell(s)[0], s['cx']))


def bake_glow(image, color, max_side=720, pad=44, sigma=15, strength=0.8):
    scale = max_side / max(image.size)
    if scale < 1:
        image = image.resize((max(1, round(image.width * scale)), max(1, round(image.height * scale))), Image.LANCZOS)
    arr = np.asarray(image).astype(np.float32) / 255.0
    h, w = arr.shape[:2]
    canvas = np.zeros((h + 2 * pad, w + 2 * pad, 4), dtype=np.float32)
    canvas[pad:pad + h, pad:pad + w] = arr
    a = canvas[:, :, 3]
    g = np.clip(ndi.gaussian_filter(a, sigma) * strength, 0, 1)
    out_a = a + g * (1 - a)
    glow = np.array(color, dtype=np.float32) / 255.0
    num = canvas[:, :, :3] * a[:, :, None] + glow[None, None, :] * (g * (1 - a))[:, :, None]
    rgb = np.where(out_a[:, :, None] > 1e-4, num / np.maximum(out_a[:, :, None], 1e-4), 0)
    out = np.dstack([np.clip(rgb, 0, 1), np.clip(out_a, 0, 1)])
    return Image.fromarray((out * 255).astype(np.uint8), 'RGBA')


def trim_ledge(image):
    a = np.asarray(image)[:, :, 3]
    h = a.shape[0]
    band = a[int(h * 0.35):int(h * 0.65)] > 128
    cols = np.where(band.any(axis=0))[0]
    if cols.size == 0:
        return image
    left, right = max(cols.min() - 8, 0), min(cols.max() + 8, image.width)
    return image.crop((left, 0, right, image.height))


def dominant_color(image):
    arr = np.asarray(image).astype(np.float32)
    rgb, a = arr[:, :, :3], arr[:, :, 3] / 255.0
    mx, mn = rgb.max(axis=2), rgb.min(axis=2)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0)
    weight = a * sat * sat
    if weight.sum() < 1:
        return (255, 255, 255)
    mean = (rgb * weight[:, :, None]).sum(axis=(0, 1)) / weight.sum()
    peak = mean.max()
    return tuple(int(min(255, c * 255 / peak)) for c in mean) if peak > 0 else (255, 255, 255)

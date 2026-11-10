import argparse

import numpy as np
from PIL import Image


SCREEN = 'green'


def key(im):
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    if SCREEN == 'magenta':
        d = np.minimum(r, b) - g
        al = np.clip(1 - (d - 25) / 70, 0, 1)
        return Image.fromarray(np.dstack([r, g, b, al * 255]).astype(np.uint8), 'RGBA')
    d = g - np.maximum(r, b)
    al = np.clip(1 - (d - 25) / 70, 0, 1)
    g2 = np.minimum(g, np.maximum(r, b) + 8)
    return Image.fromarray(np.dstack([r, g2, b, al * 255]).astype(np.uint8), 'RGBA')


def solid(c):
    return c.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox()


def strip(src, out, size, grid=5, nearest=False, pad=6):
    im = key(Image.open(src))
    W, H = im.size
    cw, ch = W / grid, H / grid
    cells = [im.crop((round(c * cw), round(r * ch), round((c + 1) * cw), round((r + 1) * ch))) for r in range(grid) for c in range(grid)]
    mw = min(c.size[0] for c in cells)
    mh = min(c.size[1] for c in cells)
    cells = [c.crop((0, 0, mw, mh)) for c in cells]
    bb = None
    for c in cells:
        x = solid(c)
        if x:
            bb = x if bb is None else (min(bb[0], x[0]), min(bb[1], x[1]), max(bb[2], x[2]), max(bb[3], x[3]))
    bb = (max(0, bb[0] - pad), max(0, bb[1] - pad), min(mw, bb[2] + pad), min(mh, bb[3] + pad))
    cells = [c.crop(bb) for c in cells]
    w, h = cells[0].size
    s = size / max(w, h)
    nw, nh = max(1, round(w * s)), max(1, round(h * s))
    rs = Image.NEAREST if nearest else Image.LANCZOS
    st = Image.new('RGBA', (nw * len(cells), nh), (0, 0, 0, 0))
    for i, c in enumerate(cells):
        st.paste(c.resize((nw, nh), rs), (i * nw, 0))
    st.save(out, 'WEBP', quality=82, method=6, lossless=nearest)
    print(out, st.size, 'frame', (nw, nh), 'frames', len(cells))


def cutout(src, out, maxside):
    im = key(Image.open(src))
    im = im.crop(solid(im))
    im.thumbnail((maxside, maxside), Image.LANCZOS)
    im.save(out, 'WEBP', quality=82)
    print(out, im.size)


def dye(src, out, color):
    a = np.asarray(Image.open(src).convert('RGBA')).astype(np.float32)
    c = a[..., :3] / 255
    al = a[..., 3] / 255
    col = np.array([int(color[i:i + 2], 16) for i in (1, 3, 5)], dtype=np.float32) / 255
    paper = np.array([0xF9, 0xF4, 0xE8], dtype=np.float32) / 255
    luma = 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]
    o = np.clip((c.max(2) - c.min(2) - 0.14) / 0.24, 0, 1)
    body = luma[(o > 0.9) & (al > 0.9)]
    mid = np.median(body)
    span = np.percentile(body, 97) - np.percentile(body, 3)
    t = np.clip(0.5 + (luma - mid) / (span * 1.05), 0, 1)[..., None]
    dark = col * 0.5
    light = col * 0.58 + paper * 0.42
    painted = np.where(t < 0.5, dark + (col - dark) * (t / 0.5), col + (light - col) * ((t - 0.5) / 0.5))
    ink = np.array([0x21, 0x1C, 0x1C], dtype=np.float32) / 255 + (luma[..., None] - 0.11) * 0.9
    rest = np.where((luma > 0.55)[..., None], c, np.clip(ink, 0, 1))
    res = painted * o[..., None] + rest * (1 - o[..., None])
    im = Image.fromarray(np.dstack([np.clip(res, 0, 1) * 255, a[..., 3]]).astype(np.uint8), 'RGBA')
    im.save(out, 'WEBP', quality=93, method=6, alpha_quality=92)
    print(out, im.size, color)


PAPER = np.array([0xF9, 0xF4, 0xE8], dtype=np.float32) / 255
INK = np.array([0x21, 0x1C, 0x1C], dtype=np.float32) / 255


def rgb(color):
    return np.array([int(color[i:i + 2], 16) for i in (1, 3, 5)], dtype=np.float32) / 255


def layers(src, prefix, hue):
    from scipy import ndimage as ndi
    a = np.asarray(Image.open(src).convert('RGBA')).astype(np.float32) / 255
    c, al = a[..., :3], a[..., 3]
    hsv = np.asarray(Image.fromarray((c * 255).astype(np.uint8), 'RGB').convert('HSV')).astype(np.float32)
    h, s = hsv[..., 0] * 360 / 255, hsv[..., 1] / 255
    luma = 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]
    inhue = (h > hue[0]) & (h < hue[1]) if hue[0] < hue[1] else (h > hue[0]) | (h < hue[1])
    core = ndi.binary_opening(inhue & (s > 0.22) & (al > 0.05))
    if core.sum() < 50:
        raise SystemExit('no main colour found in hue range %s' % (hue,))
    closed = ndi.binary_fill_holes(ndi.binary_closing(core, iterations=3))
    dark = ~inhue & (luma < 0.22) & (s > 0.05) & ~core
    m = closed & ~dark & (al > 0.02)
    m = np.clip(ndi.gaussian_filter(m.astype(np.float32), 0.8) * 1.6 - 0.3, 0, 1)
    body = luma[(m > 0.9) & (al > 0.9)]
    mid = np.median(body)
    span = max(np.percentile(body, 97) - np.percentile(body, 3), 0.06)
    t = np.clip(0.5 + (luma - mid) / (span * 1.05), 0, 1)
    g = np.where(t < 0.5, 0.25 + 0.5 * t, 0.5 + 0.42 * (t - 0.5))
    ink = np.where((luma > 0.55)[..., None], c, np.clip(INK + (luma[..., None] - 0.11) * 0.9, 0, 1))
    ia = al * (1 - m * m)
    ra = al * (1 - (1 - m) ** 2)
    Image.fromarray(np.dstack([ink * 255, ia * 255]).astype(np.uint8), 'RGBA').save(prefix + '_ink.webp', 'WEBP', quality=86, method=6, alpha_quality=92)
    Image.fromarray(np.dstack([g * 255, g * 255, g * 255, ra * 255]).astype(np.uint8), 'RGBA').save(prefix + '_relief.webp', 'WEBP', quality=86, method=6, alpha_quality=92)
    print(prefix + '_ink.webp', prefix + '_relief.webp', a.shape[1], a.shape[0], 'main pixels', int((m > 0.5).sum()))


def tint(prefix, out, color):
    i = np.asarray(Image.open(prefix + '_ink.webp').convert('RGBA')).astype(np.float32) / 255
    r = np.asarray(Image.open(prefix + '_relief.webp').convert('RGBA')).astype(np.float32) / 255
    col = rgb(color)
    g = r[..., :1]
    paint = np.where(g <= 0.5, col * 2 * g, 1 - (1 - col) * (1 - (2 * g - 1)))
    ia, ra = i[..., 3:], r[..., 3:]
    al = ia + ra * (1 - ia)
    res = (i[..., :3] * ia + paint * ra * (1 - ia)) / np.maximum(al, 1e-6)
    im = Image.fromarray(np.dstack([np.clip(res, 0, 1) * 255, al * 255]).astype(np.uint8), 'RGBA')
    im.save(out, 'WEBP', quality=93, method=6, alpha_quality=92)
    print(out, im.size, color)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('mode', choices=['strip', 'cutout', 'dye', 'layers', 'tint'])
    ap.add_argument('src')
    ap.add_argument('out')
    ap.add_argument('--size', type=int, default=160)
    ap.add_argument('--grid', type=int, default=5)
    ap.add_argument('--pixel', action='store_true')
    ap.add_argument('--screen', choices=['green', 'magenta'], default='green')
    ap.add_argument('--color')
    ap.add_argument('--hue', type=float, nargs=2, default=[238, 318])
    a = ap.parse_args()
    SCREEN = a.screen
    if a.mode == 'strip':
        strip(a.src, a.out, a.size, a.grid, a.pixel)
    elif a.mode == 'dye':
        dye(a.src, a.out, a.color)
    elif a.mode == 'layers':
        layers(a.src, a.out, a.hue)
    elif a.mode == 'tint':
        tint(a.src, a.out, a.color)
    else:
        cutout(a.src, a.out, a.size)

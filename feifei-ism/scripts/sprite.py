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


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('mode', choices=['strip', 'cutout', 'dye'])
    ap.add_argument('src')
    ap.add_argument('out')
    ap.add_argument('--size', type=int, default=160)
    ap.add_argument('--grid', type=int, default=5)
    ap.add_argument('--pixel', action='store_true')
    ap.add_argument('--screen', choices=['green', 'magenta'], default='green')
    ap.add_argument('--color')
    a = ap.parse_args()
    SCREEN = a.screen
    if a.mode == 'strip':
        strip(a.src, a.out, a.size, a.grid, a.pixel)
    elif a.mode == 'dye':
        dye(a.src, a.out, a.color)
    else:
        cutout(a.src, a.out, a.size)

import os
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

R = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "paper")
PAPER = np.array([0xF9, 0xF4, 0xE8], dtype=float) / 255
rng = np.random.default_rng(1102)
TINT = np.array([0.62, 0.95, 1.7])


def low(n, s):
    z = gaussian_filter(rng.standard_normal((n, n)), s, mode="wrap")
    return z / z.std()


def band(n, a, b):
    w = rng.standard_normal((n, n))
    z = gaussian_filter(w, a, mode="wrap") - gaussian_filter(w, b, mode="wrap")
    return z / z.std()


def to_webp(d, path, q, tint=TINT, lossless=False):
    d = np.clip(d, 0, 1)
    rgb = 1 - d[..., None] * tint
    img = Image.fromarray((np.clip(rgb, 0, 1) * 255 + 0.5).astype(np.uint8))
    img.save(path, "WEBP", quality=q, method=6, lossless=lossless)
    return os.path.getsize(path)


def cloud(n=256):
    mid = band(n, 3.5, 10)
    big = low(n, 20)
    d = 0.0075 + 0.0032 * mid + 0.0034 * big
    return np.clip(d, 0.001, 0.018)


def strands(n, count, lmin, lmax, wmin, wmax, field=None):
    xs, ys, ws = [], [], []
    made = 0
    while made < count:
        x, y = rng.uniform(0, n, 2)
        if field is not None and rng.uniform() > field[int(y) % n, int(x) % n]:
            continue
        length = np.clip(rng.lognormal(np.log((lmin + lmax) / 3), 0.6), lmin, lmax)
        steps = max(4, int(length / 0.7))
        turn = gaussian_filter(rng.standard_normal(steps), 9, mode="nearest")
        turn = turn / (turn.std() + 1e-6) * rng.uniform(0.003, 0.016)
        angle = rng.uniform(0, 2 * np.pi) + np.cumsum(turn)
        px = x + np.cumsum(np.cos(angle)) * 0.7
        py = y + np.cumsum(np.sin(angle)) * 0.7
        t = np.linspace(0, 1, steps)
        taper = np.sin(np.pi * t) ** 0.6
        beads = 0.72 + 0.28 * gaussian_filter(rng.standard_normal(steps), 6, mode="nearest") * 3
        xs.append(px)
        ys.append(py)
        ws.append(rng.uniform(wmin, wmax) * taper * np.clip(beads, 0.25, 1.3))
        made += 1
    return np.concatenate(xs), np.concatenate(ys), np.concatenate(ws)


def splat(n, x, y, w, s):
    a = np.zeros((n, n))
    x0 = np.floor(x).astype(int)
    y0 = np.floor(y).astype(int)
    fx = x - x0
    fy = y - y0
    for dx, dy, k in (
        (0, 0, (1 - fx) * (1 - fy)),
        (1, 0, fx * (1 - fy)),
        (0, 1, (1 - fx) * fy),
        (1, 1, fx * fy),
    ):
        np.add.at(a, ((y0 + dy) % n, (x0 + dx) % n), w * k)
    return gaussian_filter(a, s, mode="wrap")


def fiber(n=1536):
    yy, xx = np.mgrid[0:n, 0:n].astype(float)
    wob = low(n, 70)
    laid = np.cos(2 * np.pi * (yy + 1.6 * wob) / 8) * (0.62 + 0.3 * low(n, 44))
    dx = (xx + 3.0 * low(n, 90)) % 256
    dx = np.minimum(dx, 256 - dx)
    chain = np.exp(-(dx**2) / (2 * 1.2**2))
    floc = np.clip(0.42 + 0.3 * low(n, 26), 0.06, 1)
    long_dark = splat(n, *strands(n, 150, 120, 1100, 0.14, 0.3), 0.62)
    long_thin = splat(n, *strands(n, 340, 50, 420, 0.07, 0.17), 0.48)
    fuzz = splat(n, *strands(n, 4200, 6, 34, 0.05, 0.14, floc), 0.48)
    light = splat(n, *strands(n, 260, 60, 620, 0.1, 0.22), 0.62)
    d = (
        0.0052
        + 0.0013 * band(n, 0.7, 2.4)
        + 0.002 * band(n, 6, 16)
        + 0.0024 * laid
        + 0.0036 * chain
        + 0.27 * long_dark
        + 0.27 * long_thin
        + 0.3 * fuzz
        - 0.3 * light
    )
    return np.clip(d, 0, 0.07)


c = cloud()
f = fiber()
print("cloud", to_webp(c, os.path.join(R, "xuan_cloud.webp"), 100, TINT, True), "bytes")
print("fiber", to_webp(f, os.path.join(R, "xuan_fiber.webp"), 80, np.ones(3)), "bytes")
W, H = 2560, 1440
big = np.array(Image.open(os.path.join(R, "xuan_cloud.webp")).convert("RGB").resize((2362, 2362), Image.BICUBIC)).astype(float) / 255
fib = np.array(Image.open(os.path.join(R, "xuan_fiber.webp")).convert("RGB")).astype(float) / 255
ys, xs = np.mgrid[0:H, 0:W]
sheet = PAPER * big[ys % 2362, xs % 2362] * fib[ys % 1536, xs % 1536]
Image.fromarray((sheet * 255 + 0.5).astype(np.uint8)).save(os.path.join(R, "xuan_sheet.webp"), "WEBP", quality=84, method=6)
print("sheet", os.path.getsize(os.path.join(R, "xuan_sheet.webp")), "bytes", "mean", np.round(sheet.reshape(-1, 3).mean(0) * 255, 1))

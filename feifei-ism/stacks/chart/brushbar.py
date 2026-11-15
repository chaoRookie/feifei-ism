import numpy as np
from PIL import Image
from matplotlib import font_manager
import matplotlib.pyplot as plt

from gen_style import FONTS, ISM, STYLE, fams, pt, px, tokens

T = tokens()
_TEX = []


def use():
    for f in sorted(FONTS.glob('*.ttf')):
        font_manager.fontManager.addfont(str(f))
    plt.style.use(str(STYLE))


def family(key, *more):
    out = fams(T[key])[:1]
    for k in more:
        out += fams(T[k])[:1]
    return out


def rgb(hexv):
    h = hexv.lstrip('#')
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.float32) / 255


def textures():
    if not _TEX:
        for p in sorted((ISM / 'assets/strokes').glob('st*.webp')):
            a = np.asarray(Image.open(p).convert('RGBA')).astype(np.float32) / 255
            ys, xs = np.nonzero(a[..., 3] > 0.04)
            _TEX.append(a[ys.min():ys.max() + 1, xs.min():xs.max() + 1])
    return _TEX


def paint(tex, color):
    g = tex[..., :3].mean(axis=2, keepdims=True)
    col = rgb(color)
    out = np.where(g <= 0.5, col * 2 * g, 1 - (1 - col) * (1 - (2 * g - 1)))
    return np.dstack([np.clip(out, 0, 1), tex[..., 3:]])


def fit(tex, aspect):
    h, w = tex.shape[:2]
    if aspect >= w / h:
        return tex
    keep = max(4, int(round(h * aspect)))
    ov = max(1, min(keep // 2, h // 2))
    left = (keep + ov) // 2
    right = keep + ov - left
    a, b = tex[:, :left], tex[:, w - right:]
    ramp = np.linspace(1, 0, ov, dtype=np.float32)[None, :, None]
    mid = a[:, left - ov:] * ramp + b[:, :ov] * (1 - ramp)
    return np.concatenate([a[:, :left - ov], mid, b[:, ov:]], axis=1)


def core(tex):
    cov = tex[..., 3].mean(axis=0)
    xs = np.nonzero(cov >= cov.max() * 0.5)[0]
    return xs[0], xs[-1] + 1


def pull(ax, labels, values, *, fmt='{:,}', strokes=True, seed=0, height=0.62, headroom=0.16):
    values = [float(v) for v in values]
    if any(v < 0 for v in values):
        raise ValueError('拉笔条从零开始，只接受非负数')
    n = len(values)
    ys = np.arange(n)[::-1].astype(float)
    vmax = max(values) or 1.0
    hi = int(np.argmax(values))
    xlim, ylim = (0, vmax * (1 + headroom)), (-0.5, n - 0.5)
    ax.set_xlim(*xlim)
    ax.set_ylim(*ylim)
    for s in ax.spines.values():
        s.set_visible(False)
    ax.set_xticks([])
    ax.set_yticks(ys, labels, family=family('FB'), color=T['Ink2'], size=pt(T['FsBody']))
    ax.tick_params(axis='y', length=0, pad=px(T['FsBody']) * 0.75)
    box = ax.get_window_extent()
    xpu = box.width / (xlim[1] - xlim[0])
    ypu = box.height / (ylim[1] - ylim[0])
    tex = textures() if strokes else []
    for i, (v, y) in enumerate(zip(values, ys)):
        color = T['C'] if i == hi else T['Ink']
        end = v
        if v > 0 and tex:
            src = tex[(seed + i) % len(tex)]
            f = fit(src, (v * xpu) / (height * ypu))
            c0, c1 = core(f)
            k = v / (c1 - c0)
            ax.imshow(paint(f, color), extent=(-c0 * k, (f.shape[1] - c0) * k, y - height / 2, y + height / 2), aspect='auto', interpolation='bilinear', zorder=2, clip_on=False)
            end = max(v, (f.shape[1] - c0) * k)
        elif v > 0:
            ax.barh(y, v, height=height, color=color, linewidth=0, zorder=2)
        ax.text(end + vmax * 0.012, y, fmt.format(int(v) if v.is_integer() else v), va='center', ha='left', family=family('FM'), color=T['Ink'], size=pt(T['FsBody']), zorder=3)
    ax.set_xlim(*xlim)
    ax.set_ylim(*ylim)
    return hi


def table(fig, rect, labels, values, *, head=('', ''), fmt='{:,}'):
    x0, y0, w, h = rect
    rows = len(labels) + 1
    step = h / rows
    fl, fm = family('FB'), family('FM', 'FB')
    small, body = pt(T['FsSmall']), pt(T['FsBody'])
    top = y0 + h - step / 2
    fig.text(x0, top, head[0], family=fl, size=small, color=T['Ink3'], va='center')
    fig.text(x0 + w, top, head[1], family=fm, size=small, color=T['Ink3'], va='center', ha='right')
    fig.add_artist(plt.Line2D([x0, x0 + w], [top - step / 2, top - step / 2], color=T['Line'], linewidth=0.75, transform=fig.transFigure))
    for k, (lab, v) in enumerate(zip(labels, values)):
        y = top - step * (k + 1)
        fig.text(x0, y, lab, family=fl, size=body, color=T['Ink2'], va='center')
        fig.text(x0 + w, y, fmt.format(v), family=fm, size=body, color=T['Ink2'], va='center', ha='right')


def chart(labels, values, *, title, unit, source, name='', mark='', fmt='{:,}', strokes=True, size=(1280, 720), seed=0):
    use()
    fig = plt.figure(figsize=(size[0] / 96, size[1] / 96))
    m = 64 / size[0]
    fig.text(m, 1 - 64 / size[1], title, family=family('FT', 'FB'), size=pt(T['FsH2']), color=T['Ink'], va='top')
    ax = fig.add_axes((m + 0.13, 0.44, 0.84 - m - 0.13, 0.38))
    pull(ax, labels, values, fmt=fmt, strokes=strokes, seed=seed)
    table(fig, (m, 0.12, 0.42, 0.26), labels, values, head=(name, unit), fmt=fmt)
    note = ' · '.join(x for x in (f'单位 {unit}', f'出处 {source}', mark) if x)
    fig.text(m, 48 / size[1], note, family=family('FM', 'FB'), size=pt(T['FsSmall']), color=T['Ink3'], va='bottom')
    return fig


def on_paper(png, out):
    chart_im = Image.open(png).convert('RGBA')
    paper = Image.open(ISM / 'assets/paper/xuan_sheet.webp').convert('RGBA').resize(chart_im.size, Image.LANCZOS)
    Image.alpha_composite(paper, chart_im).convert('RGB').save(out, optimize=True)


__all__ = ['use', 'pull', 'table', 'chart', 'on_paper', 'family', 'T']

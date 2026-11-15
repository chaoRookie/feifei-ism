import json
import os
import re
import shutil
import sys
import urllib.parse
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
ISM = HERE.parent.parent
FONTS = HERE / 'fonts'
STYLE = HERE / 'feifei.mplstyle'
GENERIC = {'serif', 'sans-serif', 'monospace', 'ui-monospace', 'cursive', 'fantasy', 'system-ui'}


def tokens():
    return json.loads((ISM / 'tokens/out/tokens.flat.json').read_text())


def px(v):
    s = str(v)
    if s.endswith('rem'):
        return float(s[:-3]) * 16
    return float(s.rstrip('px'))


def pt(v):
    return round(px(v) * 0.75, 3)


def fams(a):
    return [f for f in a if f not in GENERIC]


def c(v):
    return v.lstrip('#')


def style(t):
    rows = {
        'font.family': 'serif',
        'font.serif': ', '.join(fams(t['FB']) + ['DejaVu Serif']),
        'font.monospace': ', '.join(fams(t['FM']) + ['DejaVu Sans Mono']),
        'font.size': pt(t['FsBody']),
        'font.weight': 'normal',
        'text.color': c(t['Ink2']),
        'axes.unicode_minus': False,
        'axes.facecolor': 'none',
        'axes.edgecolor': c(t['Line']),
        'axes.linewidth': 0.75,
        'axes.spines.top': False,
        'axes.spines.right': False,
        'axes.grid': False,
        'axes.titlesize': pt(t['FsH2']),
        'axes.titleweight': 'normal',
        'axes.titlecolor': c(t['Ink']),
        'axes.titlelocation': 'left',
        'axes.labelsize': pt(t['FsSmall']),
        'axes.labelweight': 'normal',
        'axes.labelcolor': c(t['Ink3']),
        'axes.prop_cycle': "cycler('color', [" + ', '.join(f"'{c(t[k])}'" for k in ('Ink', 'Ink2', 'Ink3')) + '])',
        'grid.color': c(t['Line']),
        'grid.linewidth': 0.75,
        'xtick.color': c(t['Ink3']),
        'ytick.color': c(t['Ink3']),
        'xtick.labelcolor': c(t['Ink3']),
        'ytick.labelcolor': c(t['Ink2']),
        'xtick.labelsize': pt(t['FsSmall']),
        'ytick.labelsize': pt(t['FsBody']),
        'legend.frameon': False,
        'legend.fontsize': pt(t['FsSmall']),
        'legend.labelcolor': c(t['Ink2']),
        'lines.color': c(t['Ink']),
        'patch.facecolor': c(t['Ink']),
        'hatch.color': c(t['Ink']),
        'figure.facecolor': 'none',
        'figure.titlesize': pt(t['FsH1']),
        'figure.titleweight': 'normal',
        'figure.dpi': 96,
        'savefig.dpi': 192,
        'savefig.facecolor': 'none',
        'savefig.transparent': True,
    }
    return ''.join(f'{k}: {v}\n' for k, v in rows.items())


def font_specs(t):
    return [(fams(t['FT'])[0], ''), (fams(t['FB'])[0], ':wght@400'), (fams(t['FE'])[0], ':ital@1'), (fams(t['FM'])[0], '')]


def fetch_fonts(t):
    FONTS.mkdir(exist_ok=True)
    local = os.environ.get('FEIFEI_FONT_DIR')
    for fam, spec in font_specs(t):
        dst = FONTS / (fam.replace(' ', '') + '.ttf')
        if dst.exists():
            continue
        if local:
            key = fam.replace(' ', '').lower()
            hit = [p for p in Path(local).glob('*.ttf') if p.name.lower().replace(' ', '').startswith(key)]
            if hit:
                shutil.copy(hit[0], dst)
                print('copied', hit[0].name, '->', dst.name)
                continue
        q = urllib.parse.quote(fam).replace('%20', '+')
        css = urllib.request.urlopen(f'https://fonts.googleapis.com/css2?family={q}{spec}', timeout=60).read().decode()
        url = re.search(r'url\((https://[^)]+\.ttf)\)', css).group(1)
        dst.write_bytes(urllib.request.urlopen(url, timeout=300).read())
        print('fetched', fam, '->', dst.name)


def main():
    t = tokens()
    STYLE.write_text(style(t))
    print('wrote', STYLE.name)
    if '--no-fonts' not in sys.argv:
        fetch_fonts(t)


if __name__ == '__main__':
    main()

import argparse
import base64
import mimetypes
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, '..', 'assets')
TEMPLATES = os.path.join(HERE, '..', 'templates')

ap = argparse.ArgumentParser()
ap.add_argument('src')
ap.add_argument('out')
ap.add_argument('--figs', default='.')
ap.add_argument('--standalone', action='store_true')
a = ap.parse_args()

s = open(a.src, encoding='utf-8').read()
page = s
missing = []
included = []


def include(m):
    name = m.group(1).strip()
    for d in (os.path.dirname(os.path.abspath(a.src)), TEMPLATES):
        f = os.path.join(d, name)
        if os.path.exists(f):
            included.append(name)
            return open(f, encoding='utf-8').read()
    missing.append(name)
    return m.group(0)


for _ in range(3):
    s = re.sub(r'/\*@include:([^*]+?)\*/', include, s)


def uri(path, name, raw):
    if not os.path.exists(path):
        missing.append(name)
        return raw
    mt = mimetypes.guess_type(path)[0] or 'image/png'
    if path.endswith('.webp'):
        mt = 'image/webp'
    return 'data:%s;base64,%s' % (mt, base64.b64encode(open(path, 'rb').read()).decode())


def script(m):
    path = os.path.join(ASSETS, m.group(1))
    if not os.path.exists(path):
        return ''
    return '<script>' + open(path, encoding='utf-8').read() + '</script>'


s = re.sub(r'<script src="__ASSET:([^"]*?\.js)__"></script>', script, s)
s = re.sub(r'__ASSET:([^_][^"\')]*?)__', lambda m: uri(os.path.join(ASSETS, m.group(1)), m.group(1), m.group(0)), s)
s = re.sub(r'__FIG:([^_][^"\')]*?)__', lambda m: uri(os.path.join(a.figs, m.group(1)), m.group(1), m.group(0)), s)
if a.standalone:
    i = s.find('<div class="wall"')
    i = i if i >= 0 else 0
    head = '<!doctype html>\n<html lang="zh">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
    s = head + s[:i] + '</head>\n<body>\n' + s[i:] + '\n</body>\n</html>\n'
uses = lambda pat: re.search(pat, page) is not None
if uses(r'\bk[1-6]\b') and 'buttons.css' not in included:
    print('WARNING: k1-k6 buttons used without /*@include:buttons.css*/', file=sys.stderr)
if uses(r'\bk5\b') and 'buttons-ring.css' not in included:
    print('WARNING: k5 used without /*@include:buttons-ring.css*/, the ring stays static', file=sys.stderr)
if uses(r'\bdisabled\b') and 'buttons.css' in included and 'buttons-slash.css' not in included:
    print('WARNING: disabled buttons without /*@include:buttons-slash.css*/, no slash', file=sys.stderr)
if 'buttons.css' in included and 'motion.css' not in included:
    print('WARNING: buttons.css without /*@include:motion.css*/, stroke textures missing', file=sys.stderr)
if 'buttons.css' in included and 'motion.js' not in included:
    print('WARNING: buttons.css without /*@include:motion.js*/, buttons will not press', file=sys.stderr)
if uses(r'class="[^"]*\bzi\b') and 'signs.css' not in included:
    print('WARNING: layered signs (class zi) used without /*@include:signs.css*/, the main colour layer is missing', file=sys.stderr)
open(a.out, 'w', encoding='utf-8').write(s)
mb = len(s.encode()) / 1e6
print('wrote %s  %.2f MB' % (a.out, mb))
if missing:
    print('MISSING:', missing, file=sys.stderr)
    sys.exit(1)
if mb > 15:
    print('WARNING: page over 15MB', file=sys.stderr)

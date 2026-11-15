import json
import sys

import matplotlib

matplotlib.use('Agg')

import gen_style
from brushbar import T, chart, on_paper

HERE_OUT = gen_style.HERE / 'out'

QIAN = dict(Jia='甲', Yi='乙', Bing='丙', Ding='丁', Wu='戊', Ji='己', Geng='庚', Xin='辛', Ren='壬', Gui='癸', Zi='子', Chou='丑')


def qian():
    for k, v in T.items():
        if k.startswith('Sign') and v.lower() == T['C'].lower():
            return f'第{QIAN[k[4:]]}签'
    return ''


def main():
    gen_style.main()
    d = json.loads((gen_style.HERE / 'sample.json').read_text())
    labels, values = zip(*d['rows'])
    HERE_OUT.mkdir(exist_ok=True)
    for strokes, name in ((True, 'sample'), (False, 'sample_flat')):
        fig = chart(labels, values, title=d['title'], unit=d['unit'], source=d['source'], name=d['name'], mark=qian(), strokes=strokes)
        png = HERE_OUT / f'{name}.png'
        fig.savefig(png)
        on_paper(png, HERE_OUT / f'{name}_on_paper.png')
        print('wrote', png.name, f'{name}_on_paper.png')


if __name__ == '__main__':
    sys.exit(main())

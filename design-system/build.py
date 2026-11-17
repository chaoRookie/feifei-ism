import json, os, re, shutil, datetime

import subprocess
SP = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(SP, '..', 'feifei-ism')
OUT = os.path.join(SP, 'out')
CREATED = '2026-11-17T15:04:24Z'
REF = 'main@' + subprocess.run(['git', '-C', SP, 'rev-parse', '--short', 'HEAD'], capture_output=True, text=True).stdout.strip()
P = os.path.join(OUT, 'project')
NOW = datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat().replace('+00:00', 'Z')

if os.path.exists(OUT):
    shutil.rmtree(OUT)
os.makedirs(P)

ids = {}
for line in open(os.path.join(SP, 'blobs.txt')):
    path, bid, size = line.split()
    ids[path] = (bid, int(size))

def w(rel, text):
    f = os.path.join(P, rel)
    os.makedirs(os.path.dirname(f), exist_ok=True)
    open(f, 'w', encoding='utf-8').write(text)

def blob(rel):
    return '/_blob/' + ids[rel][0]

def asset_sub(s):
    return re.sub(r'__ASSET:([^_][^"\')]*?)__', lambda m: blob(m.group(1)), s)

def rd(rel):
    return open(os.path.join(SRC, rel), encoding='utf-8').read()

src = json.load(open(os.path.join(SRC, 'tokens/feifei.tokens.json'), encoding='utf-8'))
desc = lambda node, d='': node.get('$description', d)

signs = [('jia', '甲'), ('yi', '乙'), ('bing', '丙'), ('ding', '丁'), ('wu', '戊'), ('ji', '己'), ('geng', '庚'), ('xin', '辛'), ('ren', '壬'), ('gui', '癸'), ('zi', '子'), ('chou', '丑')]

def hx(v):
    return v.lower()

colors = [
    {'name': 'paper', 'value': {'paper': hx(src['paper']['$value'])}, 'usage': '纸色：页面最底一层的宣纸平涂，也是宣纸贴图画好之前、打印时的退路。所有作品都铺在它上面。'},
    {'name': 'ink', 'value': {'paper': hx(src['ink']['$value'])}, 'usage': '标题、要紧的句子、墨色的字和墨块。在 paper 和四级小面上都远超 4.5:1。'},
    {'name': 'ink-2', 'value': {'paper': hx(src['ink-2']['$value'])}, 'usage': '默认正文色，在 paper、s-sunken、s-raised、s-overlay 上都达 4.5:1 以上。'},
    {'name': 'ink-3', 'value': {'paper': hx(src['ink-3']['$value'])}, 'usage': '题记、说明、旁批小字。纸上最深处 4.52:1，s-sunken 上 4.7:1；小字不能比它更淡。'},
    {'name': 'line', 'value': {'paper': hx(src['line']['$value'])}, 'usage': '细线：页脚上方那一条、幻灯片外框。只做分隔，不承载信息（对 paper 不到 3:1）。'},
    {'name': 'c', 'value': {'paper': '{sign-yi}'}, 'usage': '这件作品的主色，默认乙签；每件作品从十二支签换一支覆盖它。每屏只给最要紧的那一个：那个人、那个点、最高的数据、落款的印、唯一的主要按钮。'},
]
for k, zh in signs:
    colors.append({'name': 'sign-' + k, 'value': {'paper': hx(src['sign'][k]['$value'])}, 'usage': f'第{zh}签。只拿来当 c 用，不和别的签同屏；对 paper 5:1 以上，可写小字。'})
colors += [
    {'name': 's-sunken', 'value': {'paper': hx(src['s']['sunken']['$value'])}, 'usage': '小面·凹下：把几样东西收成一组的底。ink-3 在上面 4.7:1。'},
    {'name': 's-0', 'value': {'paper': '{paper}'}, 'usage': '小面·平：就是纸。'},
    {'name': 's-raised', 'value': {'paper': hx(src['s']['raised']['$value'])}, 'usage': '小面·抬起：能拖动、能点开的一块。'},
    {'name': 's-overlay', 'value': {'paper': hx(src['s']['overlay']['$value'])}, 'usage': '小面·浮层：弹窗、下拉、提示，配 shadow-overlay。'},
    {'name': 'scrim', 'value': {'paper': 'rgba(33, 28, 28, 0.3)'}, 'usage': '遮罩，墨色 30%：只表示下面不能操作；下面还能操作就不加。'},
]

def stack(a):
    return ', '.join(f'"{x}"' if ' ' in x else x for x in a)

f = src['f']
families = {k: stack(f[k]['$value']) for k in ['t', 'b', 'e', 'm']}
fs = src['fs']
type_groups = [
    {'name': '标题', 'family': 't', 'styles': [
        {'name': 'h1', 'fontSize': fs['h1']['$value'], 'lineHeight': 1.2, 'fontWeight': 400, 'letterSpacing': '0.02em', 'sample': '肥肥主义', 'usage': '页面大标题，约正文三倍，站酷小薇，不加粗，字距收紧，颜色 ink。上方空白至少是段距两倍。'},
        {'name': 'h2', 'fontSize': fs['h2']['$value'], 'lineHeight': 1.3, 'fontWeight': 400, 'letterSpacing': '0.04em', 'sample': '一件小事', 'usage': '二级标题，不加粗。能由一个字代替就省掉。'},
        {'name': 'h3', 'fontSize': fs['h3']['$value'], 'lineHeight': 1.5, 'fontWeight': 400, 'sample': '三级标题', 'usage': '三级标题，不加粗。'},
    ]},
    {'name': '正文', 'family': 'b', 'styles': [
        {'name': 'quote', 'fontSize': fs['quote']['$value'], 'lineHeight': 1.7, 'fontWeight': 400, 'sample': '葵藿倾太阳，物性固莫夺。', 'usage': '引文，正文里最大的字，颜色 ink。'},
        {'name': 'body', 'fontSize': fs['body']['$value'], 'lineHeight': src['lh']['body']['$value'], 'fontWeight': 400, 'sample': '只记发生了什么，不下结论。', 'usage': '正文，颜色 ink-2，段距 1.5em，不缩进，一段不超过三行，最宽 measure。要紧的句子换 ink，不加粗，每屏不超过两句。'},
        {'name': 'h4', 'fontSize': fs['h4']['$value'], 'lineHeight': 1.6, 'fontWeight': 400, 'sample': '四级比正文还小', 'usage': '四级标题，比正文还小，靠留白分层。'},
        {'name': 'small', 'fontSize': fs['small']['$value'], 'lineHeight': 1.75, 'fontWeight': 400, 'sample': '旁批放字、当场核对的账和小注。', 'usage': '旁批和说明，颜色 ink-3。'},
    ]},
    {'name': '英文与题记', 'family': 'e', 'styles': [
        {'name': 'en', 'fontSize': '1.1rem', 'lineHeight': 1.6, 'fontWeight': 400, 'fontStyle': 'italic', 'sample': 'Every stroke is a choice', 'usage': '普通英文，Cormorant Garamond 斜体，颜色 ink-2。'},
        {'name': 'tiji', 'family': 'm', 'fontSize': '0.74rem', 'lineHeight': 1.8, 'fontWeight': 400, 'letterSpacing': '0.04em', 'sample': '二〇一七年六月　Vaswani 等八人　第乙签', 'usage': '题记、代码、标识符、数字，JetBrains Mono，颜色 ink-3。每件作品开头一行，写纪年、人或事和签号。'},
    ]},
]

spacing = [
    {'name': 'space-side', 'value': '16px', 'usage': '手机两侧留边，390px 宽不横向滚动。'},
    {'name': 'space-para', 'value': '1.5em', 'usage': '段距，不缩进。'},
    {'name': 'space-gutter', 'value': '80px', 'usage': '桌面旁批布局 5:3 双栏的栏间距。'},
    {'name': 'space-section', 'value': '96px', 'usage': '章节之间的空白；也是幻灯片安全边距。'},
]
radius = [
    {'name': 'radius-0', 'value': '0', 'usage': '按钮、块、卡片一律方角：按钮是颜料，不是矩形框；方印也是方的。'},
    {'name': 'radius-dot', 'value': '50%', 'usage': '只给圆点：状态的 15px 点、开关的点、滑块拇指。'},
]
shadow = [
    {'name': 'shadow-overlay', 'value': '0px 6px 18px 0px rgba(33, 28, 28, 0.18)', 'usage': '影子只给浮层（s-overlay），别的高低靠深浅分。'},
]
opacity = [
    {'name': 'st-hover', 'value': '0.08', 'usage': '状态层：悬停时在面上叠一层墨。'},
    {'name': 'st-press', 'value': '0.12', 'usage': '状态层：按下。'},
    {'name': 'st-drag', 'value': '0.16', 'usage': '状态层：拖动。'},
]
size = [
    {'name': 'fs-body', 'value': fs['body']['$value'], 'usage': '正文字号，同 body 样式。'},
    {'name': 'fs-h1', 'value': fs['h1']['$value'], 'usage': '大标题字号，同 h1 样式。'},
    {'name': 'fs-h2', 'value': fs['h2']['$value'], 'usage': '二级标题字号。'},
    {'name': 'fs-h3', 'value': fs['h3']['$value'], 'usage': '三级标题字号。'},
    {'name': 'fs-h4', 'value': fs['h4']['$value'], 'usage': '四级标题字号。'},
    {'name': 'fs-quote', 'value': fs['quote']['$value'], 'usage': '引文字号。'},
    {'name': 'fs-small', 'value': fs['small']['$value'], 'usage': '小字字号。'},
    {'name': 'lh-body', 'value': str(src['lh']['body']['$value']), 'usage': '正文行高。'},
    {'name': 'measure', 'value': src['measure']['$value'], 'usage': '正文最宽 30rem。'},
    {'name': 'seal-size', 'value': src['seal']['size']['$value'], 'usage': '落款方印边长。'},
    {'name': 'seal-rotate', 'value': str(src['seal']['rotate']['$value']), 'usage': '方印歪 -1.5 度。'},
    {'name': 'seal-char', 'value': str(src['seal']['char']['$value']), 'usage': '印上一个字占印边长的比例。'},
]
media = []
for k in ['page-w', 'page-h', 'margin', 'body', 'lh']:
    v = src['doc'][k]
    media.append({'name': 'doc-' + k, 'value': str(v['$value']), 'usage': {'page-w': '文档 A4 宽。', 'page-h': '文档 A4 高。', 'margin': '文档页边。', 'body': '文档正文 11pt 思源宋体。', 'lh': '文档行距。'}[k]})
for k in ['w', 'h', 'safe', 'title', 'body', 'min', 'lh']:
    v = src['slide'][k]
    media.append({'name': 'slide-' + k, 'value': str(v['$value']), 'usage': {'w': '幻灯片画布宽。', 'h': '幻灯片画布高。', 'safe': '幻灯片安全边距。', 'title': '幻灯片标题字号。', 'body': '幻灯片正文字号。', 'min': '幻灯片最小字号，放不下先拆页。', 'lh': '幻灯片行高。'}[k]})

tokens = {
    'name': '肥肥主义', 'version': 1,
    'meta': {'source': 'github', 'repo': 'chaoRookie/feifei-ism', 'ref': REF, 'package': 'feifei-ism',
             'paths': {'tokens': ['feifei-ism/tokens/feifei.tokens.json'], 'fonts': [], 'assets': ['feifei-ism/assets'], 'docs': ['feifei-ism/references/DESIGN.md', 'feifei-ism/SKILL.md'],
                       'styles': ['feifei-ism/templates/motion.css', 'feifei-ism/templates/tokens-motion.css', 'feifei-ism/templates/buttons.css', 'feifei-ism/templates/buttons-ring.css', 'feifei-ism/templates/buttons-slash.css', 'feifei-ism/templates/signs.css', 'feifei-ism/templates/page.html'],
                       'scripts': ['feifei-ism/templates/paper.js', 'feifei-ism/templates/motion.js']},
             'synced': NOW[:10]},
    'color': {'themes': [{'id': 'paper', 'name': '宣纸'}], 'tokens': colors},
    'type': {'fonts': [], 'families': families, 'groups': type_groups},
    'spacing': {'tokens': spacing},
    'radius': {'tokens': radius},
    'shadow': {'tokens': shadow},
    'opacity': {'note': '状态层：在任何面上叠一层 ink 的不透明度，借自 Material。', 'tokens': opacity},
    'size': {'note': '字号、行高、版心和方印的尺寸，供样式表按名字取用。', 'tokens': size},
    'media': {'note': '文档和幻灯片两个出口的版面。', 'tokens': media},
}
w('tokens.json', json.dumps(tokens, ensure_ascii=False, indent=1))

css = ['/* 肥肥主义 — generated from tokens.json */']
root = []
for t in colors:
    v = t['value']['paper']
    m = re.fullmatch(r'\{(.+)\}', v)
    root.append(f'--{t["name"]}:{"var(--" + m.group(1) + ")" if m else v}')
for t in shadow:
    root.append(f'--{t["name"]}:{t["value"]}')
css.append(':root, [data-theme="paper"] {' + ';'.join(root) + '}')
r2 = [f'--{t["name"]}:{t["value"]}' for fam in [spacing, radius, opacity, size, media] for t in fam]
r2 += [f'--font-{k}:{v}' for k, v in families.items()]
css.append(':root {' + ';'.join(r2) + '}')
for g in type_groups:
    for s in g['styles']:
        fam = s.get('family', g['family'])
        decl = [f'font-family:var(--font-{fam})', f'font-size:{s["fontSize"]}', f'line-height:{s["lineHeight"]}', f'font-weight:{s["fontWeight"]}']
        if 'letterSpacing' in s: decl.append(f'letter-spacing:{s["letterSpacing"]}')
        if 'fontStyle' in s: decl.append(f'font-style:{s["fontStyle"]}')
        css.append(f'.{s["name"]} {{' + ';'.join(decl) + '}')
w('tokens.css', '\n'.join(css) + '\n')

base = r'''*{box-sizing:border-box}
body{margin:0;padding:16px;background-color:var(--paper);background-image:var(--ff-paper,none);background-size:768px,1181px;background-blend-mode:multiply,multiply;color:var(--ink-2);font-family:var(--f-b);font-size:var(--fs-body);line-height:var(--lh-body)}
img{display:block;max-width:100%}
b{font-weight:400;color:var(--ink)}
a{color:var(--ink);text-decoration:none;border-bottom:1px solid var(--ink-3)}
.t{font-family:var(--f-m);font-size:.74rem;color:var(--ink-3);letter-spacing:.04em}
.cap{display:flex;gap:1rem;flex-wrap:wrap;align-items:center}
button{font:inherit;color:inherit;background:none;border:0;border-radius:0;padding:0;margin:0;cursor:pointer;touch-action:manipulation}
button:focus-visible,a:focus-visible,summary:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:1px dotted var(--ink);outline-offset:3px}
button[role=switch]{position:relative;width:88px;height:46px;flex:none}
button[role=switch]::before{content:"";position:absolute;left:4px;right:4px;bottom:14px;height:1px;background:var(--ink)}
button[role=switch]::after{content:"";position:absolute;left:4px;bottom:15px;width:15px;height:15px;border-radius:50%;background:var(--ink-3);transition:left var(--t-release) var(--e-out),background-color var(--t-hover)}
button[role=switch][aria-checked=true]::after{left:calc(100% - 19px);background:var(--c)}
button[role=switch] span{position:absolute;right:4px;top:2px;font-size:.82rem;line-height:1.4;color:var(--ink-3)}
button[role=switch][aria-checked=true] span{right:auto;left:4px;color:var(--ink)}
@media (prefers-reduced-motion:reduce){button[role=switch]::after{transition:none}}
.scene{position:relative;height:5rem;max-width:30rem;margin-top:1rem}
.ln{position:absolute;left:0;right:0;bottom:1.2rem;height:1px;background:var(--ink)}
.dt{position:absolute;width:15px;height:15px;border-radius:50%;background:var(--ink);bottom:calc(1.2rem + 1px);left:0}
.loading .dt{animation:w 3.6s cubic-bezier(.45,.05,.55,.95) infinite alternate}
@keyframes w{to{left:calc(100% - 15px)}}
.saving .dt{left:62%;animation:hop .9s ease-in-out infinite alternate}
@keyframes hop{to{transform:translateY(-9px)}}
.ok .dt{left:calc(100% - 15px)}
.empty .dt{display:none}
.error .ln{right:38%}
.error .dt{left:calc(62% + 8px);bottom:0;background:var(--c);animation:fall .7s cubic-bezier(.5,0,.9,.4) both}
@keyframes fall{from{bottom:calc(1.2rem + 1px);left:calc(62% - 8px)}}
canvas{display:block;width:100%;height:auto}
.note{font-size:.8rem;color:var(--ink-3);margin-top:.8rem}
.k{display:flex;gap:.55rem;align-items:flex-end}
.v{writing-mode:vertical-rl;font-size:.84rem;letter-spacing:.3em;color:var(--ink)}
.seal{position:relative;width:var(--seal-size);height:var(--seal-size);min-height:0;background:var(--c);text-align:center;color:var(--paper);font-family:var(--f-t);font-size:.82rem;line-height:1.05;display:grid;grid-template-columns:1fr 1fr;place-items:center;padding:.2rem;transform:rotate(-1.5deg)}
@media print{.seal{opacity:1!important}}
@media (prefers-reduced-motion: reduce){.dt{animation:none!important}.loading .dt{left:40%}}
.sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}
'''

motion = rd('templates/motion.css').replace('/*@include:tokens-motion.css*/', rd('templates/tokens-motion.css'))
bundle_css = '\n'.join([
    '@import url("https://fonts.googleapis.com/css2?family=ZCOOL+XiaoWei&family=Noto+Serif+SC:wght@400;600&family=Cormorant+Garamond:ital@1&family=JetBrains+Mono&display=swap");',
    ':root{color-scheme:light;--f-t:var(--font-t);--f-b:var(--font-b);--f-e:var(--font-e);--f-m:var(--font-m)}',
    asset_sub(motion),
    asset_sub(rd('templates/buttons.css')),
    asset_sub(rd('templates/buttons-ring.css')),
    asset_sub(rd('templates/buttons-slash.css')),
    rd('templates/signs.css'),
    base,
])
assert '__ASSET' not in bundle_css and '</style' not in bundle_css.lower()
w('components/bundle.css', bundle_css)

bundle_js = rd('templates/paper.js') + '\n' + rd('templates/motion.js') + '\n'
assert '</script' not in bundle_js.lower() and '<!--' not in bundle_js and '__ASSET' not in bundle_js
w('components/bundle.js', bundle_js)

def zi(name, extra='', label=None, cls='zi'):
    aria = f'role="img" aria-label="{label}"' if label else 'aria-hidden="true"'
    return f'<span class="{cls}" {aria} style="--r:url({blob("signs/sign_" + name + "_relief.webp")}){extra}"><i></i><img src="{blob("signs/sign_" + name + "_ink.webp")}" alt=""></span>'

comps = {}

comps['ScrapeBlock'] = ('Actions', 120, '甲 k1 刮字块：主要操作和讲解页舞台上的按钮', '''# ScrapeBlock

甲套按钮 `k1`：一整块厚颜料，字像从颜料里刮出来，用在主要操作和讲解页舞台上的按钮。

- 写法：`<button class="k1" type="button">下一页</button>`；`.stage` 里没写类的按钮自动套用甲。
- 主要：加 `p`，颜料换成 `c`，算这一屏的主色。一屏最多一个；方印所在的那一屏不放。
- 选中：`aria-pressed="true"` 变墨块，靠形状和深浅，不靠颜色。
- 禁用：`disabled`，bundle.js 自动压一笔主色斜杠，恢复时去掉。
- 按下：100ms `e-drop` 压进纸里，黏 70ms，500ms `e-out` 回来，点得再快也压满 170ms。
- 使用方提供：按钮文字（或一个造的字加 `aria-label`）、点击处理。触控高度不低于 44px，焦点是 1px `ink` 点线外框。
- 理念：一眼抓住，这一屏最重的一块；字是刮出来的负形。
''', '<div class="cap"><button class="k1" type="button">上一页</button><button class="k1 p" type="button">下一页</button><button class="k1" type="button" aria-pressed="true">已选</button><button class="k1" type="button" disabled>不可用</button></div>')

comps['StrokeUnder'] = ('Actions', 120, '乙 k2 一笔托字：成组选项里选一个', '''# StrokeUnder

乙套按钮 `k2`：字下一笔颜料托着，选中时颜料长满成墨块，用在成组的选项里选一个。

- 写法：`<button class="k2" type="button" aria-pressed="false">加载</button>`；`.quiz` 里没写类的按钮自动套用乙。
- 成组单选由页面自己设 `aria-pressed`，不加 `data-toggle`。
- 选中靠那一笔长满，不靠颜色；主要态 `p` 同甲。
- 使用方提供：一组按钮、当前选中项、切换处理。
- 理念：选择，几个里选一个，靠形不靠颜色。
''', '<div class="cap" id="g"><button class="k2" type="button" aria-pressed="true">加载</button><button class="k2" type="button" aria-pressed="false">空</button><button class="k2" type="button" aria-pressed="false">错误</button><button class="k2" type="button" disabled>保存中</button></div><script>document.getElementById("g").addEventListener("click",e=>{const b=e.target.closest("button");if(!b||b.disabled)return;[...e.currentTarget.children].forEach(x=>x.setAttribute("aria-pressed",x===b))})</script>')

comps['PaintText'] = ('Actions', 110, '丙 k3 颜料字：颜料块和舞台旁的行内小操作', '''# PaintText

丙套按钮 `k3`：字本身是厚颜料写的，没有底，用在颜料块、舞台、画布旁边的行内小操作。

- 写法：`<button class="k3" type="button">重来</button>`。
- 选中：字下添一笔墨。
- 理念：答得勉强，只是为了不抢甲的分量。
''', '<div class="cap"><button class="k3" type="button">重来</button><button class="k3" type="button" aria-pressed="true">慢放</button><button class="k3" type="button" disabled>跳过</button></div>')

comps['DotLine'] = ('Actions', 110, '丁 k4 点线：正文和页脚里的行内小操作', '''# DotLine

丁套按钮 `k4`：字前一个点，字下一条线，用在正文和页脚里的行内小操作，比如回到题记、复制、展开。

- 写法：`<button class="k4" type="button" data-top>回到题记</button>`；没写类、也不在 `.stage`、`.quiz` 里的按钮自动套用丁。
- 选中：线长满成墨块。
- 「回到顶部」一律写成「回到题记」，`data-top` 会接上回顶。
- 理念：互见，和状态的「一条线一个点」是同一个字。
''', '<div class="cap"><button class="k4" type="button">回到题记</button><button class="k4" type="button">复制</button><button class="k4" type="button" aria-pressed="true">展开</button></div>')

comps['PencilRing'] = ('Actions', 120, '戊 k5 彩铅圈：讲解页里能来回切的选项', '''# PencilRing

戊套按钮 `k5`：彩铅一圈圈住字，用在讲解页里能来回切的选项。

- 写法：`<button class="k5" type="button" aria-pressed="false">二档</button>`。
- bundle.js 把字包进 `.fftx`；进屏和每次点击都重画一圈（1250ms），字从左往右露出。
- 选中：圈画完后排满彩铅线，字成负形。
- 雪碧图 `motion/ring_strip.webp`（49 帧）和 `motion/hatch.webp` 已接在 bundle.css 里。
- 理念：特别好理解，谁都在卷子上圈过答案，圈就是选。
''', '<div class="cap" id="g"><button class="k5" type="button" aria-pressed="false">一档</button><button class="k5" type="button" aria-pressed="true">二档</button><button class="k5" type="button" aria-pressed="false">三档</button></div><script>document.getElementById("g").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;[...e.currentTarget.children].forEach(x=>x.setAttribute("aria-pressed",x===b))})</script>')

comps['SealHead'] = ('Actions', 120, '己 k6 印头：保存、标记完成这类定下来的操作', '''# SealHead

己套按钮 `k6`：字前一方小印，用在保存、标记完成这类定下来的操作。

- 标记完成：`<button class="k6" type="button" data-toggle aria-pressed="false">标记完成</button>`，变成选中时印压出来，再点淡回。
- 保存：`<button class="k6" type="button" data-seal="存">保存</button>`，不带 `aria-pressed`，每点一次盖一次。
- 印上的字取 `data-seal`，没有就取第一个字；也可以自己写 `<span class="ffh" aria-hidden="true">存</span>`。
- `data-toggle` 在页面自己的点击处理之前翻转 `aria-pressed`。
- 理念：为选择负责，盖下去就留在纸上。
''', '<div class="cap"><button class="k6" type="button" data-toggle aria-pressed="false">标记完成</button><button class="k6" type="button" data-seal="存">保存</button><button class="k6" type="button" aria-pressed="true"><span class="ffh" aria-hidden="true">记</span>记下这一行</button></div>')

comps['Switch'] = ('Inputs', 100, '开关：一条线一个点', '''# Switch

开关：一条线一个点，点滑到另一头，打开时点变 `c`，旁边写开或关。

- 写法：`<button type="button" role="switch" aria-checked="false" aria-label="…"><span>关</span></button>`；页面自己翻 `aria-checked` 并改字。
- 点用 `radius-dot`，滑动 `t-release`、`e-out`；减少动态时不滑。
- 滑块拇指、勾选也是实心圆点；输入框和下拉只有一条下划线。
- 使用方提供：`aria-label`、状态和切换处理。
''', '<div class="cap"><button id="s" type="button" role="switch" aria-checked="true" aria-label="这是一个开关"><span>开</span></button><span class="t">开关</span></div><script>document.getElementById("s").onclick=e=>{const b=e.currentTarget,v=b.getAttribute("aria-checked")!=="true";b.setAttribute("aria-checked",v);b.firstChild.textContent=v?"开":"关"}</script>')

comps['Status'] = ('Feedback', 200, '状态：一条线一个点，不用转圈和骨架屏', '''# Status

状态：所有状态都是同一条 1px 的线和同一个 15px 的圆点，不用转圈和骨架屏。

- 加载 `.scene.loading`：点来回走。成功 `.ok`：走到头。保存中 `.saving`：停在中间轻跳。空 `.empty`：只有线。错误 `.error`：线断了，点变 `c` 落下。
- 写法：`<div class="scene loading"><div class="ln"></div><div class="dt"></div></div>`，再跟一句话。
- 文案是一句事实加一句接下来怎么办，不道歉。需要真实进度时另外写数字。
- 出错的点是状态记号，可以用 `c`，不算这一屏的那一个主色。
''', '<div><div class="cap" id="b"></div><div class="scene loading" id="sc"><div class="ln"></div><div class="dt"></div></div><p id="say" style="margin:0"></p></div><script>(function(){const T={loading:["加载","去取。"],empty:["空","这里还没有记录。"],error:["错误","没有取到。再取一次。"],ok:["成功","取到了。"],saving:["保存中","记下这一行。"]},box=document.getElementById("b");const go=k=>{document.getElementById("sc").className="scene "+k;document.getElementById("say").textContent=T[k][1];[...box.children].forEach(x=>x.setAttribute("aria-pressed",x.dataset.k===k))};Object.keys(T).forEach(k=>{const x=document.createElement("button");x.type="button";x.className="k2";x.dataset.k=k;x.textContent=T[k][0];x.onclick=()=>go(k);box.appendChild(x)});go("loading")})()</script>')

comps['Seal'] = ('Brand', 150, '方印：页面底部的落款', '''# Seal

方印：页面底部右下角竖写「你的名字 记」，压一方 `seal-size` 的主色小印，印文「肥肥主义」四字，歪 `seal-rotate` 度。

- 页脚顺序：一个字，字说不全才加一句动作，然后一条 `line` 细线；细线下左边写上一篇、下一篇、日期和版本、出处，「回到顶部」写成「回到题记」（`k4`）。
- 写法：`<button class="seal" type="button" data-stamp aria-label="肥肥主义的印"><span>肥</span><span>肥</span><span>主</span><span>义</span></button>`。
- `data-stamp`：滚到时按「落」盖下去（980ms），一页只盖一次；所在页脚写 `data-shake`，盖下去时纸面沉 2px。
- 印在的这一屏，主色就给它，这一屏不放主要按钮。幻灯片和视频片尾也用。
''', '<footer data-shake style="display:grid;grid-template-columns:1fr auto;gap:2rem;align-items:end;border-top:1px solid var(--line);padding-top:1rem"><div><div class="t">二〇二六年十一月　版本 2.13</div><button class="k4" type="button" data-top>回到题记</button></div><div class="k"><div class="v">肥肥 记</div><button class="seal" type="button" data-stamp aria-label="肥肥主义的印"><span>肥</span><span>肥</span><span>主</span><span>义</span></button></div></footer>')

comps['Sign'] = ('Brand', 300, '造的字：分层母版，跟着 c 上色', '''# Sign

造的字：样板字是分层母版，一层墨、一层不带颜色的厚涂起伏，起伏层跟着这件作品的 `c` 上色，十二支签都能用。

- 写法：`<span class="zi" role="img" aria-label="写全这张图的意思" style="--r:url(<relief 的地址>)"><i></i><img src="<ink 的地址>" alt=""></span>`。单独换签写 `--zc:var(--sign-jia)`。
- 样板字在资产组 `signs`：唱歌 one、转身 turn、传话 pass、记号 mark、走开 leave、人群 crowd、锁链 chain、三个圆 three，每个三个文件：原图、`_ink`、`_relief`。
- 加 `class="sign"` 时进视口自动抹开一次（1500ms `e-pull`）。
- 字上不贴标签；`aria-label` 写全意思，读屏和素材失败时都读得到。
- 人是一个圆点加一笔弧线，不画腿、不画脸；有方向的动作只有主角戴礼帽。物一到三笔，或负形。
''', '<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;align-items:end">' + zi('chain', label='三笔锁链：连着、拴住、防备') + zi('three', ';--zc:var(--sign-jia)', label='三个由小到大的圆') + zi('turn', ';--zc:var(--sign-geng)', label='一个人转身，戴着礼帽') + '</div><div class="cap t" style="margin-top:8px"><span>乙签 锁链</span><span>甲签 三个圆</span><span>庚签 转身</span></div>')

comps['BrushBars'] = ('Data', 280, '拉笔图表：横向笔画条，代码按数字拉出来', '''# BrushBars

拉笔图表：横向笔画条，长度严格按数值比例，从零开始，一张图内共用一个量程，准确数字写在行尾。

- 主色 `c` 只给每张图的最大值，其余是墨；多系列时其余用墨实心、斜线、空框三种纹理。
- 笔画由 bundle.js 的 `FF.ready` 拿到刮刀笔触（资产组 `strokes`），`FF.ribbon` 沿路径拉，1500ms `e-pull` 抹开；笔触没加载出来时退回实色矩形。
- 图下配原始表，数字用 `tiji`（JetBrains Mono）右对齐，并注明出处和单位。条差距很小时，以数字为准。
- 使用方提供：`<canvas>`（宽 1400 再用 CSS 缩小）、数据、出处。
''', '<div><canvas id="bars" width="1400" height="560" role="img" aria-label="示意的横向笔画图，第四项最大"></canvas><p class="note">示意数据。</p></div><script>(function(){const go=()=>FF.ready.then(T=>{const main=getComputedStyle(document.documentElement).getPropertyValue("--c").trim();const pull=(y,h,i,x0,x1,yy,p)=>{const set=h?T.main:T.pale;if(set&&set.length){FF.ribbon(y,set[i%set.length],FF.line([x0,yy],[x1,yy],60),58,p)}else{y.fillStyle=h?main:"#211C1C";y.fillRect(x0,yy-24,(x1-x0)*p,48)}};const D=[["第一项",40],["第二项",55],["第三项",48],["第四项",86,1]];const bc=document.getElementById("bars"),y=bc.getContext("2d");const bars=p=>{y.clearRect(0,0,bc.width,bc.height);y.textBaseline="middle";D.forEach(([n,v,h],i)=>{const yy=80+i*130,w=v/100*880;y.font="28px \\"Noto Serif SC\\",serif";y.fillStyle="#5C5650";y.fillText(n,0,yy);pull(y,h,i,330,330+w,yy,p);if(p>.98){y.font="26px \\"JetBrains Mono\\",monospace";y.fillStyle=h?main:"#211C1C";y.fillText(String(v),330+w+24,yy)}})};FF.play(bc,1500,FF.ease.pull,bars).then(()=>bars(1))});window.FF&&FF.ready?go():addEventListener("load",go)})()</script>')

for name, (group, h, sub, readme, body) in comps.items():
    w(f'components/{name}/README.md', readme)
    w(f'components/{name}/preview.html', f'<!-- @dsCard group="{group}" height={h} subtitle="{sub}" -->\n<!doctype html>\n<html lang="zh"><body>\n{body}\n</body></html>\n')

groups = [
    ('signs', 'm', '样板字和质地', '''# signs

样板字是分层母版：原图 `sign_<名字>.webp`、墨层 `_ink`、起伏层 `_relief`。网页里墨层放 `<img>`，起伏层作 `--r` 交给组件 Sign，跟着 `c` 上色；非网页出口用仓库的 `sprite.py tint` 按签出一张图。

| 字 | 意思 |
|---|---|
| one | 唱歌：人加一个向外放射的点 |
| turn | 转身，主角戴礼帽 |
| pass | 传话 |
| mark | 记号：一个颜色不同的点 |
| leave | 走开，主角戴礼帽 |
| crowd | 人群，极繁 |
| chain | 三笔锁链：安全、约束 |
| three | 三个由小到大的圆：三档 |

另有负形样板 `neg_helix.webp`（双螺旋，颜料块里刮出的空白）和质地样板 `fx_rough_bowl.webp`（手绘歪线的碗）、`fx_crayon_sum.webp`（蜡笔炭笔的「总和」）。原图都是乙签上色；透明底，直接放在 paper 上。
'''),
    ('strokes', 'l', '刮刀笔触', '''# strokes

st0～st5，六条中性灰的真实刮刀笔触。bundle.css 把它们挂在 `--ff-st0`～`--ff-st5`，bundle.js 沿路径拉成笔画（抹开、拉笔图表、线），再染成 `c` 或 `ink`。不直接当图片摆。
'''),
    ('btn', 'm', '长颜料块', '''# btn

`slab0～3`，四块长颜料，墨色 `_ink` 和浅色 `_pale` 各一套：甲、乙、丙、己按钮的颜料（bundle.css 已接好），也给流程图节点当颜料块，用 `border-image` 只拉长中间，两头的撕边不变形，代替画框。
'''),
    ('paper', 'm', '宣纸', '''# paper

宣纸。网页不用这些图：bundle.js 里的 paper.js 当场画纤维和云纹，画好之前、打印时退回 `paper` 平涂。`xuan_fiber`、`xuan_cloud` 两张小图留给不能跑脚本的出口；幻灯片、PDF、PPTX、静态图用一整张 `xuan_sheet.webp`（2560×1440）垫底。材质只铺最底一层，不贴在卡片和按钮上。
'''),
    ('motion', 'l', '动效雪碧图', '''# motion

图像模型画的雪碧图：`ring_strip.webp` 戊的彩铅圈 49 帧，`slash_strip.webp` 禁用斜杠 25 帧，`hatch.webp` 戊选中时的彩铅排线。bundle.css 已接好，组件 PencilRing 和所有 `disabled` 按钮自动用上。
'''),
    ('nav', 's', '导航伙伴', '''# nav

长页导航「厚涂扇」收起时的油彩伙伴：龙娘 `long0～5`、大肥鱼 `fish0～5`，每位六帧，从站着到成一摊。小肥封在 `xiaofei.js` 一个文件里，毛色和站姿每次随机，整只使用。伙伴保留原色，不算主色；只在长页导航和彩蛋里出现。
'''),
    ('partners', 'm', '彩蛋伙伴', '''# partners

白龙 `ψ(◦ ◦)ψ∿∿` 的像素雪碧图，一行 25 帧，只用于彩蛋：小概率路过（游过屏幕 14 秒，点它或按 Esc 就停）、加载和空页面探头、点某个字三下探头。正文和数据图里不放。所有伙伴共用一个出场位，一屏最多一只。
'''),
]
assetGroups = {}
for g, tile, _, readme in groups:
    w(f'assets/{g}/README.md', readme)
    files = {}
    order = []
    for path, (bid, sz) in ids.items():
        if path.split('/')[0] == g:
            n = path.split('/', 1)[1]
            files[n] = {'name': n, 'blob': bid, 'size': sz, 'type': 'image/webp'}
            order.append(n)
    assetGroups[g] = {'name': g, 'tile': tile, 'order': order, 'files': files}
shutil.copy(os.path.join(SRC, 'assets/nav/xiaofei.js'), os.path.join(P, 'assets/nav/xiaofei.js'))

w('DESIGN.md', rd('references/DESIGN.md'))

index = {
    'v': 3, 'layout': 'files', 'createdOnFiles': {'v': 1, 'at': CREATED},
    'title': '肥肥主义', 'namespace': 'FF', 'libraries': [],
    'sections': {}, 'groups': [g[0] for g in groups], 'assetGroups': assetGroups, 'blobs': {},
    'docs': {'readme': 'project/README.md', 'sections': []},
    'lastChange': {'by': '肥肥', 'at': NOW, 'via': 'GitHub · chaoRookie/feifei-ism@' + REF.split('@')[1], 'note': '从 feifei-ism 仓库同步：宪法、token、六套按钮和素材'},
}
w('design-system.json', json.dumps(index, ensure_ascii=False, indent=1))
print('ok', NOW)
shutil.copy(os.path.join(SP, 'system-readme.md'), os.path.join(P, 'README.md'))
os.makedirs(os.path.join(P, 'components/Cover'), exist_ok=True)
shutil.copy(os.path.join(SP, 'cover.html'), os.path.join(P, 'components/Cover/preview.html'))

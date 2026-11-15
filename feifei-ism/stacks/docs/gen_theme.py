import argparse
import json
import shutil
import subprocess
from pathlib import Path

from docx import Document
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.text import WD_LINE_SPACING
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Mm, Pt, RGBColor
from PIL import Image

HERE = Path(__file__).resolve().parent
SKILL = HERE.parents[1]
TOKENS = SKILL / "tokens" / "out" / "tokens.flat.json"
PAPER = SKILL / "assets" / "paper"
THEME = HERE / "theme"

SIGNS = {"Jia": "甲", "Yi": "乙", "Bing": "丙", "Ding": "丁", "Wu": "戊", "Ji": "己",
         "Geng": "庚", "Xin": "辛", "Ren": "壬", "Gui": "癸", "Zi": "子", "Chou": "丑"}

ROOT_PX = 16
SEAL_PAD = 0.09

GENERIC = {"serif", "sans-serif", "monospace", "ui-monospace", "cursive", "system-ui"}


def load(sign=None):
    t = json.loads(TOKENS.read_text())
    if sign:
        t["C"] = t["Sign" + sign]
    t["_sign"] = next((v for k, v in SIGNS.items() if t["Sign" + k].lower() == t["C"].lower()), "")
    return t


def stack(fonts):
    return ", ".join(f if f in GENERIC else f"'{f}'" for f in fonts)


def px(v):
    v = str(v)
    if v.endswith("rem"):
        return float(v[:-3]) * ROOT_PX
    if v.endswith("px"):
        return float(v[:-2])
    return float(v)


def unit(v, u):
    v = str(v)
    if not v.endswith(u):
        raise ValueError(f"{v} is not in {u}")
    return float(v[:-len(u)])


def body(t):
    v = unit(t["DocBody"], "pt")
    return int(v) if v.is_integer() else v


def mm(t, key):
    return unit(t[key], "mm")


def ratio(t, key):
    return px(t[key]) / px(t["FsBody"])


def pt(t, key):
    return round(ratio(t, key) * body(t), 2)


def seal_pt(t):
    return round(ratio(t, "SealSize") * body(t), 2)


def rgb(h):
    return RGBColor.from_string(h.lstrip("#")[:6].upper())


def hexu(h):
    return h.lstrip("#")[:6].upper()


def vars_css(t):
    pairs = [("paper", t["Paper"]), ("ink", t["Ink"]), ("ink-2", t["Ink2"]), ("ink-3", t["Ink3"]),
             ("line", t["Line"]), ("c", t["C"]), ("s-sunken", t["SSunken"]), ("s-raised", t["SRaised"]),
             ("f-t", stack(t["FT"])), ("f-b", stack(t["FB"])), ("f-e", stack(t["FE"])), ("f-m", stack(t["FM"])),
             ("fs-body", t["FsBody"]), ("fs-h1", t["FsH1"]), ("fs-h2", t["FsH2"]), ("fs-h3", t["FsH3"]),
             ("fs-h4", t["FsH4"]), ("fs-quote", t["FsQuote"]), ("fs-small", t["FsSmall"]),
             ("lh-body", t["LhBody"]), ("measure", t["Measure"]),
             ("seal-size", t["SealSize"]), ("seal-rotate", f"{t['SealRotate']}deg"), ("seal-char", t["SealChar"])]
    return ":root{color-scheme:light;" + ";".join(f"--{k}:{v}" for k, v in pairs) + "}\n"


SHARED = """*,*::before,*::after{box-sizing:border-box}
.tj{font-family:var(--f-m);font-size:var(--fs-small);color:var(--ink-3);letter-spacing:.04em;margin:0}
.zi{font-family:var(--f-t);font-weight:400;color:var(--ink);line-height:1;margin:0}
h1,h2,h3{font-family:var(--f-t);font-weight:400;color:var(--ink)}
h1{font-size:var(--fs-h1);line-height:1.15;letter-spacing:-.02em;text-wrap:balance}
.sub{color:var(--ink-3);margin:0}
h2{font-size:var(--fs-h2);line-height:1.3;letter-spacing:.02em}
h3{font-size:var(--fs-h3);line-height:1.4;letter-spacing:.02em}
h4{font-family:var(--f-b);font-weight:400;font-size:var(--fs-h4);color:var(--ink-3)}
strong,b,em{font-weight:400;font-style:normal;color:var(--ink)}
a{color:inherit;text-decoration:none;border-bottom:1px solid var(--ink-3)}
blockquote{margin-left:0;margin-right:0;padding:0;color:var(--ink);font-size:var(--fs-quote);line-height:1.7}
blockquote p{margin:0}
ol,ul{list-style:none;padding:0;counter-reset:n}
li{counter-increment:n;position:relative;padding-left:2em}
li::before{content:counter(n);position:absolute;left:0;top:.42em;font-family:var(--f-m);font-size:var(--fs-small);line-height:1.3;color:var(--ink-3)}
li p{margin:0}
table{border-collapse:collapse;font-size:var(--fs-h4)}
th{font-weight:400;font-size:var(--fs-small);color:var(--ink-3);padding:0 1.6em .5em 0;border-bottom:1px solid var(--line);vertical-align:bottom}
td{padding:.5em 1.6em 0 0;vertical-align:baseline}
th:last-child,td:last-child{padding-right:0}
.num,code{font-family:var(--f-m);font-size:.92em}
code{color:var(--ink)}
hr{border:0;height:1px;background:var(--line)}
.end{display:flex;justify-content:space-between;align-items:flex-end;border-top:1px solid var(--line);padding-top:1.2em}
.end .m{font-family:var(--f-m);font-size:var(--fs-small);color:var(--ink-3);line-height:1.8}
.k{display:flex;align-items:flex-end;gap:.6em}
.v{writing-mode:vertical-rl;font-size:var(--fs-small);letter-spacing:.3em;color:var(--ink)}
.seal{background:var(--c);color:var(--paper);font-family:var(--f-t);line-height:1.05;display:grid;grid-template-columns:1fr 1fr;place-items:center;transform:rotate(var(--seal-rotate))}
"""


def web_css(t):
    return vars_css(t) + SHARED + f"""html{{background:var(--paper)}}
body{{margin:0;min-height:100vh;color:var(--ink-2);font-family:var(--f-b);font-size:var(--fs-body);line-height:var(--lh-body);background-color:var(--paper);background-image:url(paper/xuan_fiber.webp),url(paper/xuan_cloud.webp);background-size:768px,1181px;background-blend-mode:multiply,multiply}}
main{{width:min(100% - 2.5rem,var(--measure));margin:0 0 0 clamp(1.25rem,14vw,12rem);padding:4rem 0 3rem}}
.zi{{font-size:calc(var(--fs-h1) * 2);margin-top:2.4rem}}
h1.title{{margin:1rem 0 .4rem;width:max-content;max-width:calc(100vw - 2.5rem)}}
.sub{{margin-bottom:3rem}}
p{{margin:0 0 1.5em}}
h2,h3{{margin:calc(var(--fs-body) * 3) 0 .6em}}
blockquote{{margin:2.4em 0}}
ol,ul{{margin:0 0 1.5em}}
li{{margin:.3em 0}}
table{{margin:2em 0}}
.end{{margin-top:6rem}}
.seal{{width:var(--seal-size);height:var(--seal-size);font-size:calc(var(--seal-size) * var(--seal-char));padding:calc(var(--seal-size) * {SEAL_PAD})}}
@media (max-width:640px){{main{{margin:0 auto}}}}
@media print{{body{{background-image:none}}}}
"""


def print_css(t):
    b = body(t)
    seal = seal_pt(t)
    return vars_css(t) + SHARED + f"""@page{{size:{t['DocPageW']} {t['DocPageH']};margin:{t['DocMargin']};@bottom-right{{content:counter(page);font-family:{stack(t['FM'])};font-size:{pt(t, 'FsSmall')}pt;color:{t['Ink3']}}}}}
@page:first{{@bottom-right{{content:none}}}}
html,body{{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
.pagedjs_page{{background-color:{t['Paper']};background-image:url(paper/xuan_sheet.webp);background-size:cover;background-position:center}}
body{{margin:0;color:var(--ink-2);font-family:var(--f-b);font-size:{t['DocBody']};line-height:{t['DocLh']}}}
.zi{{font-size:{round(pt(t, 'FsH1') * 2, 2)}pt;margin-top:{b * 2}pt}}
h1{{font-size:{pt(t, 'FsH1')}pt}}
h1.title{{margin:{b}pt 0 {b * .4}pt}}
.sub{{margin-bottom:{b * 3}pt}}
.tj,.end .m,th,.v,li::before{{font-size:{pt(t, 'FsSmall')}pt}}
p{{margin:0 0 {b * 1.5}pt;orphans:2;widows:2}}
h2{{font-size:{pt(t, 'FsH2')}pt}}
h3{{font-size:{pt(t, 'FsH3')}pt}}
h2,h3{{margin:{b * 3}pt 0 {b * .6}pt;break-after:avoid}}
blockquote{{font-size:{pt(t, 'FsQuote')}pt;margin:{b * 2.2}pt 0;break-inside:avoid}}
ol,ul{{margin:0 0 {b * 1.5}pt}}
li{{margin:{b * .3}pt 0}}
table{{font-size:{pt(t, 'FsH4')}pt;margin:{b * 1.8}pt 0;break-inside:avoid}}
.end{{margin-top:{b * 4}pt;break-inside:avoid}}
.seal{{width:{seal}pt;height:{seal}pt;font-size:{round(seal * t['SealChar'], 2)}pt;padding:{round(seal * SEAL_PAD, 2)}pt}}
"""


def fonts(el, family):
    rpr = el.get_or_add_rPr()
    for old in rpr.findall(qn("w:rFonts")):
        rpr.remove(old)
    rf = OxmlElement("w:rFonts")
    for a in ("w:ascii", "w:hAnsi", "w:eastAsia", "w:cs"):
        rf.set(qn(a), family)
    rpr.insert(0, rf)


def style_run(style, t, family_key, color_key, size_pt, underline=False):
    fonts(style.element, t[family_key][0])
    f = style.font
    f.bold = False
    f.italic = False
    f.color.rgb = rgb(t[color_key])
    if size_pt:
        f.size = Pt(size_pt)
    if underline:
        f.underline = True


def style_para(style, before, after, line=None, align=None, left=None):
    p = style.paragraph_format
    p.space_before = Pt(before)
    p.space_after = Pt(after)
    if line:
        p.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
        p.line_spacing = line
    if align is not None:
        p.alignment = align
    if left is not None:
        p.left_indent = Pt(left)
        p.right_indent = Pt(0)
        p.first_line_indent = Pt(0)
    pbdr = style.element.pPr.find(qn("w:pBdr")) if style.element.pPr is not None else None
    if pbdr is not None:
        style.element.pPr.remove(pbdr)


def get_style(doc, name, kind=WD_STYLE_TYPE.PARAGRAPH, base=None):
    try:
        return doc.styles[name]
    except KeyError:
        s = doc.styles.add_style(name, kind)
        if base:
            s.base_style = doc.styles[base]
        return s


def docx_defaults(doc, t):
    rpr = doc.styles.element.find(qn("w:docDefaults")).find(qn("w:rPrDefault")).find(qn("w:rPr"))
    for old in rpr.findall(qn("w:rFonts")):
        rpr.remove(old)
    rf = OxmlElement("w:rFonts")
    for a in ("w:ascii", "w:hAnsi", "w:eastAsia", "w:cs"):
        rf.set(qn(a), t["FB"][0])
    rpr.insert(0, rf)


def table_style(doc, t):
    el = doc.styles["Table"].element
    for sp in el.findall(qn("w:tblStylePr")):
        el.remove(sp)
    tbl_pr = el.find(qn("w:tblPr"))
    for old in tbl_pr.findall(qn("w:tblBorders")):
        tbl_pr.remove(old)
    borders = OxmlElement("w:tblBorders")
    for side in ("top", "left", "bottom", "right", "insideH", "insideV"):
        e = OxmlElement(f"w:{side}")
        e.set(qn("w:val"), "nil")
        borders.append(e)
    tbl_pr.append(borders)
    first = OxmlElement("w:tblStylePr")
    first.set(qn("w:type"), "firstRow")
    rpr = OxmlElement("w:rPr")
    color = OxmlElement("w:color")
    color.set(qn("w:val"), hexu(t["Ink3"]))
    size = OxmlElement("w:sz")
    size.set(qn("w:val"), str(round(pt(t, "FsSmall") * 2)))
    rpr.extend([color, size])
    tcpr = OxmlElement("w:tcPr")
    tcb = OxmlElement("w:tcBorders")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), "4")
    bottom.set(qn("w:color"), hexu(t["Line"]))
    tcb.append(bottom)
    tcpr.append(tcb)
    first.extend([rpr, tcpr])
    el.append(first)


def reference_docx(t, out):
    subprocess.run(["pandoc", "-o", str(out), "--print-default-data-file", "reference.docx"], check=True)
    doc = Document(str(out))
    b = body(t)
    lh = t["DocLh"]
    gap = b * 1.5
    docx_defaults(doc, t)
    sec = doc.sections[0]
    sec.page_width, sec.page_height = Mm(mm(t, "DocPageW")), Mm(mm(t, "DocPageH"))
    for side in ("left_margin", "right_margin", "top_margin", "bottom_margin"):
        setattr(sec, side, Mm(mm(t, "DocMargin")))
    for name in ("Normal", "Body Text", "First Paragraph", "Compact"):
        s = doc.styles[name]
        style_run(s, t, "FB", "Ink2", b)
    style_para(doc.styles["Normal"], 0, gap, lh)
    style_para(doc.styles["Body Text"], 0, gap, lh)
    style_para(doc.styles["First Paragraph"], 0, gap, lh)
    style_para(doc.styles["Compact"], b * .15, b * .15, lh)
    style_run(doc.styles["Title"], t, "FT", "Ink", pt(t, "FsH1"))
    style_para(doc.styles["Title"], b, b * .4, 1.15, 0)
    style_run(doc.styles["Subtitle"], t, "FB", "Ink3", b)
    style_para(doc.styles["Subtitle"], 0, b * 3, lh, 0)
    for name in ("Author", "Date"):
        style_run(doc.styles[name], t, "FM", "Ink3", pt(t, "FsSmall"))
        style_para(doc.styles[name], 0, b * .3, lh, 0)
    heads = {1: ("FT", "Ink", "FsH1", 1.15), 2: ("FT", "Ink", "FsH2", 1.3),
             3: ("FT", "Ink", "FsH3", 1.4), 4: ("FB", "Ink3", "FsH4", lh)}
    for lvl, (fam, col, key, lh) in heads.items():
        for name in (f"Heading {lvl}", f"Heading {lvl} Char"):
            style_run(doc.styles[name], t, fam, col, pt(t, key))
        style_para(doc.styles[f"Heading {lvl}"], b * 3, b * .6, lh)
    style_run(doc.styles["Title Char"], t, "FT", "Ink", pt(t, "FsH1"))
    style_run(doc.styles["Block Text"], t, "FB", "Ink", pt(t, "FsQuote"))
    style_para(doc.styles["Block Text"], b * 2.2, b * 2.2, 1.7, left=0)
    style_run(doc.styles["Verbatim Char"], t, "FM", "Ink", None)
    style_run(doc.styles["Hyperlink"], t, "FB", "Ink2", None, underline=True)
    for name in ("Table Caption", "Image Caption"):
        style_run(doc.styles[name], t, "FB", "Ink3", pt(t, "FsSmall"))
    num = get_style(doc, "Num", WD_STYLE_TYPE.CHARACTER)
    style_run(num, t, "FM", "Ink2", None)
    tiji = get_style(doc, "Tiji", WD_STYLE_TYPE.PARAGRAPH, "Normal")
    style_run(tiji, t, "FM", "Ink3", pt(t, "FsSmall"))
    style_para(tiji, 0, b, lh)
    zi = get_style(doc, "Zi", WD_STYLE_TYPE.PARAGRAPH, "Normal")
    style_run(zi, t, "FT", "Ink", round(pt(t, "FsH1") * 2, 2))
    style_para(zi, b * 2, 0, 1.0)
    end = get_style(doc, "Ji", WD_STYLE_TYPE.PARAGRAPH, "Normal")
    style_run(end, t, "FB", "Ink", pt(t, "FsSmall"))
    style_para(end, b * 4, b * .3, 1.2, 2)
    table_style(doc, t)
    doc.save(str(out))


def meta_yaml(t):
    return "\n".join([f"sign: \"{t['_sign']}\"", f"accent: \"{t['C']}\"", f"paper: \"{t['Paper']}\"", ""])


def build(sign=None):
    t = load(sign)
    THEME.mkdir(exist_ok=True)
    (THEME / "paper").mkdir(exist_ok=True)
    for name in ("xuan_fiber.webp", "xuan_cloud.webp", "xuan_sheet.webp"):
        shutil.copyfile(PAPER / name, THEME / "paper" / name)
    Image.open(PAPER / "xuan_sheet.webp").convert("RGB").save(THEME / "paper" / "xuan_sheet.jpg", quality=85)
    (THEME / "web.css").write_text(web_css(t))
    (THEME / "print.css").write_text(print_css(t))
    (THEME / "meta.yaml").write_text(meta_yaml(t))
    reference_docx(t, THEME / "reference.docx")
    return t


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--sign", choices=list(SIGNS))
    a = ap.parse_args()
    t = build(a.sign)
    print("theme ->", THEME, "sign", t["_sign"], t["C"])

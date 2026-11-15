import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

import fitz
from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn
from docx.shared import Pt

import gen_theme as g

HERE = g.HERE
OUT = HERE / "out"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PAGEDJS = HERE / "node_modules" / ".bin" / "pagedjs-cli"
POLYFILL = HERE / "node_modules" / "pagedjs" / "dist" / "paged.polyfill.js"
VML = 'xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"'


def run(cmd, **kw):
    print("$", " ".join(str(c) for c in cmd))
    return subprocess.run([str(c) for c in cmd], cwd=HERE, check=True, **kw)


def pandoc(src, out, *extra):
    run(["pandoc", src, "--metadata-file", "theme/meta.yaml", "--lua-filter", "num.lua", "-o", out, *extra])


def html(src, out, css):
    pandoc(src, out, "-t", "html5", "--standalone", "--embed-resources", "--template", "template.html",
           "--css", css, "--resource-path", "theme")


def stringify(v):
    if isinstance(v, list):
        return "".join(stringify(x) for x in v)
    if isinstance(v, dict):
        t = v.get("t")
        if t in ("Str", "MetaString"):
            return v["c"]
        if t in ("Space", "SoftBreak"):
            return " "
        return stringify(v.get("c", ""))
    return str(v) if v is not None else ""


def meta(src):
    j = json.loads(subprocess.run(["pandoc", src, "--metadata-file", "theme/meta.yaml", "-t", "json"],
                                  cwd=HERE, check=True, capture_output=True, text=True).stdout)
    return {k: stringify(v) for k, v in j["meta"].items()}


def para(doc, text, style):
    p = OxmlElement("w:p")
    ppr = OxmlElement("w:pPr")
    ps = OxmlElement("w:pStyle")
    ps.set(qn("w:val"), doc.styles[style].style_id)
    ppr.append(ps)
    p.append(ppr)
    r = OxmlElement("w:r")
    tx = OxmlElement("w:t")
    tx.text = text
    tx.set(qn("xml:space"), "preserve")
    r.append(tx)
    p.append(r)
    return p


def background(doc, t):
    rid, _ = doc.part.get_or_add_image(str(g.THEME / "paper" / "xuan_sheet.jpg"))
    paper = g.hexu(t["Paper"])
    bg = parse_xml(
        f'<w:background {nsdecls("w", "r")} {VML} w:color="{paper}">'
        f'<v:background id="_x0000_s1025" o:bwmode="white" fillcolor="#{paper}" o:targetscreensize="1024,768">'
        f'<v:fill r:id="{rid}" o:title="xuan" recolor="t" type="frame"/></v:background></w:background>')
    root = doc.element
    for old in root.findall(qn("w:background")):
        root.remove(old)
    root.insert(0, bg)
    settings = doc.settings.element
    if settings.find(qn("w:displayBackgroundShape")) is None:
        zoom = settings.find(qn("w:zoom"))
        el = OxmlElement("w:displayBackgroundShape")
        if zoom is not None:
            zoom.addnext(el)
        else:
            settings.insert(0, el)


def soften_strong(doc, t):
    for rpr in doc.element.body.iter(qn("w:rPr")):
        for tag in ("w:b", "w:bCs"):
            for b in rpr.findall(qn(tag)):
                rpr.remove(b)
                if rpr.find(qn("w:color")) is None:
                    c = OxmlElement("w:color")
                    c.set(qn("w:val"), g.hexu(t["Ink"]))
                    rpr.append(c)


def seal(doc, t):
    size = g.seal_pt(t)
    cell_tw = int(size / 2 * 20)
    tbl = doc.add_table(rows=2, cols=2)
    tbl.alignment = WD_TABLE_ALIGNMENT.RIGHT
    tbl.autofit = False
    tbl_pr = tbl._tbl.tblPr
    for tag in ("w:tblStyle",):
        for e in tbl_pr.findall(qn(tag)):
            tbl_pr.remove(e)
    tbl_pr.append(parse_xml(
        f'<w:tblBorders {nsdecls("w")}>' + "".join(
            f'<w:{s} w:val="nil"/>' for s in ("top", "left", "bottom", "right", "insideH", "insideV")) +
        '</w:tblBorders>'))
    tbl_pr.append(parse_xml(
        f'<w:tblCellMar {nsdecls("w")}><w:top w:w="0" w:type="dxa"/><w:left w:w="0" w:type="dxa"/>'
        f'<w:bottom w:w="0" w:type="dxa"/><w:right w:w="0" w:type="dxa"/></w:tblCellMar>'))
    tbl_pr.append(parse_xml(f'<w:tblLayout {nsdecls("w")} w:type="fixed"/>'))
    for i, ch in enumerate("肥肥主义"):
        row = tbl.rows[i // 2]
        row.height = Pt(size / 2)
        cell = row.cells[i % 2]
        cell.width = Pt(size / 2)
        tc_pr = cell._tc.get_or_add_tcPr()
        tc_pr.append(parse_xml(f'<w:shd {nsdecls("w")} w:val="clear" w:color="auto" w:fill="{g.hexu(t["C"])}"/>'))
        tc_pr.append(parse_xml(f'<w:vAlign {nsdecls("w")} w:val="center"/>'))
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        pf = p.paragraph_format
        pf.space_before = Pt(0)
        pf.space_after = Pt(0)
        pf.line_spacing = 1.0
        r = p.add_run(ch)
        g.fonts(r._r, t["FT"][0])
        r.font.size = Pt(round(size * t["SealChar"], 1))
        r.font.color.rgb = g.rgb(t["Paper"])
        r.font.bold = False
    for col in tbl._tbl.tblGrid.findall(qn("w:gridCol")):
        col.set(qn("w:w"), str(cell_tw))
    return tbl


def finish_docx(path, t, m):
    doc = Document(str(path))
    body = doc.element.body
    first = body[0]
    top = [para(doc, (m["tiji"] + " · " if m.get("tiji") else "") + "第" + t["_sign"] + "签", "Tiji")]
    if m.get("zi"):
        top.append(para(doc, m["zi"], "Zi"))
    for p in top:
        first.addprevious(p)
    soften_strong(doc, t)
    sect = body.find(qn("w:sectPr"))
    ji = para(doc, "你的名字 记", "Ji")
    tbl = seal(doc, t)
    sect.addprevious(ji)
    sect.addprevious(tbl._tbl)
    background(doc, t)
    doc.save(str(path))


def pdf(paged, out):
    env = dict(os.environ, PUPPETEER_EXECUTABLE_PATH=CHROME, PUPPETEER_SKIP_DOWNLOAD="1")
    if PAGEDJS.exists():
        try:
            run([PAGEDJS, paged, "-o", out, "--timeout", "120000"], env=env)
            return "pagedjs-cli"
        except subprocess.CalledProcessError as e:
            print("pagedjs-cli failed, falling back to Chrome", e, file=sys.stderr)
    tmp = OUT / "sample.paged.polyfill.html"
    src = Path(HERE / paged).read_text()
    tmp.write_text(src.replace("</head>", f"<script>{POLYFILL.read_text()}</script>\n</head>", 1))
    run([CHROME, "--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--virtual-time-budget=20000",
         "--run-all-compositor-stages-before-draw", f"--print-to-pdf={HERE / out}", tmp.as_uri()])
    tmp.unlink()
    return "chrome+paged.polyfill"


def previews():
    d = fitz.open(OUT / "sample.pdf")
    d[0].get_pixmap(dpi=110).save(OUT / "sample-pdf-p1.png")
    run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--window-size=1280,1700",
         "--virtual-time-budget=15000", f"--screenshot={OUT / 'sample-web.png'}", (OUT / "sample.html").as_uri()])
    return len(d)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src", nargs="?", default="sample.md")
    ap.add_argument("--sign", choices=list(g.SIGNS))
    ap.add_argument("--no-preview", action="store_true")
    a = ap.parse_args()
    t = g.build(a.sign)
    OUT.mkdir(exist_ok=True)
    stem = Path(a.src).stem
    m = meta(a.src)
    html(a.src, f"out/{stem}.html", "web.css")
    html(a.src, f"out/{stem}.paged.html", "print.css")
    pandoc(a.src, f"out/{stem}.docx", "--reference-doc", "theme/reference.docx")
    finish_docx(OUT / f"{stem}.docx", t, m)
    how = pdf(f"out/{stem}.paged.html", f"out/{stem}.pdf")
    print("pdf via", how)
    if not a.no_preview and stem == "sample":
        print("pdf pages", previews())


if __name__ == "__main__":
    main()
